import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { owner, posts, site } from "../data/content";
import OwnerPortrait from "../components/ui/OwnerPortrait";
import NotFound from "./NotFound";
import { Eyebrow, RevealImage, SplitLines } from "../components/ui/Reveal";
import { IconArrowRight, IconArrowUpRight, IconWhatsApp } from "../components/ui/Icons";
import { buildWhatsAppLink, readTime, trackWhatsAppClick, waMessages } from "../lib/utils";

export function BlogIndex() {
  const [lead, ...rest] = posts;
  return (
    <main className="relative bg-obsidian pt-24 text-ivory sm:pt-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[45vh]"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(23,98,79,0.45), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <Eyebrow>Insights from the desk</Eyebrow>
        <SplitLines
          as="h1"
          className="display mt-6 text-[clamp(2.8rem,10vw,8.5rem)] leading-[0.84]"
          lines={[
            <span key="1">Notes, checklists</span>,
            <span key="2" className="serif-it text-gold">and honest warnings</span>,
          ]}
        />
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">
          Written by the desk that handles the files. Drafts are marked as drafts — review them before publishing as
          advice, and confirm any tax or rate figure with a qualified professional.
        </p>

        <Link to={`/blog/${lead.slug}`} className="group mt-14 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <RevealImage
            src={lead.cover}
            alt={lead.title}
            className="aspect-[16/10] w-full rounded-[1.4rem] lg:aspect-[4/3]"
            imgClassName="transition-transform duration-[1400ms] group-hover:scale-105"
            ken={false}
          />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="label rounded-full border border-line px-3 py-1.5 text-gold">{lead.category}</span>
              {lead.draft && <span className="label rounded-full border border-dashed border-line px-3 py-1.5 text-mist">Draft</span>}
              <span className="label text-mist/70">
                {new Date(lead.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} · {readTime(lead.body.join(" "))} min
              </span>
            </div>
            <h2 className="display mt-5 text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[0.94] transition-colors group-hover:text-gold">
              {lead.title}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-mist">{lead.excerpt}</p>
            <span className="label mt-6 inline-flex items-center gap-2 text-gold">
              Read the piece <IconArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <div className="mt-16 grid gap-8 border-t border-line pt-12 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/blog/${p.slug}`} className="group block">
                <RevealImage
                  src={p.cover}
                  alt={p.title}
                  className="aspect-[16/10] w-full rounded-xl"
                  imgClassName="transition-transform duration-[1200ms] group-hover:scale-105"
                  ken={false}
                />
                <p className="label mt-4 text-gold">
                  {p.category} · {new Date(p.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </p>
                <h3 className="display mt-2 text-[clamp(1.3rem,2.6vw,1.9rem)] leading-tight transition-colors group-hover:text-gold">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mist">{p.excerpt}</p>
                <span className="label mt-4 inline-flex items-center gap-2 text-mist/70 transition-colors group-hover:text-gold">
                  {readTime(p.body.join(" "))} min <IconArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 mb-20 flex flex-wrap items-center justify-between gap-4 rounded-[1.3rem] border border-line bg-graphite p-7">
          <div>
            <p className="label text-gold">One email a month</p>
            <h3 className="display mt-2 text-3xl leading-none">Society-by-society price movement</h3>
            <p className="todo mt-2 text-xs">TODO_ADD_NEWSLETTER_PROVIDER — wire the signup to your email service</p>
          </div>
          <a href={`mailto:${site.email}?subject=Subscribe%20to%20the%20monthly%20file`} className="pill !min-h-12">
            Subscribe by email <IconArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </main>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | ${site.name}`;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: post.cover,
      datePublished: post.date,
      author: { "@type": "Organization", name: site.name },
      publisher: { "@type": "Organization", name: site.name },
      inLanguage: "en-PK",
    });
    document.head.appendChild(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [post]);

  if (!post) return <NotFound />;

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const wa = buildWhatsAppLink({ message: waMessages.post(post.title) });

  return (
    <main className="relative bg-obsidian pt-24 text-ivory sm:pt-28">
      <article className="relative mx-auto max-w-[1600px] px-[var(--gut)]">
        <Link to="/blog" className="label inline-flex items-center gap-2 text-mist/70 transition-colors hover:text-gold">
          <IconArrowRight className="h-3.5 w-3.5 rotate-180" /> All insights
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="label rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-gold">{post.category}</span>
          {post.draft && <span className="label rounded-full border border-dashed border-line px-3 py-1.5 text-mist">Draft — review before publishing</span>}
          <span className="label text-mist/70">
            {new Date(post.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} · {readTime(post.body.join(" "))} min read
          </span>
        </div>

        <h1 className="display mt-5 max-w-[24ch] text-[clamp(2.2rem,7vw,5.6rem)] leading-[0.88]">{post.title}</h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="serif-it max-w-2xl text-[clamp(1.1rem,2.4vw,1.6rem)] leading-snug text-ivory/85">{post.excerpt}</p>
          <div className="flex items-center gap-3">
            <OwnerPortrait size="sm" caption={false} />
            <div>
              <p className="text-sm text-ivory">{post.author}</p>
              <p className="label mt-1 text-mist/70">{owner.role}</p>
            </div>
          </div>
        </div>

        <RevealImage src={post.cover} alt={post.title} className="mt-10 aspect-[16/8] w-full rounded-[1.4rem]" />

        <div className="mx-auto mt-12 max-w-3xl">
          {post.body.map((para, i) =>
            i === 1 ? (
              <div key={i}>
                <p className="mb-6 text-[1.05rem] leading-[1.85] text-mist">{para}</p>
                <blockquote className="my-10 border-l-2 border-gold pl-6">
                  <p className="serif-it text-[clamp(1.3rem,3vw,2rem)] leading-snug text-ivory/90">
                    “Verify the file in person, or pay someone to stand at the counter for you.”
                  </p>
                  <footer className="label mt-3 text-mist/70">{site.name} desk</footer>
                </blockquote>
              </div>
            ) : (
              <p
                key={i}
                className={i === 0 ? "mb-6 text-[1.15rem] font-medium leading-[1.75] text-ivory" : "mb-6 text-[1.05rem] leading-[1.85] text-mist"}
              >
                {para}
              </p>
            ),
          )}

          <div className="mt-12 flex flex-wrap items-center gap-3 rounded-[1.3rem] border border-line bg-graphite p-6">
            <div className="min-w-0 flex-1">
              <p className="label text-gold">Discuss this</p>
              <p className="mt-2 text-sm text-mist">
                Send the piece to {owner.name} on WhatsApp — happy to talk specifics about your own file.
              </p>
            </div>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-wa={`blog_${post.slug}`}
              onClick={() => trackWhatsAppClick({ placement: "blog_post" })}
              className="pill !min-h-12 !bg-wa !border-transparent !text-obsidian hover:!opacity-90"
            >
              <IconWhatsApp className="h-4 w-4" /> Message us
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-t border-line pt-12 md:grid-cols-2">
          {related.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex gap-5">
              <RevealImage src={p.cover} alt={p.title} className="h-28 w-40 shrink-0 rounded-xl" ken={false} />
              <div className="min-w-0">
                <p className="label text-gold">{p.category}</p>
                <h3 className="display mt-2 text-xl leading-tight transition-colors group-hover:text-gold">{p.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-mist">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </article>
      <div className="h-20" />
    </main>
  );
}
