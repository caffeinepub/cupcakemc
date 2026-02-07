# Specification

## Summary
**Goal:** Redesign the CupCakeMC site header and Home page to visually match the provided screenshots, using the CupCake SMP logo as the primary brand asset.

**Planned changes:**
- Redesign the global navigation header to match the screenshot layout (left brand/logo, centered links: Home/Shop/Vote/Discord, right cart icon + Login button) with a dark translucent bar and thin pink accent/border plus consistent hover states.
- Recreate the Home page sections in the screenshot order: hero/intro, Server Status card, Vote card, Discord card, and “Why Choose CupCakeMC?” three-feature grid with matching typography/spacing and responsive layout.
- Update the Home page Vote section to render voting-site rows from configured vote URLs (fallback to common vote sites when missing), each opening in a new tab with a right-aligned external-link icon.
- Update the Home page Discord section to match the screenshot (centered Discord icon, pink headline, short text, and button opening the configured invite link in a new tab with fallback).
- Apply a consistent dark + pink CupCakeMC theme across key pages (Home/Vote/Discord/Shop), including pixel/arcade-like heading styling for major section titles.
- Add and use the user-provided CupCake SMP logo in the header and derive a square favicon/app icon from it; ensure a transparent logo variant is used on the dark navbar.
- Ensure any generated image assets are stored under `frontend/public/assets/generated` and referenced via static paths.

**User-visible outcome:** The site’s navbar and Home page match the uploaded design screenshots (layout, cards, headings, and pink-accent theme), with working navigation, login/cart, vote links, and a Discord join button using configured URLs.
