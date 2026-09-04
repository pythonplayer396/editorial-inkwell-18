# Professional color system across The Dispatch

## Goal
Carry the polished editorial palette from sign-in through every public, account, author, and admin page. The result should feel richer and more premium without becoming loud, playful, or inconsistent with a serious newsroom.

## Visual direction
- Keep warm paper and ink as the foundation.
- Use restrained burgundy for editorial emphasis, primary calls to action, breaking/correction signals, and selected highlights.
- Use deep teal for navigation state, links, information, category markers, and focus states.
- Add a dark editorial navy for high-impact bands such as the footer, newsletter, and selected workspace chrome.
- Preserve green, amber, and red workflow/status meanings in the CMS.

## Implementation
1. **Expand semantic tokens**
   - Refine accent, secondary accent, soft surface, dark editorial surface, borders, and shadows in `src/styles.css`.
   - Add reusable editorial utilities for tinted bands, section rules, interactive surfaces, and page-intro treatments.

2. **Public site system**
   - Upgrade the shared header, section headings, footer, newsletter, links, buttons, and page background through `PublicLayout` and shared site components.
   - Give the homepage stronger color rhythm with alternating paper/white/tinted bands, colored editorial rules, and more expressive feature/sidebar treatments.
   - Apply consistent page-intro and accent treatments to article, latest, category, tag, author, search, about, contact, join, and account experiences.

3. **Author and admin workspaces**
   - Give newsroom shells a more intentional dark/teal identity in navigation and active states.
   - Refine shared headers, stat surfaces, inputs, and primary actions while preserving dense professional layouts and existing workflow status colors.

4. **Quality checks**
   - Check key public, article, auth, account, author, and admin views at desktop and mobile sizes.
   - Verify contrast, focus states, text fit, and that sign-in/workflow behavior is unchanged.
   - Confirm a clean build and no browser console/runtime errors.

## Scope guardrails
- No route, database, permissions, or publishing-flow changes.
- No gradients, decorative blobs, excessive rounded cards, or saturated color everywhere.
- No edits to generated route files.
