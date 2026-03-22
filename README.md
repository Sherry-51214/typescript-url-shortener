# TypeScript URL Shortener

A fully working URL shortener built with TypeScript and Express. Features a live web dashboard, click tracking, custom short codes, and a REST API — all running locally in under 30 seconds.

## Live Demo Features

- Paste any URL → get a short link instantly
- Click the short link → redirects to the original URL
- Live click counter updates in real time
- Custom short codes (e.g. `/my-link`)
- Delete any short URL
- Uptime and stats dashboard

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser — the full dashboard is live.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Create a short URL |
| GET | `/:code` | Redirect to original URL |
| GET | `/api/stats/:code` | Get click stats for a URL |
| GET | `/api/urls` | List all short URLs |
| DELETE | `/api/urls/:code` | Delete a short URL |
| GET | `/api/health` | Uptime and total stats |

## Example API Usage

```bash
# Shorten a URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'

# With custom code
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com", "customCode": "gh"}'

# Visit the short URL (auto-redirects)
curl -L http://localhost:3000/gh

# Get click stats
curl http://localhost:3000/api/stats/gh
```

## Project Structure

```
src/
└── index.ts       — Express server, all routes, TypeScript types
public/
└── index.html     — Frontend dashboard (HTML + vanilla JS)
package.json
tsconfig.json
```

## Tech Stack

- **TypeScript** — strict typing throughout
- **Express.js** — routing and middleware
- **Node.js crypto** — URL-safe random code generation
- **Vanilla JS frontend** — no framework needed for the dashboard

---

Built by [Shehroz Khan](https://www.linkedin.com/in/shehroz-khan-b91716197/) · Fullstack Automation Engineer
