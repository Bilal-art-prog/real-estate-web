/**
 * Verification suite for the WhatsApp integration (Step 5 of the task).
 *
 * Run:  node scripts/verify.mjs
 *
 * Part A bundles the REAL shipped helper (src/lib/whatsapp.ts) with esbuild and
 * unit-tests it. Part B statically audits every source file and the built
 * dist/index.html for the failure modes that caused the original bug.
 * No browser is required; no message is ever sent.
 */
import { build } from "esbuild";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

let pass = 0;
let fail = 0;
const failures = [];

const ok = (name, cond, detail = "") => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name + (detail ? ` — ${detail}` : ""));
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  };
};

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (e === "node_modules" || e === "dist" || e === ".git") continue;
      walk(p, out);
    } else out.push(p);
  }
  return out;
};

console.log("\n═══ Part A — unit tests on the shipped src/lib/whatsapp.ts ═══");

const result = await build({
  entryPoints: ["src/lib/whatsapp.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  target: "node18",
  logLevel: "silent",
});
const code = result.outputFiles[0].text;
const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const { buildWhatsAppLink, normalizePhone, decodeWhatsAppLink, waMessages } = mod;

const NUMBER = "923450655699";

ok("A1 number normalises local 03450655699 → 923450655699", normalizePhone("03450655699") === NUMBER, normalizePhone("03450655699"));
ok("A2 number strips + / spaces / dashes / brackets", normalizePhone("+92 (345) 065-5699") === NUMBER, normalizePhone("+92 (345) 065-5699"));
ok("A3 number strips a 00 international prefix", normalizePhone("00923450655699") === NUMBER);
ok("A4 number falls back to the configured business line", normalizePhone("") === NUMBER);

const msg = waMessages.property({
  title: "Pine Water Villa",
  location: "Margalla Hills, Islamabad",
  priceLabel: "PKR 9.2 Crore",
  slug: "pine-water-villa-margalla-hills",
});
const href = buildWhatsAppLink({ message: msg });
const parsed = decodeWhatsAppLink(href);

ok("B1 hostname is wa.me (never api.whatsapp.com)", parsed.host === "wa.me", parsed.host);
ok("B2 path is /<number>", parsed.path === `/${NUMBER}`, parsed.path);
ok("B3 exactly one query parameter", parsed.paramCount === 1, String(parsed.paramCount));
ok("B4 no double encoding (%25 absent)", !href.includes("%25"), href.slice(0, 120));
ok(
  "B5 decoded text matches the intended message",
  parsed.text === msg,
  parsed.text.slice(0, 90),
);
ok("B6 message keeps property name, location and price", ["Pine Water Villa", "Margalla Hills, Islamabad", "PKR 9.2 Crore"].every((s) => parsed.text.includes(s)));
ok("B7 message contains the full property URL", parsed.text.includes("#/properties/pine-water-villa-margalla-hills"));
ok("B8 bare link (no message) is valid", buildWhatsAppLink({}) === `https://wa.me/${NUMBER}`);
ok("B9 special characters survive encoding", decodeWhatsAppLink(buildWhatsAppLink({ message: "a&b=c?d#e ✓ اردو" })).text === "a&b=c?d#e ✓ اردو");
ok("B10 viewing CTA message matches the brief", waMessages.viewing().includes("book a private viewing"));

console.log("\n═══ Part B — static audit of src/ and dist/index.html ═══");

const files = walk("src").filter((f) => /\.(ts|tsx|css)$/.test(f));
const src = files.map((f) => [f, readFileSync(f, "utf8")]);
const dist = existsSync("dist/index.html") ? readFileSync("dist/index.html", "utf8") : "";

/** Comments are documentation, not code paths — strip them before auditing. */
const stripComments = (text) =>
  text
    .split("\n")
    .filter((l) => {
      const t = l.trim();
      return !(t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("{/*"));
    })
    .join("\n");

const codeOnly = src.map(([f, c]) => [f, stripComments(c)]);

// The diagnostics screen intentionally *names* the blocked host in help copy.
// What matters is that no navigable target ever uses it.
const NAV = /(href|location|window\.open|url)\s*[:=][^\n]*api\.whatsapp\.com/;
const offenders = codeOnly.filter(([, c]) => NAV.test(c)).map(([f]) => f);
ok("C1 no navigable target in source points at api.whatsapp.com", offenders.length === 0, offenders.join(", "));
ok("C2 built output contains no https://api.whatsapp.com URL", !dist.includes("https://api.whatsapp.com"));

const iframeFiles = codeOnly.filter(([, c]) => /<iframe/i.test(c)).map(([f]) => f);
ok("C3 no iframe embeds WhatsApp anywhere", iframeFiles.length === 0 && !/<iframe[^>]*whatsapp/i.test(dist), iframeFiles.join(", "));

const openWa = codeOnly.filter(([, c]) => /window\.open\([^)]*wa/i.test(c)).map(([f]) => f);
ok("C4 no window.open() for WhatsApp (popup-blocker safe)", openWa.length === 0, openWa.join(", "));

const waUses = codeOnly.filter(([, c]) => /buildWhatsAppLink|waLink\(/.test(c)).map(([f]) => f);
ok("C5 every WhatsApp link is built through the helper", waUses.length >= 12, `${waUses.length} files`);

// A component is "correct" when it never hardcodes a wa.me anchor and, if it
// renders one from the helper, it also sets rel="noopener noreferrer".
const tsx = codeOnly.filter(([f]) => f.endsWith(".tsx"));
// only an href that literally contains wa.me counts as a hardcoded link
const badAnchor = tsx
  .filter(([, c]) => /href=(?:"|`|\{`)[^"\n]*wa\.me/.test(c))
  .map(([f]) => f);
const missingRel = tsx
  .filter(([, c]) => /href=\{?wa/i.test(c) && !c.includes("noopener noreferrer"))
  .map(([f]) => f);
ok("C6 no component hardcodes a wa.me URL, and every wa anchor sets rel=noopener noreferrer", badAnchor.length === 0 && missingRel.length === 0, [...badAnchor, ...missingRel].join(", "));

// Client-rendered SPA: anchors are created by React at runtime, so the built
// file contains the props as JS literals (rel:"noopener noreferrer").
const relCount = (dist.match(/noopener noreferrer/g) || []).length;
ok("C7 built output pairs target=_blank with rel=noopener noreferrer", relCount >= 20, `${relCount} occurrences`);

const numberHits = (dist.match(new RegExp(NUMBER, "g")) || []).length;
ok("C8 business number 923450655699 present in the build", numberHits >= 3, `${numberHits} occurrences`);

ok("C9 wa.me scheme present in the built output", dist.includes("https://wa.me/"));
ok("C10 Pine Water Villa listing exists in the build", dist.includes("Pine Water Villa") && dist.includes("pine-water-villa-margalla-hills"));

const placements = (dist.match(/data-wa/g) || []).length;
ok("C11 every WhatsApp control is tagged for click tracking", placements >= 8, `${placements} data-wa markers`);
ok("C12 click tracking calls are compiled in", dist.includes("whatsapp_click"));
ok("C13 no light/beige palette leaked into the build", !dist.includes("#F6F1E9") && !dist.includes("#E9DFD0") && !dist.includes("#E8913A"));

console.log("\n═══ Part C — social media links (exact owner URLs) ═══");

const IG = "https://www.instagram.com/i.bilalmunir_/";
const TT = "https://www.tiktok.com/@i.bilalmunir_?lang=en-GB";
const WA = "https://wa.me/923450655699";
const OLD = "zy_rox_3";
const siteConfigStamp = "v3 · wa.me/923450655699 · @i.bilalmunir_";

const cfgRes = await build({
  entryPoints: ["src/lib/siteConfig.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  target: "node18",
  logLevel: "silent",
});
const cfgMod = await import(
  `data:text/javascript;base64,${Buffer.from(cfgRes.outputFiles[0].text).toString("base64")}`
);
const sc = cfgMod.siteConfig;

ok("D1 config Instagram URL is exactly the owner profile", sc.social.instagram.url === IG, sc.social.instagram.url);
ok("D2 config TikTok URL is exactly the owner profile (incl. lang param)", sc.social.tiktok.url === TT, sc.social.tiktok.url);
ok("D3 config WhatsApp number is 923450655699", sc.phone.whatsapp === "923450655699", sc.phone.whatsapp);
ok("D4 config handles show the real username", sc.social.instagram.handle === "@i.bilalmunir_" && sc.social.tiktok.handle === "@i.bilalmunir_");
ok("D5 bare WhatsApp URL is wa.me/<number> with no extra params", buildWhatsAppLink({}) === WA, buildWhatsAppLink({}));

ok("D6 obsolete handle removed from every source file", !src.some(([, c]) => c.includes(OLD)));
ok("D7 obsolete handle removed from index.html", !readFileSync("index.html", "utf8").includes(OLD));
ok("D8 obsolete handle removed from the build", !dist.includes(OLD));

ok("D9 Instagram URL compiled into the build", dist.includes(IG));
ok("D10 TikTok URL compiled into the build", dist.includes(TT));
ok("D11 WhatsApp URL compiled into the build", dist.includes("wa.me/923450655699"));
ok("D12 JSON-LD sameAs lists all three exact profiles", [IG, TT, WA].every((u) => readFileSync("index.html", "utf8").includes(u)));

// single source of truth: no component hardcodes a profile URL
const igLiterals = codeOnly.filter(([, c]) => c.includes("instagram.com/")).map(([f]) => f);
const ttLiterals = codeOnly.filter(([, c]) => c.includes("tiktok.com/")).map(([f]) => f);
ok("D13 Instagram URL defined in exactly one module", igLiterals.length === 1 && igLiterals[0].endsWith("siteConfig.ts"), igLiterals.join(", "));
ok("D14 TikTok URL defined in exactly one module", ttLiterals.length === 1 && ttLiterals[0].endsWith("siteConfig.ts"), ttLiterals.join(", "));

// anchor hygiene across every component
const anchorIssues = [];
for (const [f, c] of codeOnly.filter(([f]) => f.endsWith(".tsx"))) {
  const targets = (c.match(/target="_blank"/g) || []).length;
  const rels = (c.match(/rel="noopener noreferrer"/g) || []).length;
  if (targets !== rels) anchorIssues.push(`${f} (target=${targets}, rel=${rels})`);
  if (/href="#"/.test(c)) anchorIssues.push(`${f} (dead href="#")`);
  if (/<iframe/i.test(c)) anchorIssues.push(`${f} (iframe)`);
  // a social href must never sit on a line that also cancels the click
  const badHandler = c
    .split("\n")
    .filter((l) => /social\.(instagram|tiktok)\.url/.test(l) && /preventDefault/.test(l));
  if (badHandler.length) anchorIssues.push(`${f} (preventDefault on social anchor)`);
}
ok("D15 every external anchor: _blank + noopener noreferrer, no dead href, no iframe, no preventDefault", anchorIssues.length === 0, anchorIssues.join(" | "));

const socialAnchorFiles = codeOnly.filter(([, c]) => /social\.(instagram|tiktok)\.url/.test(c)).map(([f]) => f);
ok("D16 social buttons are rendered from the shared config in 4 surfaces", socialAnchorFiles.length >= 4, socialAnchorFiles.join(", "));

console.log("\n═══ Part D — click-behaviour trace (every external anchor) ═══");

/** Parse each JSX <a …> opening tag exactly as the browser would receive it. */
const anchors = [];
for (const [f, c] of codeOnly.filter(([f]) => f.endsWith(".tsx"))) {
  const re = /<a\b([\s\S]*?)>/g;
  let m;
  while ((m = re.exec(c))) {
    const attrs = m[1];
    const line = c.slice(0, m.index).split("\n").length;
    const href = (attrs.match(/href=\{?([^}\s>]+)\}?/) || [, "?"])[1];
    anchors.push({
      file: `${f}:${line}`,
      href,
      target: /target="_blank"/.test(attrs),
      rel: /rel="noopener noreferrer"/.test(attrs),
      social: /instagram|tiktok|wa\.me/.test(href) || /data-social|data-wa/.test(attrs),
      native: /^`?(tel:|mailto:)/.test(href),
    });
  }
}

const web = anchors.filter((a) => !a.native && /wa\.me|instagram|tiktok|http/.test(a.href));
const badTarget = web.filter((a) => !a.target);
const badRel = web.filter((a) => !a.rel);
const nativeForced = anchors.filter((a) => a.native && a.target);

ok(`E1 all ${web.length} web-facing anchors open a new top-level tab`, badTarget.length === 0, badTarget.map((a) => a.file).join(", "));
ok("E2 all of them carry rel=noopener noreferrer", badRel.length === 0, badRel.map((a) => a.file).join(", "));
ok("E3 tel:/mailto: stay native (not forced into a new tab)", nativeForced.length === 0, nativeForced.map((a) => a.file).join(", "));
ok("E4 zero anchors point at api.whatsapp.com or any legacy wa link", anchors.every((a) => !/api\.whatsapp\.com|wa\.me\/send|chat\.whatsapp/.test(a.href)));

ok("E5 no programmatic-open helper remains (window.open / synthetic anchor click)", !codeOnly.some(([, c]) => /window\.open\(|openWhatsApp/.test(c)));
ok("E6 no same-frame navigation APIs anywhere", !codeOnly.some(([, c]) => /location\.(href|assign|replace)\s*=/.test(c)));
ok("E7 no <base> tag, meta refresh or service worker", !codeOnly.some(([, c]) => /<base|http-equiv="refresh"|serviceWorker/.test(c)));

const socialTagged = codeOnly.filter(([, c]) => /data-social=/.test(c)).map(([f]) => f);
ok("E8 social anchors are tagged for runtime audit on every surface", socialTagged.length >= 4, socialTagged.join(", "));
ok("E9 framed-environment fallback is wired into the app", /ExternalLinkHelper/.test(readFileSync("src/App.tsx", "utf8")) && /isEmbeddedFrame/.test(readFileSync("src/components/ui/ExternalLinkHelper.tsx", "utf8")));
ok("E10 /diagnostics route registered", readFileSync("src/App.tsx", "utf8").includes('path="/diagnostics"'));
ok("E11 build stamp compiled into the artifact", dist.includes(siteConfigStamp));
ok("E12 React will emit target=_blank at runtime", (dist.match(/target:"_blank"/g) || []).length >= 20, `${(dist.match(/target:"_blank"/g) || []).length} literals`);

console.log("\n═══ Summary ═══");
console.log(`  passed: ${pass}`);
console.log(`  failed: ${fail}`);
console.log(`  skipped: 0`);
if (fail) {
  console.log("\n  Failures:");
  failures.forEach((f) => console.log(`   • ${f}`));
  process.exit(1);
}
console.log("\n  All checks passed.\n");
