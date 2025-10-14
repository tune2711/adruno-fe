# Cửa Hàng Ăn Đêm (adruno-fe)

This is a Vite + React (TypeScript) frontend application.

## Prerequisites

- Node.js 18+ (recommended)
- npm (bundled with Node) or an alternative package manager

## Setup

Install dependencies:

```powershell
npm install
```

## Development

Start the dev server:

```powershell
npm run dev
```

The app will be available at http://localhost:5173 by default.

## Build (production)

```powershell
npm run build
```

This produces a `dist/` folder ready to be served by any static host. To preview the production build locally:

```powershell
npm run preview
```

## Notes

- `index.html` references Tailwind via CDN and a `index.css` file. A minimal `index.css` was added to avoid a build-time missing file warning.
- Vite dev server proxies `/api` to the backend URL controlled by the `VITE_API_BASE` environment variable (see `vite.config.ts`).
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1q4jONNL537eRmjuqcnI4q6IqYaDV7UzV

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
