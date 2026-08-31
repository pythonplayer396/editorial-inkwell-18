import type { Block } from "@/lib/blocks";

function Paragraph({ text }: { text: string }) {
  return <p>{text}</p>;
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-article">
      {blocks.map((block, i) => {
        const key = block.id ?? i;
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={key}
                id={`section-${i}`}
                className="headline mt-14 mb-5 scroll-mt-16 text-[1.8rem] leading-snug text-foreground sm:text-[2.1rem]"
              >
                {block.text}
              </h2>
            );
          case "subheading":
            return (
              <h3 key={key} className="mt-9 mb-3 font-sans text-base font-semibold tracking-tight">
                {block.text}
              </h3>
            );
          case "quote":
            return (
              <figure key={key} className="my-12 border-l-2 border-accent bg-breaking-surface/60 px-6 py-7">
                <blockquote className="headline text-2xl leading-snug text-foreground sm:text-3xl">
                  {block.text}
                </blockquote>
                {block.attribution ? (
                  <figcaption className="mt-3 font-sans text-sm text-muted-foreground">
                    {block.attribution}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "list":
            return (
              <ul key={key} className="my-6 space-y-2 pl-5">
                {(block.items ?? []).map((item, idx) => (
                  <li key={idx} className="list-disc marker:text-accent">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "image":
            return block.url ? (
              <figure key={key} className="image-reveal my-12">
                <img
                  src={block.url}
                  alt={block.alt || block.caption || ""}
                  loading="lazy"
                  decoding="async"
                   className="w-full object-cover"
                />
                {(block.caption || block.credit) && (
                  <figcaption className="mt-2 flex flex-wrap gap-x-3 font-sans text-xs leading-relaxed text-muted-foreground">
                    {block.caption ? <span>{block.caption}</span> : null}
                    {block.credit ? <span className="text-muted-foreground/80">{block.credit}</span> : null}
                  </figcaption>
                )}
              </figure>
            ) : null;
          case "gallery": {
            const images = (block.images ?? []).filter((g) => g.url);
            if (!images.length) return null;
            return (
              <figure key={key} className="image-reveal my-12">
                <div
                  className={`grid gap-2 ${
                    images.length === 1
                      ? "grid-cols-1"
                      : images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 md:grid-cols-3"
                  }`}
                >
                  {images.map((g, idx) => (
                    <img
                      key={`${g.url}-${idx}`}
                      src={g.url}
                      alt={g.alt || g.caption || ""}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full bg-muted object-cover"
                    />
                  ))}
                </div>
                {block.caption ? (
                  <figcaption className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case "callout":
            return (
              <aside
                key={key}
                 className="my-10 border-y border-secondary-accent/25 bg-secondary-accent-soft/45 px-5 py-5 font-sans text-[0.95rem] leading-relaxed text-foreground"
              >
                {block.text}
              </aside>
            );
          case "divider":
             return <hr key={key} className="my-12 border-border-strong" />;
          case "code":
            return (
              <pre
                key={key}
                className="my-8 overflow-x-auto border border-border bg-muted/70 p-4 font-mono text-[0.8125rem] leading-relaxed"
              >
                <code>{block.text}</code>
              </pre>
            );
          case "embed":
            return block.url ? (
              <div key={key} className="my-8 aspect-video w-full">
                <iframe
                  src={block.url}
                  title={block.caption || "Embedded media"}
                  className="h-full w-full border border-border"
                  allowFullScreen
                />
              </div>
            ) : null;
          default:
            return <Paragraph key={key} text={block.text ?? ""} />;
        }
      })}
    </div>
  );
}
