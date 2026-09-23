# BBC-style news portal redesign

## Goal
Transform The Dispatch public experience into a dense, authoritative news portal inspired by BBC News: fast to scan, image-led, strongly sectioned, and unmistakably branded as The Dispatch.

## Visual direction
- Keep The Dispatch name and logo; do not imitate BBC trademarks or copy its logo.
- Replace the warm luxury-magazine feel with a crisp white, charcoal, light-grey, and strong newsroom-red system.
- Use compact sans-serif headlines, square imagery, straight rules, and minimal rounding.
- Prioritize information hierarchy and story density over decorative effects.

## Implementation
1. **Global public theme**
   - Update public color, typography, spacing, border, and interaction tokens.
   - Preserve admin, account, newsroom, and sign-in behavior.

2. **News header and navigation**
   - Rebuild the public header as a compact multi-row news masthead.
   - Add a prominent red brand band, utility actions, and horizontal section navigation.
   - Keep mobile navigation accessible and compact.

3. **Homepage newsroom grid**
   - Convert the lead area into an image-led top-stories grid with supporting headlines.
   - Use dense Latest, Most Read, Editor’s Picks, and section grids with strong dividers.
   - Remove magazine-style promotional copy and large decorative spacing.

4. **Shared story and page patterns**
   - Restyle story cards, rows, section headers, category/latest pages, article headers, newsletter, and footer.
   - Keep all existing stories, links, search, accounts, bookmarks, follows, and publishing workflows intact.

5. **Quality checks**
   - Verify desktop and mobile public pages visually.
   - Confirm navigation, article opening, and menus work.
   - Confirm clean build and no browser errors.

## Scope guardrails
- Public-facing design only; no database, permissions, workflow, or content changes.
- No copied BBC logos, wording, or proprietary assets.
- No generated route-file edits.
