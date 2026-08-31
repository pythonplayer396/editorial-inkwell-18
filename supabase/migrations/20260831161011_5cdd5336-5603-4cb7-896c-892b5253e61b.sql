ALTER TYPE public.post_status ADD VALUE IF NOT EXISTS 'submitted' AFTER 'draft';
ALTER TYPE public.post_status ADD VALUE IF NOT EXISTS 'under_review' AFTER 'submitted';
ALTER TYPE public.post_status ADD VALUE IF NOT EXISTS 'changes_requested' AFTER 'under_review';
ALTER TYPE public.post_status ADD VALUE IF NOT EXISTS 'rejected' AFTER 'changes_requested';
ALTER TYPE public.post_status ADD VALUE IF NOT EXISTS 'approved' AFTER 'rejected';