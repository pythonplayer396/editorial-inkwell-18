# The Editorial Hub

Build a Premium Journalism Publishing Platform — Product Specification

You are building a production-quality journalism and publishing platform, not a generic blog template and not a basic CRUD dashboard.

The client is a professional journalist/news writer who currently writes for newspapers and needs a modern website where he can publish his work online.

The finished product should feel like a premium digital newspaper + modern publishing CMS, with the simplicity of a modern SaaS product and the functionality expected from WordPress.

The most important goals are:

1. Exceptional visual design
2. Extremely clear UX
3. Fast and responsive
4. Easy for a non-technical journalist to operate
5. Powerful enough to support serious publishing
6. Professional enough to present to a real client
7. Built so it can grow into a complete publishing platform

Do NOT make this look like a generic AI-generated website.

Do NOT use excessive gradients, glowing backgrounds, giant rounded cards, random glassmorphism, meaningless animations, or “startup landing page” styling.

Do NOT imitate WordPress visually.

Use WordPress as a functional benchmark, not a visual reference.

1. PRODUCT IDENTITY

This is a digital publication operated by a journalist.

The public website should feel like:

a serious newspaper

a modern magazine

an editorial publication

a trusted journalism website

The admin should feel like:

Linear

Notion

modern CMS software

a polished SaaS dashboard

The overall design language should be:

Editorial, sophisticated, minimal, trustworthy, modern, highly readable.

Typography and spacing should do most of the visual work.

Use restrained colors.

Prefer strong typography, subtle borders, clean surfaces, excellent whitespace, and carefully designed interactions.

2. CORE PRODUCT PRINCIPLE

The product should hide complexity from the journalist.

The administrator should never need to understand technical concepts to publish an article.

The primary workflow must be extremely simple:

LOGIN
→ DASHBOARD
→ NEW ARTICLE
→ WRITE
→ ADD IMAGE
→ PREVIEW
→ PUBLISH

Every important action should be obvious.

Avoid unnecessary nested menus.

Avoid unclear icons without labels.

Avoid making common actions difficult to find.

Every screen should answer:

“What can I do here?”

3. USER TYPES

Design the system around these roles:

Owner / Administrator

Full access.

Can:

manage users

manage articles

manage pages

manage media

manage categories

manage tags

manage comments

manage appearance

manage settings

manage analytics

Editor

Can:

create articles

edit articles

review articles

schedule articles

publish articles

manage categories/tags

manage media

moderate comments

Author / Journalist

Can:

create articles

edit their drafts

upload media

submit articles for review

view their published work

Contributor

Can:

create drafts

submit for review

Subscriber / Reader

Can eventually:

create account

bookmark articles

follow authors

follow categories

receive notifications

comment

Build the architecture so granular permissions can exist later.

4. PUBLIC WEBSITE

Build a complete, premium publication website.

Required public routes:

/
/latest
/category/[slug]
/tag/[slug]
/article/[slug]
/author/[slug]
/search
/about
/contact

Prepare the structure so additional custom pages can be added later.

5. HOMEPAGE

The homepage is extremely important.

It must look like an actual news publication.

Do not create a generic card-grid homepage.

Build strong editorial hierarchy.

Suggested structure:

Header

logo

primary navigation

categories

search

optional account button

mobile navigation

Keep it minimal.

Breaking News Bar

A subtle but highly visible breaking-news area.

Example:

BREAKING
Government announces major new policy

The administrator should be able to enable/disable it.

Hero / Lead Story

One dominant article.

Include:

category

headline

summary

large image

author

publishing time

This should visually dominate the page.

Secondary Stories

Use a carefully structured layout for several supporting stories.

Latest News

A clean chronological feed.

Each article should show:

image

headline

category

timestamp

author

short excerpt where appropriate

Most Read

Show popular articles.

Editor's Picks

Manually selected stories.

Category Sections

For example:

National
Politics
International
Business
Technology
Sports
Culture
Opinion
Features

Only display categories that contain content.

Newsletter / Subscription Area

Create a polished newsletter component.

