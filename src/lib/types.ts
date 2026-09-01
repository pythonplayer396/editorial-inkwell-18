import type { Block } from "./blocks";

export type PostStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "rejected"
  | "approved"
  | "in_review"
  | "scheduled"
  | "published"
  | "archived";
export type AppRole = "owner" | "editor" | "author" | "subscriber";
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
  locale?: string | null;
  experience?: string | null;
  coverage_areas?: string[] | null;
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
  created_by?: string | null;
  submitted_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  published_by?: string | null;
  rejection_reason?: string | null;
  correction_note?: string | null;
  correction_at?: string | null;
  category?: Category | null;
  author?: Profile | null;
}

export interface ArticleEvent {
  id: string;
  post_id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  detail: string | null;
  created_at: string;
  post?: { title: string; slug: string } | null;
}

export interface ArticleFeedback {
  id: string;
  post_id: string;
  author_id: string | null;
  author_name: string | null;
  kind: "changes_requested" | "rejected" | "internal_note";
  reason: string | null;
  body: string;
  internal: boolean;
  created_at: string;
  post?: { title: string; slug: string; id: string } | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "more_info";

export interface JournalistApplication {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  coverage_areas: string[];
  previous_publications: string | null;
  portfolio_links: string | null;
  motivation: string | null;
  status: ApplicationStatus;
  reviewer_id: string | null;
  reviewer_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  detail: string | null;
  created_at: string;
}

export const PERMISSIONS = [
  "view_articles",
  "edit_articles",
  "review_articles",
  "approve_articles",
  "publish_articles",
  "schedule_articles",
  "delete_articles",
  "view_media",
  "upload_media",
  "delete_media",
  "moderate_comments",
  "manage_sections",
  "manage_categories",
  "manage_tags",
  "manage_journalists",
  "manage_readers",
  "view_analytics",
  "manage_settings",
  "manage_staff",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_articles: "View articles",
  edit_articles: "Edit articles",
  review_articles: "Review articles",
  approve_articles: "Approve articles",
  publish_articles: "Publish articles",
  schedule_articles: "Schedule articles",
  delete_articles: "Delete articles",
  view_media: "View media",
  upload_media: "Upload media",
  delete_media: "Delete media",
  moderate_comments: "Moderate comments",
  manage_sections: "Manage sections",
  manage_categories: "Manage categories",
  manage_tags: "Manage tags",
  manage_journalists: "Manage journalists",
  manage_readers: "Manage readers",
  view_analytics: "View analytics",
  manage_settings: "Manage settings",
  manage_staff: "Manage staff",
};

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
  submitted: "Submitted",
  under_review: "Under review",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  approved: "Approved",
  in_review: "In review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  editor: "Editor",
  author: "Author",
  subscriber: "Subscriber",
};
