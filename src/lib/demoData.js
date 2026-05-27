// Demo data so the analyzer can be previewed before connecting Google Drive.
// Modelled on the real Laporan SSB structure (3 INTELEK, 2 KRITIS, 1 Amanah, etc.)

const NAMES = {
  '3 INTELEK': [
    'ADAM FIRDAUS BIN ABDULLAH', 'EDRY QUSYAIRI BIN MOHD FAIZAL', 'MOHAMAD NAJIB BIN SAMADE',
    'MOHAMAD RAMADHAN BIN MOHAMAD SALLEH', 'MUHAMMAD AMIIN ALHADI BIN MOHD HISWADI',
    'MUHAMMAD FAHIM DARWISY BIN MUHAMMAD FAIZ', 'MUHAMMAD HAIZUL BIN ABDUL HAFID',
    'MUHAMMAD IKHWAN RAUHILLAH LIM ABDULLAH', 'MUHAMMAD IRSYAD BIN ABDULLAH',
    'MUHAMMAD NAZMI FAIZ BIN NISWAN', 'MUHAMMAD SHARHAN HARITH BIN RAHMAN',
    'MUHAMMAD SYEIK ZULKARNAIN BIN HAERIL', 'MUHAMMAD ZHAFIF ASYRAF BIN MOHAMMAD KHAIRIL',
    'MUHAMMED YUSOF ALEXANDER BIN RUDIH', 'NORHISYAM BIN ABDULLAH', 'RAYYAN DANISH BIN ABDULLAH',
    'AFIQAH BINTI ABDUL UAHAB @ ABDUL WAHAB', 'HASLIANA BINTI ABDULLAH',
    'NUR AMANINA MARDHIYAH BINTI SHAIN', 'NUR ANNYZAH BINTI RASAK',
    'NUR AYRA MIKAYLA BINTI ABDULLAH', 'NUR SHARILA BALQIS BINTI ALI RAHMAN',
    'NURIFFA AMANY BINTI ABDULLAH', 'NURSIKIN NAZIRAH BINTI RUDY',
    'NURUL AISYAH BALQIS BINTI LAAZMI', 'NURUL MAIZARAH AMIRAH BINTI SOFIAN',
    'PUTRI SYAZANANI FIRZANAH BINTI SAMSUDIN', 'QHAIRA ATHIRAH BINTI GUSMAN',
  ],
  '2 KRITIS': [
    'ALIF MUKHZANI BIN HAMIDUN', 'EIDLAN HAQIMI BIN ADIE', 'MOHAMAD IQBAL BIN MOHD SAKIR',
    'MOHAMMAD HAFIZUL BIN DATU IDRIL', 'MUHAMMAD AFIQ ZAYYAN BIN JARMAN',
    'MUHAMMAD AISH MIKHAIL BIN ABDULLAH', 'MUHAMMAD AL QODRI BIN ANCHI',
    'MUHAMMAD ASYARI BIN ABDULLAH', 'MUHAMMAD HARRAZ HAZRAFF BIN MOHAMMAD HAFIZ',
    'MUHAMMAD KHUSYAIRI BIN SULAIMAN', 'MUHAMMAD RAYQAL BIN AHMAD AL HADI',
    'MUHAMMAD RAYYAN RIZQI BIN MOHD.RIZAN', 'MUHAMMAD RIAZ ARYAN BIN IRWAN',
    'MUHAMMAD SYAHIRUL BIN ISAK', 'MUHAMMAD SYAMSUL RIZAL BIN UMAR',
    'MUHAMMAD UMAR QAIS BIN FASLAM', 'MUHAMMAD ZIYAD QHUZAIRY BIN MOHD FIRDAUS',
    'AZZIEDA IFRA MIKAYLA BINTI ABDEL AZIZ', 'DAMIAA HAFIYAH BINTI ABDULLAH',
    'HASYA HANA BINTI HASRIE', 'MAYRA MARNYSA BINTI MURANSAH',
    'NOR IZARAH SYAFIYAH BINTI SUBRY', 'NUR IZZATI ZAQIYAH BINTI KING FAISAL',
    'NUR RIANI BINTI RAMLI', 'NUR SYIFAA HAURA BINTI SERMAN',
    'NUR ZHAFIRAH BINTI MAZLY ADZILAN', 'NURUL SAFIYYAH NABILA BINTI MOHAMAD HAFIEZ',
    'PUTRI NUR IZZAH SYAZWANI BINTI MUHAMAD AZLAN', 'SHIRIN ELEENA BINTI ABDULLAH',
    'SYARIFAH AAFIYAH BINTI ALNIEZHAR A.SAILABBI',
  ],
  '1 Amanah': ['Ahmad bin Ali', 'Siti binti Abu', 'Chong Wei', 'Mei Ling', 'Ramasamy', 'Fatimah'],
  '2 INOVATIF': [
    'ALIF DANISH BIN AZHAR', 'ARIF HAZIQ BIN MOHD', 'AZRIL HAFIZ BIN KAMAL',
    'DANIEL IRFAN BIN ARIF', 'HAFIZ AIMAN BIN HALIM', 'KHAIRUL ARIFFIN BIN ZULKIFLI',
    'LUQMAN HAKIM BIN MOHD NOOR', 'MIRZA AKMAL BIN HAFIZAN', 'RAQIB IMRAN BIN HAMIM',
    'SYAFIQ DANISH BIN SUHAIMI', 'WAFIQ AIMAN BIN ZULFIKAR', 'YUSUF HARITH BIN AHMAD',
    'ALIYA SOFEA BINTI ZAINAL', 'BALQIS HUDA BINTI MAZLAN', 'DALILAH IZZAH BINTI KAMAR',
    'INTAN ZAHRA BINTI KHAIRUL', 'NUR HANA BINTI RAZIF', 'NUR ILYANA BINTI ZULKARNAIN',
    'PUTERI ALEEYA BINTI HAZIM', 'PUTERI SYAFIYAH BINTI HAFIZ', 'QASEH ZAHRA BINTI AMRAN',
    'SAFIA BALQIS BINTI MOHD ALI', 'SYAZA NUR AISYAH BINTI MOKHTAR',
    'WAFA HANIA BINTI ZULHELMI', 'ZARA AMANI BINTI AZMAN',
  ],
  '4 INOVATIF': [
    'AIDIL ARIF BIN HASRI', 'AMIRUL HAKIM BIN AZIZAN', 'DANISH IMAN BIN HAFIZ',
    'FARHAN MIKHAIL BIN JAMAL', 'IRSYAD HAZIQ BIN MOHD', 'KHALIL HARITH BIN KAMAL',
    'MOHD AIDEEL BIN SAIFUL', 'NAJWAN ARIF BIN ZULFIKAR', 'RAYAN IMRAN BIN RAZIF',
    'SYAFIQ HARITH BIN MOKHTAR', 'AISYAH HUMAIRA BINTI IZHAR', 'AMIRA HANI BINTI HARIS',
    'DAMIA ZAHRA BINTI MOHD ALI', 'IZZAH AMANI BINTI KAMARUL', 'NUR HAFIZA BINTI ZAINAL',
    'NUR IZNI BINTI MAZLAN', 'PUTRI SOFEA BINTI HAZIM', 'SARAH HANA BINTI ZUL',
    'SITI BALQIS BINTI AHMAD', 'ZAHRA IRDINA BINTI HALIM',
  ],
  '6 INOVATIF': [
    'ADAM RAZIF BIN HAZIM', 'AKMAL DANISH BIN SUHAIMI', 'AMRI HARITH BIN MOKHTAR',
    'ARIF SOFEAN BIN ZAINAL', 'DANIEL HARRAZ BIN KAMAL', 'FARID ARIF BIN HAFIZ',
    'HAZIQ IRFAN BIN MAZLAN', 'IMRAN HAKIM BIN KAMARUL', 'LUQMAN HARITH BIN AHMAD',
    'MUSTAQIM BIN ZULFIKAR', 'AISYAH IZZAH BINTI HALIM', 'AMIRA SOFEA BINTI HASRI',
    'BALQIS HANA BINTI MOHD', 'DAMIA ZAHRA BINTI AZMAN', 'IRDINA NUR BINTI AZIZAN',
    'NUR ALYA BINTI KHAIRUL', 'NUR DAMIA BINTI RAZIF', 'PUTRI HUDA BINTI HAFIZ',
    'SARAH AMANI BINTI MOKHTAR', 'ZARA IZNI BINTI ZUL',
  ],
}