Footer

Include:

publication identity

navigation

categories

social links

legal links

newsletter

copyright

6. ARTICLE PAGE

The article page should be one of the strongest parts of the website.

Structure:

CATEGORY

Large headline

Subheadline / summary

Author

Published date/time

Updated date/time when applicable

Hero image

Image caption

Photo credit

Article body

Related stories

More from this author

Most read

Comments

Newsletter

The article body should be highly readable.

Use an editorial reading width.

Do not stretch paragraphs across the entire screen.

Do not surround every section with cards.

The article itself should feel premium and calm.

Support:

headings

paragraphs

lists

quotes

images

captions

galleries

video

embeds

links

code blocks where appropriate

tables

dividers

callouts

Add:

copy link

social share

bookmark

reaction system

reading time

table of contents for long articles

7. JOURNALIST / AUTHOR PAGES

Each journalist should have a proper public profile.

Include:

profile photo

name

role

biography

social links

article count

latest articles

Each article should link back to the author.

The author's profile should feel like a professional journalist page rather than a generic user account.

8. CATEGORY PAGES

Each category should have an editorial landing page.

Example:

POLITICS

Featured story

Latest politics stories

Most read politics stories

Pagination / infinite loading

The design should remain readable and structured.

9. SEARCH

Build a proper search experience.

Support:

article search

title search

content search

author search

category filtering

date filtering

Include useful empty states.

Example:

“No stories found for your search.”

Then suggest related categories or search terms.

10. ADMIN CMS

The CMS is just as important as the public website.

Use a clean left navigation:

Dashboard
Posts
Pages
Media
Categories
Tags
Comments
Authors
Analytics
Appearance
Settings

Use clear labels.

Avoid unnecessary icons.

11. ADMIN DASHBOARD

The dashboard should focus on what the journalist needs.

Top-level information:

Published articles

Drafts

Scheduled articles

Views

Comments requiring moderation

Then:

Recent articles

Quick actions:

Write Article

Upload Media
View Website

Then a compact analytics overview.

Do not overwhelm the dashboard with unnecessary statistics.

12. ARTICLE MANAGEMENT

Posts page should support:

search

filtering

categories

authors

status

date

sorting

bulk selection

Statuses:

Draft
In Review
Scheduled
Published
Archived

Rows should clearly show:

Title
Author
Category
Status
Published date
Updated date
Views
Actions

Support bulk actions.

13. ARTICLE EDITOR

This is the heart of the CMS.

Build a professional block-based article editor.

It should feel closer to Notion / modern publishing software than a basic textarea.

The editor must support:

paragraphs

headings

images

captions

photo credits

quotes

lists

links

video

galleries

embeds

dividers

callouts

code blocks

tables

Support:

drag and drop blocks

block reordering

inline editing

keyboard shortcuts

undo/redo

autosave

draft recovery

preview

The article title should be visually prominent.

The editor should have a clean writing environment.

Do not overcrowd the screen with controls.

14. ARTICLE METADATA

Every article should support:

Title

Subtitle / Deck

Excerpt

Author

Co-authors

Category

Tags

Featured image

Image caption

Photo credit

Location / dateline

Published date

Updated date

SEO title

SEO description

Canonical URL

Social preview image

Visibility

Status

Scheduled date

15. JOURNALISM-SPECIFIC FEATURES

This is NOT a generic blogging platform.

Include journalism-focused fields and workflows.

Important features:

Breaking News

Allow an article to be marked as breaking.

Dateline

Example:

Dhaka —

Then article text.

Updated Story

Display:

Updated August 31, 2026 at 5:10 PM

Photo Credit

Every significant image should support a photo credit.

Related Coverage

Allow editors to connect related stories.

Reporter / Author

Treat author identity as an important part of the publication.

Editorial Workflow

Draft
→ In Review
→ Approved
→ Scheduled
→ Published

16. MEDIA LIBRARY

Build a professional media library.

Support:

image upload

drag/drop

search

filtering

preview

deletion

replacement

alt text

captions

photo credits

