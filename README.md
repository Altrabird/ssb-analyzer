# SSB Analyzer

Visualize and analyze **Laporan Semakan Buku Kerja** (SSB) PDF reports stored in your Google Drive.

Built with **Vite + React + Tailwind CSS + Chart.js**. Connects directly to Google Drive via OAuth — no servers, no backends, your data stays in your browser.

## Features

- **Connect to Google Drive** — pick PDFs or whole folders via the native Drive Picker
- **Compliance by Class** — bar chart + sortable table
- **Trend over Time** — line chart per-class + heatmap
- **Per-Student Tracking** — searchable, sortable roster with submission history
- **Reasons & Leaderboards** — donut/bar of top *alasan* + best/worst student lists
- **Demo mode** — preview the dashboard with built-in sample data
- **Local file upload fallback** — drag PDFs in if you don't want OAuth
- Dark mode, mobile-responsive, CSV export

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Connect to Google Drive

1. Create a project at https://console.cloud.google.com/
2. Enable **Google Drive API** and **Google Picker API**
3. Configure the OAuth consent screen (External, add yourself as a Test user)
4. Create an **OAuth Client ID** (Web app)
   - Authorized JavaScript origins: `http://localhost:5173`, `http://localhost:4173`
5. Create an **API Key** and restrict it to Drive + Picker APIs
6. Copy `.env.example` to `.env` and paste your credentials:
   ```
   VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=AIza...
   ```
7. Restart `npm run dev`

## Build for production

```bash
npm run build
npm run preview
```

When you deploy (Vercel, Netlify, GitHub Pages), add the production URL to your **Authorized JavaScript origins** in the Cloud Console.

## SSB PDF formats supported

- With/without **Jantina** column
- With/without **Evidens** column
- Multi-page reports
- Statuses: *Belum Semak*, *Siap Hantar*, *Tidak Hantar*, *Hantar Lewat*
