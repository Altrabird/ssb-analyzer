# Changelog

Semua perubahan ketara untuk projek SSB Analyzer.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
dan projek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

Tiada perubahan tertunda.

---

## [1.4.0] — 2026-05-27

### Added
- **Paparan Analisis Subjek** — view ke-6 yang baharu (`SubjectView.jsx`)
  - Bar chart pematuhan mengikut subjek dengan gradient, label nilai, threshold annotations
  - Heatmap Subjek × Kelas untuk kenal pasti kombinasi bermasalah
  - Jadual pecahan dengan chip kelas, eksport CSV
  - Empty state bila tiada subjek diisi dalam laporan
- **Slider ambang minimum rekod** dalam Carta Kedudukan
  - Default = `max(3, ceil(maxRecords × 0.5))` untuk elakkan bias sampel kecil
  - Murid 6/6 = 100% tidak lagi outrank murid 14/15 = 93%
  - Tunjuk bilangan murid yang layak vs jumlah keseluruhan

### Fixed
- Top 10 / Bottom 10 leaderboard bias bilangan sampel kecil

---

## [1.3.0] — 2026-05-27

### Added
- **Chart upgrades dari ui-ux-pro-max v2.5.0**
  - `chartjs-plugin-datalabels` + `chartjs-plugin-annotation`
  - Threshold annotations 75% sasaran + 50% amaran (dashed lines)
  - Bar charts: gradient mendatar + label nilai colour-tiered
  - Line charts: area gradient fills + white-bordered points + colourblind borderDash
  - Doughnut Overview: center text plugin papar peratus keseluruhan
  - All charts: multi-line tooltips + delta-from-average footer
  - Heatmap cells: hover scale-up 110%, native title tooltip
- `prefers-reduced-motion` dihormati sepenuhnya — animasi off untuk pengguna mahu

---

## [1.2.0] — 2026-05-27

### Added
- **Progressive Web App (PWA)** support via `vite-plugin-pwa`
  - 64/192/512px icons + 180px Apple touch + 512px maskable dari `public/logo-source.svg`
  - `manifest.webmanifest` dengan scope, standalone display, ms-MY lang
  - Service worker autoUpdate dengan Workbox runtimeCaching
  - Google Fonts CacheFirst (1 tahun), Google APIs NetworkOnly (token segar)
  - InstallPrompt component listen `beforeinstallprompt`
- Theme-color light/dark variants
- Mobile-web-app-capable + apple-touch-icon links

---

## [1.1.0] — 2026-05-27

### Added
- **Subjek + Catatan** dipaparkan dalam:
  - Lajur baharu "Catatan" di Ringkasan → Senarai Laporan
  - Drill-down Jejak Murid: setiap rekod papar Kelas · Subjek · Guru + kotak Catatan
  - Carian termasuk subjek, catatan, alasan
- Pengendalian ralat OAuth/Drive yang lebih jelas (`stringifyError` helper)

### Changed
- **Polish Bahasa Malaysia tulen**: `ikut` → `mengikut`, `dari` → `daripada`, `Leaderboard` → `Carta Kedudukan`, `Pandangan tahap tinggi` → `Tinjauan keseluruhan`
- **`normalizeName`** lebih tepat — gantikan aksara khas dengan ruang sebelum collapse
  (sebelum: `MOHD.RIZAN` dan `MOHD RIZAN` dianggap berbeza; selepas: sama)

### Fixed
- **Parser bug serius**: status pendek `Hantar` (bukan `Siap Hantar`) digugurkan secara senyap
  - Mengakibatkan ~75% murid tidak diiktiraf di peringkat individu
  - Murid Unik dari 56 → ~150+ selepas pembetulan
  - Pemetaan kanonik: `Hantar`/`Selesai` → `Siap Hantar`, `Belum Hantar` → `Tidak Hantar`
  - Word-boundary check elakkan `Hantar` salah-padan dalam `Tidak Hantar`
- **Header parser**: Subjek dan Catatan pada baris berasingan dahulunya gagal dikenal
  - `extractField()` baharu walk fullText, terminate pada label seterusnya atau newline

---

## [1.0.0] — 2026-05-27

### Added
- Initial release: Vite + React + Tailwind dashboard
- 5 paparan asal:
  - Ringkasan (KPI + senarai laporan + donut status)
  - Pematuhan mengikut Kelas (bar + table)
  - Tren mengikut Tarikh (line + heatmap)
  - Jejak Murid (searchable table + drill-down)
  - Alasan & Carta Kedudukan (donut + leaderboards)
- Google Drive integration via OAuth + Picker API + folder URL shortcut
- Demo mode dengan 14 synthetic reports
- Local file upload fallback
- Dark mode, dwi-bahasa (sebahagian), responsive
- Deployment ke GitHub Pages via GitHub Actions
- CSV export