const REASONS = [
  'Buku tertinggal di rumah',
  'Tidak hadir ke sekolah',
  'Buku rosak',
  'Tidak siap kerja',
  'Murid sakit',
  'Aktiviti kokurikulum',
]

function pseudoRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function makeReport(kelas, dateStr, seed, guru = null, subjek = null) {
  const rand = pseudoRandom(seed)
  const students = NAMES[kelas].map((nama, i) => {
    const r = rand()
    let status
    if (r < 0.65) status = 'Siap Hantar'
    else if (r < 0.92) status = 'Tidak Hantar'
    else status = 'Belum Semak'
    const alasan = status === 'Tidak Hantar' && rand() < 0.7 ? REASONS[Math.floor(rand() * REASONS.length)] : null
    return {
      no: i + 1,
      nama,
      jantina: kelas === '1 Amanah' ? (i % 2 === 0 ? 'L' : 'P') : null,
      status,
      alasan,
      evidens: status === 'Siap Hantar' && rand() < 0.2 ? 'foto.jpg' : null,
    }
  })
  const siap = students.filter((s) => s.status === 'Siap Hantar').length
  const tidak = students.filter((s) => s.status === 'Tidak Hantar').length
  return {
    id: `demo-${kelas}-${dateStr}`,
    fileName: `Laporan_SSB_${kelas}_${dateStr}.pdf`,
    source: 'demo',
    header: {
      tarikh: dateStr,
      kelas,
      guru,
      subjek,
      catatan: null,
      dihasilkan: null,
    },
    summary: {
      jumlahMurid: students.length,
      siapHantar: siap,
      tidakHantar: tidak,
      peratusan: Math.round((siap / students.length) * 1000) / 10,
    },
    students,
    raw: { hasJantina: kelas === '1 Amanah', hasEvidens: kelas !== '1 Amanah' },
  }
}

