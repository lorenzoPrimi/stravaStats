# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strava Stats is a single-page web application for viewing Strava athletic statistics. It provides a modern web interface featuring OAuth authentication, live stats display, goal tracking, and offline caching.

## Commands

```bash
# Start the server (default: localhost:8089)
npm start

# With custom host/port
HOST=yourdomain.com PORT=3000 node server.js
```

There is no build step, no linter, and no test suite. The project has zero npm dependencies.

## Architecture

The entire application is two files:

- **`server.js`** — Node.js HTTP server (built-in `http` module, no frameworks). Serves the HTML file with dynamic HOST/PORT injection and handles the OAuth `/callback` endpoint. Environment variables: `HOST` (default: `localhost`), `PORT` (default: `8089`).

- **`strava-stats.html`** — Self-contained SPA (~1,280 lines) with embedded CSS and JavaScript. Contains two views toggled via tab navigation:
  - **Dashboard view**: Displays stats grid (distance, moving time, elevation, activities, averages, athlete info) with a goal progress bar and auto-refresh.
  - **Configure view**: Two-step wizard for Strava OAuth connection and personalization (name, sport type, goal, tracking period, refresh interval).

## Key Data Flow

1. Server injects `HOST`/`PORT` into the HTML at serve time via string replacement
2. User enters Strava Client ID/Secret in Configure view
3. OAuth popup opens → Strava redirects to `/callback` → server returns success page that posts message back to opener
4. Client exchanges auth code for tokens via Strava API
5. Client fetches athlete profile + stats, caches in `localStorage` (`stravaStatsConfig` and `stravaStatsData` keys)
6. Tokens auto-refresh 5 minutes before expiry

## Strava API Endpoints Used

- `POST /oauth/token` — Token exchange and refresh
- `GET /api/v3/athlete` — Athlete profile
- `GET /api/v3/athletes/:id/stats` — Athlete statistics

## Conventions

- No external dependencies — all vanilla JavaScript and Node.js built-ins
- All state persisted in `localStorage` (config in `stravaStatsConfig`, cached stats in `stravaStatsData`)
- CSS uses custom properties for theming (dark theme with coral red `#ff6b6b`, turquoise `#4ecdc4`, yellow `#ffe66d` accents)
- Typography: DM Serif Display (headings) + IBM Plex Mono (body), loaded from Google Fonts
- Requires Node.js >= 14
