# Velstrax — Product Requirements & Roadmap

## Original Problem Statement
Build a high-end, premium agency website called **Velstrax**, a Greek web design & development studio serving small businesses. Ultra-premium, minimal, strictly black/white aesthetic with cinematic animations (Apple-level quality). Pages: Landing (Hero, Services, How It Works, Portfolio, Contact). Admin panel for editing social links (YouTube, Instagram, TikTok, Email). Greek default with English toggle.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async) + JWT auth (bcrypt + PyJWT) + Resend (email).
- **Frontend**: React 19 + React Router v7 + Framer Motion + Lenis (smooth scroll) + Tailwind + shadcn-style components. Custom `font-display` (Cabinet Grotesk) and `font-serif-editorial` (Erode) loaded from Fontshare.
- **i18n**: Custom lightweight `LanguageContext` (Greek/English) with browser auto-detect & localStorage persistence.

## User Personas
1. **Small business owner (visitor)** — visits velstrax.com, browses services/portfolio, submits an inquiry via the contact form.
2. **Velstrax admin (owner)** — logs into `/admin`, edits social links, manages portfolio case studies, reads inbound messages.

## Core Requirements (static)
- Black & white only palette, no accent color
- Cinematic loading screen with "VELSTRAX" reveal
- Sticky blur navigation, animated CTAs, hover micro-interactions
- Greek-first content; English toggle via i18n
- Admin auth (JWT) — single seeded admin
- Contact form: DB write + Resend email notification
- Portfolio CRUD from admin
- Editable social links from admin (consumed by Footer)

## What's Been Implemented (Feb 2026)
- [x] Backend: `/api/auth/login`, `/logout`, `/me` (JWT cookie + Bearer)
- [x] Backend: `/api/settings` GET (public) / PUT (admin)
- [x] Backend: `/api/portfolio` full CRUD (read public, write admin)
- [x] Backend: `/api/contact` POST stores message + sends Resend email; `/api/contacts` GET (admin)
- [x] Seeding: admin user, 6 premium portfolio case studies, default settings
- [x] Frontend: LoadingScreen, sticky blurred Navigation with GR/EN toggle
- [x] Frontend: Hero (parallax glass-wave bg, headline reveal, dual CTA)
- [x] Frontend: Metrics counter section
- [x] Frontend: Services (5-card bento grid)
- [x] Frontend: HowItWorks (3-step vertical timeline)
- [x] Frontend: Portfolio (dynamic, before/after metrics, masonry-ish grid)
- [x] Frontend: Contact (split layout, validated form, success state)
- [x] Frontend: Footer (dynamic social links from `/api/settings`)
- [x] Frontend: `/admin/login` and `/admin` dashboard with three tabs (Links, Portfolio CRUD, Messages)
- [x] i18n full translation map (el + en) including admin strings
- [x] Tested: Backend 17/17 (iteration_1) · Frontend 18/18 (iteration_2)

## Verified Test Credentials
Stored in `/app/memory/test_credentials.md`.

## Prioritized Backlog
### P0 (next user-visible improvements)
- Detailed case-study pages (currently cards only, no `/work/[slug]` deep dive)
- SEO meta tags per route + Open Graph image generator
- Optional contact form CAPTCHA (Cloudflare Turnstile) to filter spam

### P1
- Admin: brute-force lockout (5 failed attempts), password reset flow
- Admin: rich content editor for portfolio descriptions (markdown / WYSIWYG)
- Newsletter capture component
- Blog / Insights section editable from admin
- Booking flow demo (Calendly-style picker) to upsell their main service

### P2
- Custom cursor and magnetic buttons
- 3D scroll experiences for select case studies
- Multi-language admin UI (admin labels are translated but tab labels not)
- Analytics integration (Plausible/PostHog dashboard widget)
- Cookie consent banner (EU compliance)
- Replace `window.confirm` in admin delete with styled modal

## Next Action Items
- Add deeper case-study pages with hero, gallery, results
- Wire SEO + OG image generation
- Optional newsletter capture + spam protection
- Restore CORS to explicit origin list before production deploy
