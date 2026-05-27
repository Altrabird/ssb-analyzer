# SSB Analyzer

> Visualisasi laporan semakan buku kerja (SSB) terus dari Google Drive — kadar pematuhan, tren, jejak setiap murid, analisis subjek dan punca tidak hantar.

🌐 **Live:** https://altrabird.github.io/ssb-analyzer/
📊 **Stack:** Vite · React 18 · Tailwind CSS · Chart.js 4 · pdf.js
🔐 **Privasi:** Tiada server. Tiada backend. Semua PDF dianalisis terus dalam pelayar anda — fail asal tidak pernah dimuat naik ke mana-mana.

---

## Kandungan

- [Apa itu SSB Analyzer?](#apa-itu-ssb-analyzer)
- [Ciri-ciri](#ciri-ciri)
- [Pasang sebagai PWA](#pasang-sebagai-pwa)
- [Mula pantas (development tempatan)](#mula-pantas-development-tempatan)
- [Sambungkan ke Google Drive](#sambungkan-ke-google-drive)
- [Format PDF yang disokong](#format-pdf-yang-disokong)
- [Struktur projek](#struktur-projek)
- [Deployment (auto via GitHub Actions)](#deployment-auto-via-github-actions)
- [Lesen](#lesen)

---

## Apa itu SSB Analyzer?

Sistem yang membaca PDF **Laporan Semakan Buku Kerja** (yang biasanya dijana oleh sistem semakan SSB sekolah) dari satu folder Google Drive, kemudian menjana enam paparan analisis interaktif. Direka untuk guru sekolah rendah Malaysia yang ingin melihat corak pematuhan murid merentas masa, kelas dan subjek.

Boleh juga digunakan tanpa Drive — pengguna boleh drag-and-drop PDF ke dalam aplikasi atau cuba mod demo.

---

## Ciri-ciri

### Enam paparan analisis

| Paparan | Apa yang dipaparkan |
|---------|---------------------|
| **Ringkasan** | KPI keseluruhan (jumlah laporan, murid unik, kadar pematuhan, tarikh terkini) · jadual senarai laporan dengan Subjek + Catatan · donut taburan status dengan peratus di tengah · kad kelas terbaik & terlemah |
| **Pematuhan mengikut Kelas** | Carta bar mendatar dengan gradient + label nilai · garis sasaran 75% & amaran 50% · pengisihan ikut % / bilangan murid / nama · CSV export |
| **Analisis Subjek** | Bar Pematuhan ikut Subjek · heatmap Subjek × Kelas (rumah-rumah kombinasi yang bermasalah) · jadual pecahan dengan chip kelas · CSV export |
| **Tren mengikut Tarikh** | Carta garis dengan gradient mengisi · annotation 75%/50% threshold · mod "Setiap kelas" / "Keseluruhan" · heatmap Kelas × Tarikh dengan legenda |
| **Jejak Murid** | Jadual carian (nama, kelas, subjek, catatan, alasan) · pengisihan setiap lajur · klik baris → drill-down menunjukkan sejarah setiap rekod dengan Subjek, Guru, Alasan & Catatan · CSV export |
| **Alasan & Carta Kedudukan** | Donut + bar 10 alasan teratas · senarai alasan dengan kekerapan · Top 10 & Bottom 10 dengan **slider ambang minimum rekod** (elakkan bias bilangan sampel kecil) |

### Asas

- **Bahasa Melayu Malaysia** sepenuhnya untuk UI
- **Dark mode** dengan auto adjust theme charts
- **PWA** — boleh dipasang ke skrin utama, lancar tanpa browser chrome, cache untuk akses pantas
- **Responsif** — kerja pada desktop, tablet, telefon
- **Eksport CSV** dari setiap jadual
- **Sokong `prefers-reduced-motion`** — animasi off untuk pengguna yang mahu
- **Auto-update service worker** — refresh = versi terbaru

---

## Pasang sebagai PWA

### Komputer (Chrome / Edge)

1. Buka https://altrabird.github.io/ssb-analyzer/
2. Klik ikon **Install** di hujung kanan address bar (atau menu ⋮ → Install SSB Analyzer)
3. Aplikasi akan muncul di Start Menu / Dock — buka seperti aplikasi biasa

### Android (Chrome)

1. Buka URL → menu ⋮ → **Add to Home screen** atau **Install app**
2. Ikon muncul di home screen

### iPhone / iPad (Safari)

1. Buka URL → butang **Share** ↑ → **Add to Home Screen**

> **Nota:** Aplikasi sentiasa boleh dibuka secara offline (semua asset dicache), tapi sambungan ke Google Drive memerlukan internet sebab OAuth token perlu live.

---

## Mula pantas (development tempatan)

Prasyarat: **Node.js 18+** dan **npm**.

```bash
git clone https://github.com/Altrabird/ssb-analyzer.git
cd ssb-analyzer
npm install
cp .env.example .env
# Tambah VITE_GOOGLE_CLIENT_ID dan VITE_GOOGLE_API_KEY (rujuk seksyen seterusnya)
npm run dev
```

Buka http://localhost:5173

### Skrip npm

| Arahan | Apa ia buat |
|--------|-------------|
| `npm run dev` | Jalankan Vite dev server di port 5173 dengan HMR |
| `npm run build` | Bina untuk production ke `dist/` |
| `npm run preview` | Sajikan `dist/` di port 4173 untuk uji production build |
| `npm run generate-pwa-assets` | Jana semula ikon PWA daripada `public/logo-source.svg` |

---

## Sambungkan ke Google Drive

### Langkah pantas

1. Buat projek di https://console.cloud.google.com/
   - Gunakan akaun **personal Gmail** kalau akaun sekolah anda dikunci di bawah organisasi
2. **APIs & Services → Library** — enable:
   - Google Drive API
   - Google Picker API
3. **OAuth consent screen** (kini "Google Auth Platform"):
   - User Type: **External**
   - Tambah akaun anda di **Audience → Test users**
4. **Credentials → Create OAuth Client ID** (Web application):
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `http://localhost:4173`
     - `http://localhost`
     - `https://<your-user>.github.io` (untuk deployment)
   - **Authorized redirect URIs:** sama dengan di atas
5. **Credentials → Create API key:**
   - **HTTP referrers:**
     - `http://localhost:5173/*`
     - `https://<your-user>.github.io/*`
   - **API restrictions:** Drive API + Picker API sahaja
6. Tampal ke `.env`:
   ```dotenv
   VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=AIza...
   ```
7. Mulakan semula `npm run dev`

### Akaun Workspace (cth `*.edu.my`)

Akaun Google Workspace dikendalikan oleh admin selalunya menyekat OAuth dari projek Cloud luar. Penyelesaian:
- **Buat projek Cloud dengan personal Gmail** — Cloud project memegang "identiti aplikasi", bukan data
- **Tambah akaun sekolah sebagai Test user** di OAuth consent screen
- Sign in dalam aplikasi guna akaun sekolah — pop-up Google akan kata "App not verified" → **Advanced → Go to SSB Analyzer (unsafe)** — selamat sebab anda yang miliki projek

### Pintasan folder Drive

Daripada klik melalui Picker setiap kali, tampal URL folder ke kotak **Pintasan folder Drive** pada skrin connect:

```
https://drive.google.com/drive/folders/1l5d_8k_QvQ8ax3MlPxSSqVkWXezhkmap?usp=sharing
```

Aplikasi akan ekstrak folder ID, list semua PDF dalam folder itu, parse dan terus paparkan dashboard. URL disimpan di `localStorage` jadi visit seterusnya cukup klik **Sambung folder**.

---

## Format PDF yang disokong

Parser dibuat untuk format laporan SSB seperti ini:

```
LAPORAN SEMAKAN BUKU KERJA
Tarikh: 2026-05-05  Kelas: 3 INTELEK
Guru: HARSIDI       Subjek: BI
Catatan: WORKBOOK 28 NU.2          Dihasilkan pada: 5/5/2026, 5:17:40 PM

No  Nama Murid                            Status         Alasan          Evidens
1   ADAM FIRDAUS BIN ABDULLAH             Hantar         -               -
2   EDRY QUSYAIRI BIN MOHD FAIZAL         Hantar         -               -
3   MOHAMAD NAJIB BIN SAMADE              Tidak Hantar   Sakit           -
...

RUMUSAN:
Jumlah Murid: 28
Siap Hantar: 27
Tidak Hantar: 1
Peratusan: 96%
```

Status yang diiktiraf (dipetakan ke label kanonik):

| Status PDF | Label dalaman |
|------------|---------------|
| `Hantar` / `Siap Hantar` / `Selesai` | **Siap Hantar** |
| `Tidak Hantar` / `Belum Hantar` | **Tidak Hantar** |
| `Belum Semak` | **Belum Semak** |
| `Hantar Lewat` | **Hantar Lewat** |

Juga disokong:
- Format dengan / tanpa lajur **Jantina** (L/P)
- Format dengan / tanpa lajur **Evidens**
- PDF berbilang halaman
- Header berbilang baris (Subjek + Catatan pada baris berasingan)

Kalau format PDF anda menggunakan label status lain, edit `STATUS_PATTERNS` di `src/lib/pdfParser.js`.

---

## Struktur projek

```
SSB Analyzer/
├── .github/workflows/deploy.yml       # GitHub Actions: build + deploy to Pages
├── public/
│   ├── favicon.svg
│   ├── logo-source.svg                # 512×512 source for PWA icon generator
│   ├── pwa-{64,192,512}.png           # generated PWA icons
│   ├── apple-touch-icon-180x180.png
│   └── maskable-icon-512x512.png
├── src/
│   ├── App.jsx                        # phase routing: connect → loading → dashboard
│   ├── main.jsx
│   ├── index.css                      # Tailwind + custom layers
│   ├── components/
│   │   ├── ConnectScreen.jsx          # sign-in + folder URL + demo + .env hint
│   │   ├── Sidebar.jsx                # desktop nav + mobile pill bar
│   │   ├── TopBar.jsx                 # title, search, theme toggle
│   │   ├── KpiCard.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── InstallPrompt.jsx          # beforeinstallprompt PWA banner
│   │   ├── Logo.jsx
│   │   └── views/
│   │       ├── OverviewView.jsx
│   │       ├── ComplianceView.jsx
│   │       ├── SubjectView.jsx
│   │       ├── TrendView.jsx
│   │       ├── StudentsView.jsx
│   │       └── ReasonsView.jsx
│   ├── lib/
│   │   ├── pdfParser.js               # pdf.js positional parser + STATUS_PATTERNS
│   │   ├── googleDrive.js             # GIS OAuth + Drive API + Picker
│   │   ├── aggregate.js               # summarize / byClass / bySubjek / roster / reasons
│   │   ├── chartConfig.js             # Chart.js defaults, gradients, thresholds
│   │   ├── utils.js                   # date format, dedup helpers, palette
│   │   └── demoData.js                # bundled sample reports
│   └── hooks/useTheme.js
├── tailwind.config.js
├── vite.config.js                     # plugins: react + VitePWA
├── pwa-assets.config.js               # icon generator config
├── package.json
└── .env.example
```

---

## Deployment (auto via GitHub Actions)

Setiap `git push` ke `main` mencetuskan workflow `.github/workflows/deploy.yml`:

1. Checkout + setup Node 20 + `npm ci`
2. Build dengan secrets `VITE_GOOGLE_CLIENT_ID` + `VITE_GOOGLE_API_KEY` disuntik dari **GitHub repo secrets** (encrypted; tidak terdedah di output)
3. Upload `dist/` sebagai Pages artifact
4. Deploy ke GitHub Pages (`actions/deploy-pages@v4`)

Setiap kali anda push, ~30 saat kemudian live URL akan refresh. Tidak perlu manual deploy.

### Setup secrets sekali sahaja

```bash
gh secret set VITE_GOOGLE_CLIENT_ID --body "<your client id>"
gh secret set VITE_GOOGLE_API_KEY --body "<your api key>"
```

Atau melalui UI: **Repo Settings → Secrets and variables → Actions → New repository secret**.

### Enable Pages dari Actions sekali sahaja

```bash
gh api -X POST repos/<user>/<repo>/pages -f build_type=workflow
```

Atau UI: **Repo Settings → Pages → Source: GitHub Actions**.

---

## Lesen

Projek peribadi. Tiada lesen rasmi — gunakan dan ubah suai untuk keperluan anda sendiri.

Untuk laporan masalah atau cadangan: buka issue di https://github.com/Altrabird/ssb-analyzer/issues