dimensions

file size

folders/collections

Display media in a clean grid.

Selecting an image should show a useful details panel.

Images should be optimized automatically.

Use modern formats where appropriate.

17. PAGES

Create a page management system similar to posts.

Support:

About

Contact

custom pages

drafts

previews

publishing

revisions

Pages should use the same editor system.

18. COMMENTS

Build comment moderation.

Support:

approve

reject

spam

delete

reply

bulk moderation

Show:

author

comment

article

date

status

Design moderation to be extremely fast.

19. USERS & AUTHORS

Admin should be able to:

create users

edit users

assign roles

disable accounts

edit author profiles

upload profile pictures

Author profile fields:

Name
Display name
Bio
Profile picture
Social links
Role

20. ANALYTICS

Build a simple but useful internal analytics section.

Show:

page views

unique visitors

article performance

most read stories

traffic sources

devices

countries where practical

average reading time

engagement

publishing trends

Keep detailed analytics separate from the primary dashboard.

Use clean charts.

Do not turn analytics into a distracting wall of charts.

21. APPEARANCE

Create a proper appearance system.

Admin should be able to configure:

Logo
Site name
Primary color
Typography
Navigation
Footer
Homepage sections
Social links
Newsletter
Article layout

Eventually allow:

custom homepage arrangement

custom sections

reusable components

theme presets

Do not expose unnecessary technical complexity.

22. SEO

The CMS should provide strong SEO foundations.

Support:

editable meta title

meta description

canonical URL

Open Graph

social image

sitemap

robots configuration

structured data

article schema

breadcrumbs

clean URLs

Use semantic HTML.

Optimize page structure for search engines without compromising UX.

23. RESPONSIVE DESIGN

The website must be genuinely responsive.

Do not simply shrink desktop layouts.

Design intentionally for:

Desktop
Tablet
Mobile

The mobile version should remain excellent.

Pay special attention to:

navigation

article typography

images

editor

media library

dashboards

tables

24. DESIGN SYSTEM

Create a reusable design system before building dozens of screens.

Define:

typography scale

spacing system

border radius

shadows

buttons

inputs

dropdowns

dialogs

cards

badges

tabs

tables

alerts

tooltips

navigation

article components

editorial components

Everything should feel like the same product.

Do not make every section visually different.

25. TYPOGRAPHY

Typography is extremely important.

Use a highly readable editorial typeface for article content.

Use a strong display hierarchy for headlines.

Headlines should feel powerful without becoming ridiculous.

Body text should be comfortable to read for long periods.

Use proper line height and constrained reading width.

26. COLOR

Use a restrained palette.

Base:

white / off-white

near-black

neutral grays

Then one controlled accent color.

Do not use a rainbow palette.

Do not use excessive gradients.

The publication should communicate credibility.

27. ANIMATION

Animations should be subtle.

Use animation for:

navigation

dropdowns

modals

hover states

page transitions

editor interactions

loading states

Do not animate everything.

Do not use distracting parallax effects.

28. ACCESSIBILITY

Build proper accessibility from the beginning.

Support:

keyboard navigation

visible focus states

semantic HTML

accessible forms

image alt text

good contrast

screen-reader-friendly controls

proper headings

29. PERFORMANCE

Prioritize performance.

Use:

lazy-loaded images

optimized image formats

responsive images

code splitting where appropriate

caching

server rendering / static rendering where useful

minimal unnecessary JavaScript

Public article pages should load quickly.

30. DATABASE / DATA MODEL

Design a proper relational data model.

Core entities should include:

users
roles
permissions
authors
posts
post_revisions
post_blocks
pages
page_revisions
categories
tags
post_categories
post_tags
media
media_folders
comments
comment_replies
bookmarks
reactions
menus
menu_items
subscriptions
notifications
analytics_events
site_settings

Use clean relationships.

Do not create a messy database structure just to get the first demo working.

31. ARCHITECTURE

Prefer a maintainable architecture.

Use:

Frontend:
Next.js
React
TypeScript

Styling:
Tailwind CSS

