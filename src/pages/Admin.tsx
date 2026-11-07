import { useEffect, useState } from "react";
import { analyticsSummary, clearEvents, clearLeads, deleteLead, downloadCsv, listEvents, listLeads, setLeadStatus, type Lead } from "../lib/leads";
import { siteConfig } from "../lib/siteConfig";
import { buildWhatsAppLink, normalizePhone } from "../lib/whatsapp";
import { Eyebrow } from "../components/ui/Reveal";
import { IconWhatsApp } from "../components/ui/Icons";
import { cn } from "../lib/utils";

/**
 * LOCAL leads & analytics desk.
 *
 * This SPA has no server runtime, so leads and events are stored in the
 * browser (and POSTed to `${VITE_API_BASE}/api/leads|events` when that env var
 * is set at build time). Everything shown here is real saved data — not a mock.
 * For a multi-device admin with login, wire a backend to that contract and
 * protect it (see README → Backend).
 */
export default function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<"all" | Lead["status"]>("all");
  const [summary, setSummary] = useState(analyticsSummary());

  const refresh = () => {
    setLeads(listLeads());
    setSummary(analyticsSummary());
  };

  useEffect(refresh, []);

  const shown = leads.filter((l) => filter === "all" || l.status === filter);
  const events = listEvents().slice(0, 40);
  const hasBackend = !!siteConfig.endpoints.apiBase;

  return (
    <main className="relative min-h-[100svh] bg-obsidian pt-28 text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36vh]" style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(23,98,79,0.4), transparent 70%)" }} aria-hidden="true" />

      <div className="relative mx-auto max-w-[1400px] px-[var(--gut)] pb-24">
        <Eyebrow>Private desk</Eyebrow>
        <h1 className="display mt-5 text-[clamp(2.4rem,7vw,5rem)] leading-[0.88]">
          Leads & <span className="serif-it text-gold">analytics</span>
        </h1>

        <div
          className={cn(
            "mt-6 rounded-xl border p-4 text-xs leading-relaxed",
            hasBackend ? "border-emerald bg-emerald/15 text-ivory" : "border-dashed border-line text-mist",
          )}
        >
          {hasBackend ? (
            <>Backend connected — leads and events are also POSTed to {siteConfig.endpoints.apiBase}.</>
          ) : (
            <>
              No <code className="text-gold">VITE_API_BASE</code> set at build time, so records are stored in this
              browser only (localStorage) and are not shared between devices. This view is not a secure admin area:
              put real authentication and a database behind the documented API contract before using it with clients.
            </>
          )}
        </div>

        {/* summary */}
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Leads saved", summary.leads],
            ["New leads", summary.newLeads],
            ["WhatsApp clicks", summary.whatsappClicks],
            ["Call clicks", summary.callClicks],
            ["Events recorded", listEvents().length],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl border border-line bg-graphite p-5">
              <dt className="label text-mist/70">{k}</dt>
              <dd className="num display mt-2 text-3xl text-gold">{v as number}</dd>
            </div>
          ))}
        </dl>

        {summary.topProperties.length > 0 && (
          <div className="mt-6 rounded-xl border border-line bg-graphite p-5">
            <p className="label text-mist/70">Most-clicked properties</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {summary.topProperties.map(([title, n]) => (
                <li key={title} className="rounded-full border border-line px-3 py-1.5 text-xs">
                  {title} <span className="num ml-1 text-gold">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* leads table */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          {(["all", "new", "contacted", "closed"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className="pill !min-h-10" data-active={filter === f}>
              {f}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadCsv()} className="pill !min-h-10" disabled={!leads.length}>
              Export CSV
            </button>
            <button type="button" onClick={refresh} className="pill !min-h-10">
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                clearLeads();
                clearEvents();
                refresh();
              }}
              className="pill !min-h-10 hover:!border-alert hover:!text-alert"
            >
              Clear local data
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[1.2rem] border border-line" data-lenis-prevent>
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="bg-graphite text-mist">
              <tr>
                {["When", "Name", "Phone", "Interest", "Budget", "Property", "Source", "Status", ""].map((h) => (
                  <th key={h} className="label whitespace-nowrap px-4 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-mist">
                    No leads saved yet. Submit the contact form or a booking request and they appear here.
                  </td>
                </tr>
              )}
              {shown.map((l) => (
                <tr key={l.id} className="border-t border-line bg-obsidian/40 align-top">
                  <td className="num whitespace-nowrap px-4 py-3 text-xs text-mist">
                    {new Date(l.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="num whitespace-nowrap px-4 py-3">{l.phone}</td>
                  <td className="px-4 py-3 text-mist">{l.interest || "—"}</td>
                  <td className="px-4 py-3 text-mist">{l.budget || "—"}</td>
                  <td className="px-4 py-3 text-mist">{l.propertyTitle || "—"}</td>
                  <td className="px-4 py-3 text-xs text-mist">{l.source}</td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status}
                      onChange={(e) => {
                        setLeadStatus(l.id, e.target.value as Lead["status"]);
                        refresh();
                      }}
                      className="rounded-full border border-line bg-graphite px-3 py-1.5 text-xs"
                      aria-label={`Status for ${l.name}`}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={buildWhatsAppLink({
                        phone: normalizePhone(l.phone),
                        message: `Assalam o Alaikum ${l.name}, this is Bilal from Bilal Estate about your enquiry${
                          l.propertyTitle ? ` on ${l.propertyTitle}` : ""
                        }. ${l.message ? `\n\nYou wrote: ${l.message}` : ""}`,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-full border border-wa/45 text-wa transition-colors hover:bg-wa hover:text-obsidian"
                      aria-label={`Reply to ${l.name} on WhatsApp`}
                    >
                      <IconWhatsApp className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* event log */}
        <h2 className="display mt-14 text-3xl">Event log</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 && <li className="text-sm text-mist">No events recorded yet.</li>}
          {events.map((e) => (
            <li key={e.id} className="rounded-lg border border-line bg-graphite/60 px-4 py-3 text-xs text-mist">
              <span className="num text-gold">{e.type}</span>
              {e.placement ? <span> · {e.placement}</span> : null}
              {e.propertyTitle ? <span> · {e.propertyTitle}</span> : null}
              <span className="num mt-1 block text-[0.65rem] text-mist/60">
                {new Date(e.at).toLocaleString("en-GB")} · {e.page}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-mist/60">
          To delete a single lead, clear it from localStorage or wire the documented API contract. Leads are capped at
          500 locally and events at 400.
        </p>
        <button
          type="button"
          onClick={() => {
            const id = window.prompt("Paste the lead id to delete");
            if (id) {
              deleteLead(id.trim());
              refresh();
            }
          }}
          className="pill mt-3 !min-h-10"
        >
          Delete a lead by id
        </button>
      </div>
    </main>
  );
}
