import { useState } from "react";

import { BLOCK_LABELS, newBlock, type Block, type BlockType } from "@/lib/blocks";
import { Btn, inputClass, textareaClass } from "./AdminUI";
import { MediaPicker } from "./MediaPicker";

const ADDABLE: BlockType[] = [
  "paragraph",
  "heading",
  "subheading",
  "quote",
  "list",
  "image",
  "callout",
  "code",
  "embed",
  "divider",
];

export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
}) {
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Block>) =>
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
    onChange(next);
  };
  const insert = (type: BlockType, at?: number) => {
    const next = [...blocks];
    next.splice(at ?? blocks.length, 0, newBlock(type));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={block.id ?? i} className="group border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-2 py-1">
            <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
              {BLOCK_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-0.5">
              <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </IconBtn>
              <IconBtn
                label="Move down"
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
              >
                ↓
              </IconBtn>
              <IconBtn label="Delete block" onClick={() => remove(i)}>
                ✕
              </IconBtn>
            </div>
          </div>

          <div className="space-y-2 p-3">
            {block.type === "divider" ? (
              <p className="text-sm text-muted-foreground">A horizontal rule between sections.</p>
            ) : null}

            {["paragraph", "callout", "quote", "code"].includes(block.type) ? (
              <textarea
                rows={block.type === "paragraph" ? 5 : 3}
                value={block.text ?? ""}
                onChange={(e) => update(i, { text: e.target.value })}
                placeholder={
                  block.type === "quote"
                    ? "A striking line from the story…"
                    : block.type === "code"
                      ? "Code or data snippet"
                      : "Write here…"
                }
                className={`${textareaClass} ${block.type === "code" ? "font-mono text-xs" : block.type === "paragraph" ? "font-serif text-base leading-relaxed" : ""}`}
              />
            ) : null}

            {["heading", "subheading", "embed"].includes(block.type) ? (
              <input
                value={block.text ?? block.url ?? ""}
                onChange={(e) =>
                  update(
                    i,
                    block.type === "embed" ? { url: e.target.value } : { text: e.target.value },
                  )
                }
                placeholder={block.type === "embed" ? "https://…" : "Section heading"}
                className={`${inputClass} ${block.type === "heading" ? "font-serif text-base" : ""}`}
              />
            ) : null}

            {block.type === "quote" ? (
              <input
                value={block.attribution ?? ""}
                onChange={(e) => update(i, { attribution: e.target.value })}
                placeholder="Attribution (optional)"
                className={inputClass}
              />
            ) : null}

            {block.type === "list" ? (
              <div className="space-y-1.5">
                {(block.items ?? []).map((item, k) => (
                  <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
                    <input
                      value={item}
                      onChange={(e) => {
                        const items = [...(block.items ?? [])];
                        items[k] = e.target.value;
                        update(i, { items });
                      }}
                      placeholder={`Point ${k + 1}`}
                      className={inputClass}
                    />
                    <IconBtn
                      label="Remove item"
                      onClick={() =>
                        update(i, { items: (block.items ?? []).filter((_, x) => x !== k) })
                      }
                    >
                      ✕
                    </IconBtn>
                  </div>
                ))}
                <Btn
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => update(i, { items: [...(block.items ?? []), ""] })}
                >
                  + Add point
                </Btn>
              </div>
            ) : null}

            {block.type === "image" ? (
              <div className="space-y-2">
                {block.url ? (
                  <img
                    src={block.url}
                    alt={block.alt ?? ""}
                    className="max-h-56 w-full bg-muted object-cover"
                  />
                ) : null}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
                  <input
                    value={block.url ?? ""}
                    onChange={(e) => update(i, { url: e.target.value })}
                    placeholder="Image URL"
                    className={inputClass}
                  />
                  <Btn variant="outline" onClick={() => setPickerFor(i)}>
                    Library
                  </Btn>
                </div>
                <input
                  value={block.alt ?? ""}
                  onChange={(e) => update(i, { alt: e.target.value })}
                  placeholder="Alt text — describe the image for screen readers"
                  className={inputClass}
                />
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <input
                    value={block.caption ?? ""}
                    onChange={(e) => update(i, { caption: e.target.value })}
                    placeholder="Caption"
                    className={inputClass}
                  />
                  <input
                    value={block.credit ?? ""}
                    onChange={(e) => update(i, { credit: e.target.value })}
                    placeholder="Credit"
                    className={inputClass}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5 border border-dashed border-border p-3">
        <span className="mr-1 self-center text-xs text-muted-foreground">Add block:</span>
        {ADDABLE.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => insert(type)}
            className="rounded-sm border border-border px-2 py-1 text-xs transition-colors hover:bg-muted"
          >
            {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>

      {pickerFor !== null ? (
        <MediaPicker
          onClose={() => setPickerFor(null)}
          onSelect={(item) => {
            update(pickerFor, {
              url: item.url,
              alt: item.alt_text ?? "",
              caption: item.caption ?? "",
              credit: item.credit ?? "",
            });
            setPickerFor(null);
          }}
        />
      ) : null}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="h-7 w-7 rounded-sm text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}
