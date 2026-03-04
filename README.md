# CBB Analytics — College Basketball Rankings

A React + Vite + TypeScript web application providing comprehensive analytics, power rankings, game prediction, and advanced metrics for NCAA Men's Basketball.

## Features

- **Power Rankings**: Adjusted efficiency rankings for all D1 teams
- **Efficiency Analysis**: Compare offensive vs. defensive efficiency dynamically
- **Schedule Strength**: SOS metrics showing how hard a team's schedule has been
- **Game Predictor**: Simulate head-to-head matchups using adjusted efficiency margins (Log5 formula)
- **Bubble Tracker**: Track teams on the bubble for tournament inclusion
- **Momentum**: Team performance trends over recent games
- **Head-to-Head**: Direct side-by-side comparison of any two teams
- **Upset Alerts**: Identify trap games and potential upsets based on efficiency gaps
- **Conference Strength**: Conference-wide aggregate metrics
- **Cinderella Watch**: Mid-majors with the statistical profile of a bracket buster
- **Draft Board**: 2026 NBA Draft prospect rankings with team fit analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Data**: Python script fetching from [Barttorvik](https://barttorvik.com), cached in `data/data.json`
- **CI**: GitHub Actions auto-updates data daily at 8am UTC

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── layout/       # Header, NavBar
│   │   ├── tabs/         # One component per dashboard tab (11 total)
│   │   └── ui/           # Shared primitives (SOLBadge, BarCell, Loading, etc.)
│   ├── data/
│   │   └── draftProspects.ts   # Static 2026 NBA Draft data
│   ├── hooks/
│   │   └── useTeamData.ts      # Fetches + parses + computes SOL scores
│   ├── styles/
│   │   └── global.css          # CSS variables, table styles, all shared classes
│   ├── types/index.ts           # TypeScript interfaces (Team, TeamWithSOL, etc.)
│   └── utils/                  # Pure functions: parseTeams, computeSOL, predictor, formatting
├── data/
│   └── data.json               # Cached team + player data (auto-updated by CI)
├── scripts/
│   └── fetch-data/
│       └── fetch_cbb_data.py   # Fetches Barttorvik data → writes data/data.json
├── public/
│   └── nba-live.html           # Standalone NBA live play-by-play tracker (Sportradar API)
├── .github/workflows/
│   └── fetch-data.yml          # Daily cron: runs Python script and commits data
└── archive/                    # Old iterative HTML versions (pre-React, for reference)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python 3](https://www.python.org/) (only needed to manually refresh data)

### Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` by default.

### Build for production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Updating Data

Data is auto-updated daily via GitHub Actions. To refresh manually:

```bash
python3 scripts/fetch-data/fetch_cbb_data.py
```

This writes fresh data to `data/data.json`. In dev mode, the app reads from `/data/data.json` directly. In production, it fetches from the GitHub raw URL.

## NBA Live Tracker

`public/nba-live.html` is a standalone page (no build step required) that shows real-time NBA play-by-play using the Sportradar NBA v8 API. Open it via the dev server at `http://localhost:5173/nba-live.html` or directly in a browser. Features:

- All games for the current day with live scores
- Real-time PBP feed (polls every 2 seconds for live games)
- Strict 1 QPS rate limiting with exponential backoff on 429s
- Date navigation (prev/next day)
- All 30 NBA team colors

## Data Sources

- **Team stats**: [Barttorvik](https://barttorvik.com) — adjusted offensive/defensive efficiency, tempo, Barthag, WAB
- **NBA live data**: [Sportradar NBA v8 API](https://developer.sportradar.com/docs/read/basketball/NBA_v8)
