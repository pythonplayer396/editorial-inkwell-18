# Premium editorial redesign

- [x] Establish typography, color, depth, and motion tokens
- [x] Redesign public header, navigation, breaking bar, footer, and newsletter
- [x] Recompose homepage into a living broadsheet
- [x] Add premium article reading interactions
- [x] Upgrade search interaction
- [x] Polish newsroom shell, dashboard, and editor interactions
- [x] Verify responsive rendering, reduced motion, and build health

# Newsroom system (phased)

## Phase 1 — workflow core, i18n, notifications (done)
- [x] Workflow statuses, timeline, feedback, notifications, audit, permissions (database)
- [x] i18n architecture, 8 languages, persisted preference, language switcher
- [x] Separate portals: /auth (readers), /auth/journalist, /auth/staff, /auth/admin
- [x] Journalist portal at /newsroom: status counts, attention queue, feedback, profile
- [x] Staff desk: /admin/submissions queue and /admin/review/$id workspace
      (approve, request changes with note, reject with reason, schedule, publish,
      internal notes, timeline, desktop/mobile preview, next submission)
- [x] Admin oversight: /admin/oversight, /admin/audit, /admin/staff, /admin/applications
- [x] Join The Dispatch public page + application system
- [x] File-based image uploader (drag & drop / select) with alt, caption, credit
- [x] In-app notification bell

## Phase 2 — complete
- [x] Autosave + "we found a newer draft" restore in the editor
- [x] Revision history with restore
- [x] Journalist featured work + coverage areas on public profile
- [x] Related coverage and corrections on articles
- [x] Multi-image galleries with reordering
- [x] Reader accounts: bookmarks, follows, notification preferences
- [x] Public interface chrome translated (8 languages) + footer language switcher