Database:
PostgreSQL

Authentication:
Use a secure, maintainable authentication system.

Storage:
S3-compatible object storage or equivalent.

The code should be modular.

Keep reusable components separate.

Keep business logic separate from presentation wherever practical.

32. SECURITY

Build with production security in mind.

Protect:

authentication

authorization

admin routes

uploaded files

user input

comments

API endpoints

database access

Never trust client-side permissions.

Never expose secrets in frontend code.

Validate data on the server.

33. EMPTY STATES

Every empty state should explain what is happening and what the user can do next.

Bad:

“No data.”

Good:

“No articles yet.
Start publishing your first story.”

Then:

[Write an Article]

Do this throughout the entire application.

34. ERROR STATES

Errors should be human-readable.

Bad:

“Error 500.”

Good:

“We couldn't publish this article. Your draft has been saved, so nothing was lost.”

Provide recovery actions.

35. LOADING STATES

Avoid blank screens.

Use appropriate:

skeletons

loading indicators

optimistic updates where appropriate

Do not use flashy loaders.

36. CLIENT EXPERIENCE

The client should feel that the CMS was designed specifically for him.

When he logs in, he should immediately understand:

Where are my articles?

How do I write?

What is scheduled?

What needs attention?

How is my website performing?

Every major action should take as few steps as reasonably possible.

37. IMPORTANT VISUAL RULE

Do NOT make the public site and admin look identical.

Public:

Editorial
Elegant
Typography-focused
Publication-focused

Admin:

Functional
Clean
Compact
Product-focused

They should share the same design system but have different personalities.

38. DO NOT BUILD A FAKE DEMO

This must be structured as a real application.

Do not hardcode fake article cards everywhere.

Do not make buttons that do nothing.

Do not create fake dashboards with static numbers when the corresponding functionality should be real.

Use real database-driven data.

Create the architecture so the application can continue growing after the initial version.

39. INITIAL DEVELOPMENT PRIORITY

Build in this order:

Phase 1 — Product Foundation

Project architecture

Database

Authentication

User roles

Design system

Admin shell

Public website shell

Phase 2 — Core Publishing

Posts

Block editor

Media library

Categories

Tags

Authors

Publishing workflow

Article preview

Public article pages

Phase 3 — Publication Experience

Homepage

Category pages

Search

Author pages

Related stories

Most read

Breaking news

Comments

Phase 4 — Platform Features

Pages

Appearance

SEO

Analytics

Notifications

Bookmarks

Newsletter

Advanced permissions

Do not attempt to build every advanced feature before the core publishing workflow is polished.

40. QUALITY BAR

Before considering a page complete, evaluate:

Does it look professionally designed?

Is the hierarchy obvious?

Can a normal person understand it immediately?

Are actions easy to find?

Does it work on mobile?

Does it handle loading?

Does it handle errors?

Does it handle empty data?

Does it feel consistent with the rest of the product?

Does it look like something a real journalist would actually use?

Would I be comfortable showing this to a paying client?

If the answer is no, improve it.

41. FINAL DESIGN DIRECTION

The final product should feel like:

A premium digital newspaper powered by a modern publishing platform.

Not:

“a WordPress clone.”

Not:

“a blog template.”

Not:

“an AI-generated SaaS dashboard.”

The design should communicate:

Credibility
Clarity
Editorial quality
Professionalism
Trust
Modern technology

Build the experience with restraint.

Every element should have a purpose.

Every interaction should feel intentional.

Every screen should feel finished.

42. IMPLEMENTATION RULE

Do not immediately generate dozens of unrelated screens.

First establish:

the global design system

application architecture

database structure

navigation

core user flows

Then build the core experience:

LOGIN
→ DASHBOARD
→ NEW ARTICLE
→ WRITE
→ MEDIA
→ PREVIEW
→ PUBLISH
→ PUBLIC ARTICLE

Make that flow exceptionally polished before expanding the product.

The goal is not merely to have many features.

The goal is to make the entire product feel coherent, premium, fast, obvious, and genuinely enjoyable to use.


