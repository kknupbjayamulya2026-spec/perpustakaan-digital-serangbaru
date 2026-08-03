'use strict';

/* =========================================================
   PERPUSTAKAAN DIGITAL SERANG BARU — MAIN.JS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initActiveMenu();
  initFadeInObserver();
  initGallery();
  initScrollTop();
  initBookCollection();
});

/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   Sticky navbar background on scroll
--------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const toggleScrolled = () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });
}

/* ---------------------------------------------------------
   Mobile hamburger menu
--------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navMenu');
  if (!toggle || !nav) return;

  const scrim = document.createElement('div');
  scrim.className = 'nav-scrim';
  document.body.appendChild(scrim);

  const closeMenu = () => {
    toggle.classList.remove('active');
    nav.classList.remove('open');
    scrim.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    toggle.classList.add('active');
    nav.classList.add('open');
    scrim.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  scrim.addEventListener('click', closeMenu);

  nav.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ---------------------------------------------------------
   Smooth scrolling for in-page anchors
--------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', targetId);
    });
  });
}

/* ---------------------------------------------------------
   Active menu link while scrolling (IntersectionObserver)
--------------------------------------------------------- */
function initActiveMenu() {
  const navLinks = document.querySelectorAll('[data-nav]');
  if (!navLinks.length) return;

  const sectionIds = ['home', 'profil-desa', 'visi-misi', 'galeri', 'buku', 'lokasi'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', match);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* ---------------------------------------------------------
   Fade-in animation when sections/elements appear
--------------------------------------------------------- */
function initFadeInObserver() {
  const items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ---------------------------------------------------------
   Gallery lightbox
--------------------------------------------------------- */
function initGallery() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  if (!items.length || !lightbox) return;

  const imgEl = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let currentIndex = 0;

  const show = (index) => {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const img = item.querySelector('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    captionEl.textContent = item.dataset.caption || img.alt;
  };

  const open = (index) => {
    show(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  items.forEach((item, index) => {
    item.addEventListener('click', () => open(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(currentIndex - 1));
  nextBtn.addEventListener('click', () => show(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
}

/* ---------------------------------------------------------
   Scroll to top button
--------------------------------------------------------- */
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      btn.classList.toggle('visible', window.scrollY > 480);
    },
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* =========================================================
   KOLEKSI BUKU — Sumber: Google Drive
   Setiap buku merupakan file yang tersimpan di Google Drive
   (dibagikan dengan akses "Siapa saja yang memiliki tautan").
   ========================================================= */

const CATEGORY_LABELS = {
  tk: 'PAUD / TK',  
  sd: 'Pelajaran SD',
  smp: 'Pelajaran SMP',
  sma: 'SMA/SMK',
  anak: 'Cerita Anak',
  novel: 'Novel',
  komik: 'Komik',
};

const CATEGORY_ICONS = {
  sd: 'fa-child-reaching',
  smp: 'fa-user-graduate',
  sma: 'fa-user-graduate',
  tk: 'fa-puzzle-piece',
  anak: 'fa-shapes',
  novel: 'fa-feather',
  komik: 'fa-images',
};

/* driveId = ID file Google Drive (diambil dari tautan berbagi) */
const BOOK_LIBRARY = [
  // ---------------- SMP ----------------
  { title: 'Bahasa Indonesia SMP', category: 'smp', driveId: '1UMHVEXsut4dtVl8hUegtxba2czeFTR4o' },
  { title: 'Bahasa Inggris SMP', category: 'smp', driveId: '11ajT2ATkC_XgXQUl8oYD_z1Gv6MCwtnA' },
  { title: 'IPA Kelas 7', category: 'smp', driveId: '1Dr4zG3vLLTi8nWZQQ9Imaodl-TwC75vn' },
  { title: 'IPA Kelas 8', category: 'smp', driveId: '1AU9SKC9ceXPAsljj_mPMUHZCZzu6k8jo' },
  { title: 'IPA Kelas 9', category: 'smp', driveId: '1hR2hcfl4TbYQQf9hdPMCgtEfyZkAFHeW' },
  { title: 'IPS Kelas 7', category: 'smp', driveId: '1Ktezh85YWz9dDUsMSGKPznbHAGP7LRLN' },
  { title: 'IPS Kelas 8', category: 'smp', driveId: '1pvKG15pTTTWe3fkFClIMiI8668xr1xLs' },
  { title: 'IPS Kelas 9', category: 'smp', driveId: '11i3oAcxqTehFLKSxw10BlPappHW4JfWX' },
  { title: 'Kumpulan Rumus Matematika', category: 'smp', driveId: '1BROaLn8hFpDavarXyB3Wcxw_5WU4STiH' },
  { title: 'Matematika Kelas 7', category: 'smp', driveId: '1tQQ1vWUK0lflEVR7_WsbrY30wLoLZ8Et' },
  { title: 'Matematika Kelas 8', category: 'smp', driveId: '1HC4oBMRYkQpeTbhlI619sFyUaEhq_CWt' },
  { title: 'Matematika Kelas 9', category: 'smp', driveId: '18ALtnDgHebQOartq5Kq8Y1ZywJzSleEM' },

  // ---------------- KOMIK ----------------
  { title: 'Bagi Hotspot', category: 'komik', driveId: '1Kz2576XkC6aE6xXkaZU4CPsSbI4iGJMD' },
  { title: 'Banyak Teman', category: 'komik', driveId: '13fIGZk6IL7vzcW1K00bbtksndtAc3mCn' },
  { title: 'Bolos Piket', category: 'komik', driveId: '1ryT46_cHaSL7LtIw4uCD7yQn7HMYxEUV' },
  { title: 'Boneka Kesayangan', category: 'komik', driveId: '1KxQu9lgj0WQIURehbCCS0DhEWcw3ZSo1' },
  { title: 'Buku Yang Tertukar', category: 'komik', driveId: '1L0qNB4lsWmAaSXZPf29TowEfu4v1n1Gl' },
  { title: 'Mendadak Lebaran', category: 'komik', driveId: '1gCYHXXSHMeSWkkq7PoX3spy0XIg0asOR' },
  { title: 'Nasib', category: 'komik', driveId: '1szV-QCayqYiT0wFkaWQbSR0zSNe8Lrql' },
  { title: 'Pentingnya Menuntut Ilmu', category: 'komik', driveId: '1l5rSICRmVY1Y4xYuFuwqg3IwDvbRkAT8' },
  { title: 'Puasa Pertama', category: 'komik', driveId: '1zczkjoULMAXcI54Ostd8v3pGkITz_UMq' },

  // ---------------- NOVEL ----------------
  { title: 'Ayat-ayat Api', category: 'novel', driveId: '1md9kjJ_4eTJahBf8Z1b0v4tuHeyh9opO' },
  { title: 'Bulan', category: 'novel', driveId: '1jOlnXjqv3uMkpTzxE98dueH70I4Ihcqj' },
  { title: 'Bumi', category: 'novel', driveId: '1I_mCMSJ4m7GarjxHmNewGk0UgCMzPOsT' },
  { title: 'Laut Bercerita', category: 'novel', driveId: '1feuS10m8M7WWf_zLXXrGhJG3m-wJgHG3' },
  { title: 'Matahari', category: 'novel', driveId: '1OI1EqA0iuV3XTNwlsCa_kBznfCozPsWt' },
  { title: 'Negeri Di Ujung Tanduk', category: 'novel', driveId: '1PFgzzQ2XIh8VSFK9jv1oBQcr5DGqjirh' },
  { title: 'Sebuah Seni Untuk Bersikap Bodo Amat', category: 'novel', driveId: '1-ouvm7FUAJFx7Ppu_qEB6dpS-vkDGPla' },
  { title: 'The Falling Leaf Never Hates The Wind', category: 'novel', driveId: '1fs9afghSm8-e_7-6PWdWQj5kZjrU-nft' },
  { title: 'The Girl Who Fell Beneath The Sea', category: 'novel', driveId: '1WmpazL0XlTHjkHEF9FkwKsFi4A60UHcl' },
  { title: 'Unit Gaib Darurat: Seri Kisah Tanah Jawa', category: 'novel', driveId: '1w_zgZ68a_rSGrBXEZCRr9147hk1yZAYF' },
  { title: 'Yang Fana Adalah Waktu', category: 'novel', driveId: '14VDPF_tssMRoM2DB9hQpqePyAWVawgO2' },

  // ---------------- TK / PAUD ----------------
  { title: 'Bermain Sains', category: 'tk', driveId: '1CxHC7ji0WHITTVQ09W9S26UHokEowfOd' },
  { title: 'Buku Saku Pengembangan Literasi untuk Anak Usia 5-6 Tahun', category: 'tk', driveId: '1aqYTYin4AAcxZkpy3YpPcfLR7Ka82Nlm' },
  { title: 'Buku Saku Pengembangan Literasi untuk Anak Usia 7-8 Tahun', category: 'tk', driveId: '1mxLuB2cavTmF5z8kuMdyVosHI_P-Qzig' },
  { title: 'Disiplin Positif Pada Anak Usia Dini', category: 'tk', driveId: '1IwugJhLrDSHaTkEWi5VhwgsAETJMIv0a' },
  { title: 'Membangun Budi Pekerti Anak', category: 'tk', driveId: '1MXUj2w15uK8klzCJ9KBo51V_yxf-XifN' },
  { title: 'Membangun Jati Diri Anak', category: 'tk', driveId: '1EhL5Jzp61fWMwN4viA0YCLLekcvi8MNb' },
  { title: 'Membangun Kebhinekaan Global Pada Anak Usia Dini', category: 'tk', driveId: '1cgxC1PsuFBRmmeW1psggbQ5wU47swGWn' },
  { title: 'Membangun Tanggung Jawab Anak', category: 'tk', driveId: '1nV2ocyco0U-tV78m_26fy4XIIQ4MZZIh' },
  { title: 'Mendampingi Ananda Bermain Matematika Di Rumah', category: 'tk', driveId: '1wV2aDsyxYIQYhrnSk-uM-NwWX70Ck2qJ' },
  { title: 'Mengembangkan Ragam Kemampuan Anak', category: 'tk', driveId: '1iZn1nTdcqfEXDXSEXoS-zva_ba1P4WHO' },
  { title: 'Mengembangkan Literasi Awal Anak Di Keluarga', category: 'tk', driveId: '1mMcIkgQ9QEOfC36ponxXl8uUzIRgMvBk' },
  { title: 'Menjaga Kesehatan Anak Usia Dini', category: 'tk', driveId: '1m8EGvOu0WpvfB-tyzYNRtTtgRCp5dTa-' },
  { title: 'Menumbuhkan Minat Baca Anak', category: 'tk', driveId: '1X-GkAos6fdoVHH3dUw-jDf85f2VRPJ1q' },
  { title: 'Peran Orang Tua Dalam Program Pembelajaran', category: 'tk', driveId: '1x7Wcmd4_kIOWaEkHYx1Ut_2WgdXyDgfz' },
  { title: 'Serunya Bekerja Sama', category: 'tk', driveId: '1LLAT8IiySzGQoHmp5gykNeqgHGm_3rTv' },

  // ---------------- CERITA ANAK ----------------
  { title: 'Aku Ingin Sekolah', category: 'anak', driveId: '1mukNyYjm2dLWeCTigkQXlafx9KrF7Vdp' },
  { title: 'Amal Kecil Di Kamar Kecil', category: 'anak', driveId: '1Uwn0S4PSHHs02R-XZ3F5xSF4r2YP1OhH' },
  { title: 'Anak Muslim Menjaga Lingkungan', category: 'anak', driveId: '1DEbmHXBE6CudRHdfHcVoiY4uuFq2pqDC' },
  { title: 'Belajar Itu Menggembirakan', category: 'anak', driveId: '13aePKwOaXJx0ySWQd_mMilQPldoE-K5H' },
  { title: 'Bulan Bulan Haram', category: 'anak', driveId: '1WGoTlazrpXGJWNtt2n12fQFh5z2Kb2Yf' },
  { title: 'Pajak Kita', category: 'anak', driveId: '1oba02M92OosuK2HQOJc1b0Ja8x5-ZyQ3' },
  { title: 'Syifa Dan Burung Kenari', category: 'anak', driveId: '1KgPfFh8qSyzCNWgtxXGoyyrk9dsffELh' },
  { title: 'Kemana Monster Sungai Mengembara', category: 'anak', driveId: '1f56VhS1rKMugAyfF9K3bALP6_QYhZ_Nv' },
  { title: 'Menara Pelangi, Kiko, Dan Toko', category: 'anak', driveId: '1pvbFrq1Wc8RQ1qUtUYW4k2-zV1I4mh0p' },
  { title: 'Mengenal Kuman, Makhluk Kecil Ciptaan Tuhan', category: 'anak', driveId: '192IhLvfEQYTcKG3ILohCBzK7Ka2_7d-Z' },
  { title: 'Menjaga Bumi Allah', category: 'anak', driveId: '1HEElFGtp1VO1Jm-_PtCijsNuiaVZ6d9j' },
  { title: 'Cepat Tangkap', category: 'anak', driveId: '1BzO8cfLsXRl0EDR5HfloHKWfYAGDCU8c' },
  { title: 'Aku Anak Yang Mandiri', category: 'anak', driveId: '1jxXNYknjkipkwzM6ksAJkJdlIQPH5Rqo' },
  { title: 'Apa Yang Seru', category: 'anak', driveId: '1hKKoGftTZJEdy3VeldfCNwqiWvyv1C09' },
  { title: 'Tuuut Tuuut', category: 'anak', driveId: '1ImFkQsxFXJxG8cdmhVbHeG1OLTIY9QF0' },

  // ---------------- SD ----------------
  { title: 'Bahasa Indonesia Kelas 2', category: 'sd', driveId: '19TQwtc-pRhHsDZfIFM5UuB4uJHHIwjQm' },
  { title: 'Bahasa Indonesia Kelas 3', category: 'sd', driveId: '1pg7N1nppy-VXzLvcUwk7UrDW-Hu9ZEMn' },
  { title: 'Bahasa Indonesia Kelas 4', category: 'sd', driveId: '1_Pn-chiyAzThRUhZ6stn2EFl6JXosU2H' },
  { title: 'Benda Di Sekitarku', category: 'sd', driveId: '18bJEWQNW55r9Eu8y-k7vUE2JSdzQHv7d' },
  { title: 'Benda, Hewan, Dan Tanaman Di Sekitarku', category: 'sd', driveId: '1W36tobJNBjVkDmcA1k27AvEB5NWgdzZY' },
  { title: 'Berbagai Pekerjaan', category: 'sd', driveId: '13-_ys3eyZkH4tw-vxu2R44F7lEv6RT_4' },
  { title: 'Hidup Bersih Dan Sehat', category: 'sd', driveId: '1oRW-23kIMua9Sr4q9FzR9nK9IfivlCxG' },
  { title: 'Inti Doa Dan Kumpulan Doa Pilihan Berdasarkan Hadis', category: 'sd', driveId: '19tJ0km3CcpDGaby8syMWWz_aD1EW3GFj' },
  { title: 'Matematika Kelas 3', category: 'sd', driveId: '1GFZCnxI2sglt7uffqoHd4xrrC731HPmD' },
  { title: 'Matematika Kelas 4', category: 'sd', driveId: '1y0YBYAtyQ8r209EvDk-qwtB9YF4OWPlC' },
  { title: 'Matematika Kelas 6', category: 'sd', driveId: '1duAUAHeWiqBbuD98d-awa7Xg85G7aRGP' },
  { title: 'Pendidikan Agama Islam Kelas 1', category: 'sd', driveId: '1fDu-CMootGlE5frmkLWZb_wa4vwhLrid' },
  { title: 'Pendidikan Agama Islam Kelas 2', category: 'sd', driveId: '1-ZaH6CDfeyLW4UED-YgSIZRLE744Ftbl' },
  { title: 'Pendidikan Agama Islam Kelas 3', category: 'sd', driveId: '1DsMHxhWDuu--zBfldLD-FRoM1smjtVsv' },
  { title: 'Peristiwa Alam', category: 'sd', driveId: '1ADMez28GdjBgY--p7P1BmUuXMETcuylR' },
  { title: 'Pertumbuhan Dan Perkembangan Makhluk Hidup', category: 'sd', driveId: '1IPUU8XlWA2IPfVOYRklwTNi4Bow7pPT9' },
  { title: 'Selalu Berhemat Energi', category: 'sd', driveId: '1KGLJbBFsa-_CFuCtsLqk7acLdQdEyng7' },
  { title: 'Tugasku Sehari-hari', category: 'sd', driveId: '1RtskeZC4p-hOjmHMRDzkuW1KW4hJtm_0' },
  { title: 'Udara Bersih Bagi Kesehatan', category: 'sd', driveId: '1F30DssoCEGDEfayEqUqOJN4dc9r2ayFj' },
   
// ---------------- SMA / SMK ----------------
  { title: 'Panduan Guru Animasi', category: 'sma', driveId: '15XQuJ6M2LPTGqShyV9Bvtw5-QhNqzxNW' },
  { title: 'Pendidikan Agama Buddha dan Budi Pekerti', category: 'sma', driveId: '1cSDskdgCx36Z2BlYafW7Fv_D535YDgqQ' },
  { title: 'Dasar-Dasar Agriteknologi dan Pengolahan Pertanian', category: 'sma', driveId: '1nhj2l5rBqf02pa-qls2RaFzob0EOyi_d' },
  { title: 'Dasar-Dasar Teknik Konstruksi Kapal', category: 'sma', driveId: '1nJdYCggbSW4b7o1qK1P7XP8Q1tvJ1mRR' },
  { title: 'Panduan Guru Ekonomi', category: 'sma', driveId: '1Z8oDgr-v0Rj95ewe2-2vnjry57VuBDBp' },
  { title: 'Panduan Guru Bahasa Indonesia', category: 'sma', driveId: '19bJZhqSo2x51BX-bkv-ab2soYGLov-kf' },
  { title: 'Kuliner', category: 'sma', driveId: '1UwwcAxDAckM-uqJkGfuX_ssKfuUtGAGY' },
  { title: 'Dasar-Dasar Kuliner', category: 'sma', driveId: '1H3K3fIHi7dRX0BTtJl4i0Yy-VEFGQ8uP' },
  { title: 'Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan', category: 'sma', driveId: '1KAHPsbwfQqA30VZ2DT9xRqCj-8IDlyWS' },
  { title: 'Panduan Guru Prakarya dan Kewirausahaan : Budi Daya', category: 'sma', driveId: '1S8qhXp41hdZvTXiDnTwTNDbRXA-O90eD' },
  { title: 'Panduan Guru Prakarya dan Kewirausahaan : Rekayasa', category: 'sma', driveId: '1vAsxk_Qaj3VEZmCmjW4b3BXSiU6saGVo' },
  { title: 'Panduan Guru Seni Tari', category: 'sma', driveId: '1STJHuMp0dq8TYIfxwCIQtxBMaVQsutHg' },
  { title: 'Dasar-Dasar Furnitur', category: 'sma', driveId: '134cfOxwyLqT1z4ggdo48RkXLuCi0Df7y' },
  { title: 'Dasar-Dasar Teknik Geologi Pertambangan', category: 'sma', driveId: '11DXp4sLTPWYMdW8fiPWz013HzggiHpiN' },
];

/* Susun objek buku final lengkap dengan seluruh tautan Google Drive yang dibutuhkan */
const ALL_BOOKS = BOOK_LIBRARY.map((book, index) => {
  const id = book.driveId;
  return {
    uid: `book-${index}`,
    title: book.title,
    category: book.category,
    categoryLabel: CATEGORY_LABELS[book.category] || book.category,
    categoryIcon: CATEGORY_ICONS[book.category] || 'fa-book',
    driveId: id,
    thumbnail: `https://drive.google.com/thumbnail?id=${id}&sz=w400`,
    previewUrl: `https://drive.google.com/file/d/${id}/preview`,
    viewUrl: `https://drive.google.com/file/d/${id}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
  };
});

const INITIAL_VISIBLE_COUNT = 9;

const bookState = {
  activeCategory: 'semua',
  searchTerm: '',
  expanded: false,
};

function initBookCollection() {
  const grid = document.getElementById('bookGrid');
  const statusEl = document.getElementById('bookStatus');
  const searchInput = document.getElementById('bookSearch');
  const filterWrap = document.getElementById('bookFilters');
  const toggleBtn = document.getElementById('toggleBooksBtn');

  if (!grid) return;

  // Data buku bersifat lokal (statis) sehingga langsung tersedia tanpa
  // bergantung pada koneksi API eksternal — koleksi selalu tampil.
  if (statusEl) statusEl.hidden = true;
  renderBooks();

  // Search
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      bookState.searchTerm = e.target.value.trim().toLowerCase();
      bookState.expanded = false;
      renderBooks();
    }, 200);
  });

  // Category filter
  filterWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    filterWrap.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    bookState.activeCategory = chip.dataset.filter;
    bookState.expanded = false;
    renderBooks();
  });

  // Toggle show more / less
  toggleBtn.addEventListener('click', () => {
    bookState.expanded = !bookState.expanded;
    renderBooks();
    if (!bookState.expanded) {
      const section = document.getElementById('buku');
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });

  // Book detail modal
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.book-card');
    if (!card) return;
    openBookModal(card.dataset.uid);
  });

  initBookModal();
}

function getFilteredBooks() {
  let books = ALL_BOOKS;

  if (bookState.activeCategory !== 'semua') {
    books = books.filter((b) => b.category === bookState.activeCategory);
  }

  if (bookState.searchTerm) {
    const term = bookState.searchTerm;
    books = books.filter((b) => b.title.toLowerCase().includes(term));
  }

  return books;
}

function renderBooks() {
  const grid = document.getElementById('bookGrid');
  const emptyEl = document.getElementById('bookEmpty');
  const toggleBtn = document.getElementById('toggleBooksBtn');
  const toggleLabel = document.getElementById('toggleBooksLabel');

  const filtered = getFilteredBooks();
  const showAll = bookState.expanded || filtered.length <= INITIAL_VISIBLE_COUNT;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE_COUNT);

  grid.innerHTML = '';
  emptyEl.hidden = filtered.length !== 0;

  visible.forEach((book, i) => {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.uid = book.uid;
    card.style.animationDelay = `${(i % INITIAL_VISIBLE_COUNT) * 0.04}s`;

    card.innerHTML = `
      <div class="book-card__cover">
        <img src="${book.thumbnail}" alt="Sampul buku ${escapeHtml(book.title)}" loading="lazy"
             onerror="this.onerror=null;this.parentElement.innerHTML+='<div class=&quot;no-cover&quot;><i class=&quot;fa-solid ${book.categoryIcon}&quot;></i><span>${escapeHtml(book.categoryLabel)}</span></div>';this.remove();">
        <span class="book-card__badge">${escapeHtml(book.categoryLabel)}</span>
      </div>
      <div class="book-card__body">
        <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
        <span class="book-card__author"><i class="fa-brands fa-google-drive"></i> Tersimpan di Google Drive</span>
      </div>
    `;
    grid.appendChild(card);
  });

  if (filtered.length > INITIAL_VISIBLE_COUNT) {
    toggleBtn.hidden = false;
    toggleBtn.classList.toggle('expanded', bookState.expanded);
    toggleLabel.textContent = bookState.expanded
      ? 'Tampilkan Lebih Sedikit'
      : 'Tampilkan Koleksi Lengkap';
  } else {
    toggleBtn.hidden = true;
  }
}

function initBookModal() {
  const modal = document.getElementById('bookModal');
  const overlay = document.getElementById('bookModalOverlay');
  const closeBtn = document.getElementById('bookModalClose');
  if (!modal) return;

  const close = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Kosongkan iframe agar pemutaran/preview berhenti saat modal ditutup
    const frame = document.getElementById('bookModalFrame');
    if (frame) frame.src = '';
  };

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) close();
  });
}

function openBookModal(uid) {
  const book = ALL_BOOKS.find((b) => b.uid === uid);
  if (!book) return;

  const modal = document.getElementById('bookModal');
  const content = document.getElementById('bookModalContent');

  content.innerHTML = `
    <div class="modal__book">
      <div class="modal__book-head">
        <span class="book-card__badge"><i class="fa-solid ${book.categoryIcon}"></i> ${escapeHtml(book.categoryLabel)}</span>
        <h3>${escapeHtml(book.title)}</h3>
      </div>
      <div class="modal__preview">
        <iframe id="bookModalFrame" src="${book.previewUrl}" allow="autoplay" loading="lazy"
                title="Pratinjau ${escapeHtml(book.title)}"></iframe>
      </div>
      <div class="modal__book-actions">
        <a href="${book.viewUrl}" target="_blank" rel="noopener" class="btn btn--primary">
          <i class="fa-solid fa-book-open"></i> Buka di Tab Baru
        </a>
        <a href="${book.downloadUrl}" class="btn btn--outline">
          <i class="fa-solid fa-download"></i> Unduh Buku
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ---------------------------------------------------------
   Utilities
--------------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
