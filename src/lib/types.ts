import type { Block } from "./blocks";

export type PostStatus = "draft" | "in_review" | "scheduled" | "published" | "archived";
export type AppRole = "owner" | "editor" | "author" | "contributor" | "subscriber";
export type CommentStatus = "pending" | "approved" | "spam";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Profile {
  id: string;
  user_id: string | null;
  slug: string;
  display_name: string;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  dateline: string | null;
  body: Block[];
  cover_url: string | null;
  cover_caption: string | null;
  cover_credit: string | null;
  category_id: string | null;
  author_id: string | null;
  status: PostStatus;
  is_breaking: boolean;
  is_featured: boolean;
  is_editors_pick: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  social_image_url: string | null;
  view_count: number;
  reading_minutes: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  author?: Profile | null;
}

export interface MediaItem {
  id: string;
  url: string;
  file_name: string;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  body: string;
  status: CommentStatus;
  created_at: string;
  post?: { title: string; slug: string } | null;
}

export interface SiteSettings {
  id: boolean;
  site_name: string;
  tagline: string;
  breaking_enabled: boolean;
  breaking_text: string | null;
  breaking_href: string | null;
  about_text: string | null;
  contact_email: string | null;
  twitter: string | null;
  linkedin: string | null;
}

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  editor: "Editor",
  author: "Author",
  contributor: "Contributor",
  subscriber: "Subscriber",
};