CRITICAL VISUAL DIRECTION — DO NOT IGNORE

The visual design of this product is one of the highest-priority requirements.

The website must NOT look like a typical AI-generated, “vibe-coded,” colorful SaaS website.

Absolutely avoid:

Neon gradients

Purple/blue gradient backgrounds

Glowing blobs

Glassmorphism

Excessive shadows

Excessive rounded cards

Huge pill-shaped UI elements everywhere

Random colorful sections

Oversaturated accent colors

Decorative illustrations with no purpose

Generic startup hero sections

“AI SaaS” aesthetics

Over-animated interfaces

Excessive border radiuses

Rainbow dashboards

Visually noisy card grids

Fake complexity

Anything that looks like a template generated by an AI website builder

The design reference should be Stripe's developer/product ecosystem, especially the visual language and information hierarchy used across Stripe's developer-facing pages.

Study and reproduce the principles behind that style:

Extremely clean layouts

Strong typography

Precise spacing

Restrained color palette

Excellent information hierarchy

Sharp visual hierarchy

Minimal decoration

Subtle borders

Sophisticated neutrals

Carefully controlled accent colors

Very intentional use of whitespace

High-quality documentation/product-page readability

Professional navigation

Extremely polished interaction states

The result should have the feeling of:

Stripe Developer
Stripe Documentation
Premium editorial publication
Professional developer product

—not a colorful startup template.

COLOR PHILOSOPHY

Use a restrained visual system.

Primary foundation:

white

off-white

near-black

charcoal

neutral grays

Use an accent color sparingly and intentionally.

The accent color should support hierarchy and interaction, not decorate the page.

Do NOT make every section a different color.

Do NOT use gradients merely because they look “modern.”

The website should still look excellent if almost all decorative color is removed.

TYPOGRAPHY

Typography is one of the primary visual elements.

Use typography to establish hierarchy instead of relying on colored boxes and cards.

Headlines should feel editorial and authoritative.

Body copy should be highly readable.

Navigation should be clear.

Metadata should be subtle.

Spacing should feel deliberate.

Avoid enormous marketing-style headlines that consume the entire viewport unless the content genuinely requires it.

SHAPE LANGUAGE

Keep the interface refined and restrained.

Use small or moderate corner radii where appropriate.

Do not turn every element into a giant rounded rectangle.

Buttons should look like real buttons.

Inputs should look like real inputs.

Cards should only exist where they provide useful grouping.

Not everything needs to be inside a card.

LAYOUT

Prioritize:

clean grids

strong alignment

generous whitespace

constrained reading widths

consistent spacing

clear hierarchy

intentional content density

Avoid:

clutter

excessive columns

random floating elements

unnecessary visual decoration

huge empty hero sections

repetitive card layouts

PUBLIC WEBSITE VISUAL TARGET

The public website should combine the visual discipline of Stripe with the editorial structure of a premium newspaper.

It should feel like a serious publication run by a professional journalist.

Think:

Stripe-level polish + premium digital newspaper + modern editorial typography.

Not:

WordPress theme + generic blog cards + colorful AI-generated styling.

ADMIN VISUAL TARGET

The admin dashboard should use the same design language.

Think:

Stripe Dashboard / Linear / Notion

with the usability of a professional CMS.

It should be dense enough to be useful but never cluttered.

HARD RULE

Whenever you are deciding between:

A) a flashy, colorful, trendy UI

and

B) a restrained, precise, professional UI

ALWAYS choose B.

Whenever you are tempted to add a visual effect simply because it looks “cool,” do not add it unless it improves usability.

The final result must look like it was designed by a professional product design team, not generated from a generic AI website prompt.

The client should be able to show this website to a newspaper, media company, journalist, developer, or professional organization and have it look completely credible.

Benchmark

Before approving any screen, ask:

“Could this screen exist inside Stripe's product ecosystem without looking out of place?”

If the answer is no, redesign it.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://editorial-inkwell-18.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f610a489-dd30-4a68-9f29-99177daa5bbd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