export const demoReports = [
  makeReport('1 Amanah', '2026-04-23', 11, 'Pn. Suriani', 'Matematik'),
  makeReport('1 Amanah', '2026-05-02', 12, 'Pn. Suriani', 'Matematik'),
  makeReport('1 Amanah', '2026-05-23', 13, 'Pn. Suriani', 'Matematik'),
  makeReport('2 KRITIS', '2026-04-23', 21, 'En. Faizal', 'Bahasa Melayu'),
  makeReport('2 KRITIS', '2026-05-23', 22, 'En. Faizal', 'Bahasa Melayu'),
  makeReport('2 INOVATIF', '2026-04-23', 31, 'Pn. Hidayah', 'Sains'),
  makeReport('2 INOVATIF', '2026-05-23', 32, 'Pn. Hidayah', 'Sains'),
  makeReport('3 INTELEK', '2026-04-23', 41, 'Cik Aida', 'Bahasa Inggeris'),
  makeReport('3 INTELEK', '2026-05-02', 42, 'Cik Aida', 'Bahasa Inggeris'),
  makeReport('3 INTELEK', '2026-05-23', 43, 'Cik Aida', 'Bahasa Inggeris'),
  makeReport('4 INOVATIF', '2026-04-23', 51, 'En. Rashid', 'Matematik'),
  makeReport('4 INOVATIF', '2026-05-23', 52, 'En. Rashid', 'Matematik'),
  makeReport('6 INOVATIF', '2026-04-23', 61, 'Pn. Norliza', 'Pendidikan Islam'),
  makeReport('6 INOVATIF', '2026-05-23', 62, 'Pn. Norliza', 'Pendidikan Islam'),
]
