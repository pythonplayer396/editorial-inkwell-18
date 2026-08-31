export type BlockType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "quote"
  | "list"
  | "image"
  | "callout"
  | "divider"
  | "code"
  | "embed";

export interface Block {
  id?: string;
  type: BlockType;
  text?: string;
  items?: string[];
  attribution?: string | null;
  url?: string;
  caption?: string;
  credit?: string;
  alt?: string;
  language?: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  subheading: "Subheading",
  quote: "Pull quote",
  list: "List",
  image: "Image",
  callout: "Callout",
  divider: "Divider",
  code: "Code",
  embed: "Embed",
};

export function newBlock(type: BlockType): Block {
  const id = Math.random().toString(36).slice(2, 10);
  if (type === "list") return { id, type, items: [""] };
  if (type === "image") return { id, type, url: "", caption: "", credit: "", alt: "" };
  if (type === "divider") return { id, type };
  return { id, type, text: "" };
}

export function withIds(blocks: Block[]): Block[] {
  return blocks.map((b) => (b.id ? b : { ...b, id: Math.random().toString(36).slice(2, 10) }));
}

export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => b.text ?? (b.items ? b.items.join(" ") : ""))
    .filter(Boolean)
    .join(" ");
}

export function readingMinutes(blocks: Block[]): number {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function autoExcerpt(blocks: Block[]): string {
  const first = blocks.find((b) => b.type === "paragraph" && b.text);
  if (!first?.text) return "";
  return first.text.length > 220 ? `${first.text.slice(0, 217)}…` : first.text;
}
