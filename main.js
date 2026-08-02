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
   KOLEKSI BUKU — Google Books API
   ========================================================= */

const BOOK_CATEGORIES = [
  {
    key: 'sd',
    label: 'Pelajaran SD',
    icon: 'fa-child-reaching',
    queries: [
      'buku matematika sekolah dasar kurikulum merdeka',
      'buku bahasa indonesia sekolah dasar',
      'buku pendidikan agama sekolah dasar',
    ],
  },
  {
    key: 'smp',
    label: 'Pelajaran SMP',
    icon: 'fa-user-graduate',
    queries: [
      'buku ipa smp kurikulum merdeka',
      'buku ips smp kurikulum merdeka',
      'buku matematika smp kurikulum merdeka',
    ],
  },
  {
    key: 'sma',
    label: 'Pelajaran SMA',
    icon: 'fa-graduation-cap',
    queries: [
      'buku matematika sma kurikulum merdeka',
      'buku bahasa inggris sma kurikulum merdeka',
      'buku fisika sma kurikulum merdeka',
    ],
  },
  {
    key: 'novel',
    label: 'Novel',
    icon: 'fa-feather',
    queries: ['novel indonesia terbaik', 'novel karya penulis indonesia'],
  },
  {
    key: 'biografi',
    label: 'Biografi Tokoh',
    icon: 'fa-user-tie',
    queries: ['biografi tokoh indonesia', 'biografi pahlawan nasional indonesia'],
  },
  {
    key: 'kamus',
    label: 'Kamus',
    icon: 'fa-spell-check',
    queries: ['kamus besar bahasa indonesia', 'kamus bahasa inggris indonesia'],
  },
  {
    key: 'anak',
    label: 'Cerita Anak',
    icon: 'fa-shapes',
    queries: ['buku cerita anak indonesia', 'komik anak indonesia'],
  },
];

const INITIAL_VISIBLE_COUNT = 9;

const bookState = {
  allBooks: [],
  activeCategory: 'semua',
  searchTerm: '',
  expanded: false,
  loaded: false,
};

function initBookCollection() {
  const grid = document.getElementById('bookGrid');
  const statusEl = document.getElementById('bookStatus');
  const emptyEl = document.getElementById('bookEmpty');
  const searchInput = document.getElementById('bookSearch');
  const filterWrap = document.getElementById('bookFilters');
  const toggleBtn = document.getElementById('toggleBooksBtn');
  const toggleLabel = document.getElementById('toggleBooksLabel');

  if (!grid) return;

  loadAllBooks()
    .then((books) => {
      bookState.allBooks = books;
      bookState.loaded = true;

      if (!books.length) {
        statusEl.classList.add('error');
        statusEl.innerHTML =
          '<i class="fa-solid fa-triangle-exclamation"></i> Koleksi tidak dapat dimuat saat ini. Periksa koneksi internet Anda dan muat ulang halaman.';
        return;
      }

      statusEl.hidden = true;
      renderBooks();
    })
    .catch(() => {
      statusEl.classList.add('error');
      statusEl.innerHTML =
        '<i class="fa-solid fa-triangle-exclamation"></i> Terjadi kesalahan saat memuat koleksi buku dari Google Books.';
    });

  // Search
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      bookState.searchTerm = e.target.value.trim().toLowerCase();
      bookState.expanded = false;
      renderBooks();
    }, 220);
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
    openBookModal(card.dataset.id);
  });

  initBookModal();
}

async function loadAllBooks() {
  const requests = BOOK_CATEGORIES.map((cat) => fetchCategoryBooks(cat));
  const results = await Promise.all(requests);

  const merged = new Map();
  results.flat().forEach((book) => {
    if (!merged.has(book.id)) merged.set(book.id, book);
  });

  return Array.from(merged.values());
}

async function fetchCategoryBooks(category) {
  const collected = [];

  for (const query of category.queries) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=8&langRestrict=id&printType=books`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data.items)) continue;

      data.items.forEach((item) => {
        const info = item.volumeInfo || {};
        if (!info.title) return;

        let thumbnail = null;
        if (info.imageLinks) {
          thumbnail = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || null;
          if (thumbnail) thumbnail = thumbnail.replace('http://', 'https://');
        }

        collected.push({
          id: item.id,
          title: info.title,
          authors: info.authors && info.authors.length ? info.authors.join(', ') : 'Penulis tidak diketahui',
          publisher: info.publisher || '-',
          publishedDate: info.publishedDate || '-',
          pageCount: info.pageCount || null,
          description: info.description || 'Deskripsi belum tersedia untuk buku ini.',
          thumbnail,
          infoLink: info.infoLink || item.selfLink || '#',
          category: category.key,
          categoryLabel: category.label,
        });
      });
    } catch (err) {
      console.warn('Gagal memuat kategori', category.key, query, err);
    }
  }

  return collected;
}

function getFilteredBooks() {
  let books = bookState.allBooks;

  if (bookState.activeCategory !== 'semua') {
    books = books.filter((b) => b.category === bookState.activeCategory);
  }

  if (bookState.searchTerm) {
    const term = bookState.searchTerm;
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.authors.toLowerCase().includes(term)
    );
  }

  return books;
}

function renderBooks() {
  const grid = document.getElementById('bookGrid');
  const emptyEl = document.getElementById('bookEmpty');
  const toggleBtn = document.getElementById('toggleBooksBtn');
  const toggleLabel = document.getElementById('toggleBooksLabel');
  const toggleIcon = document.getElementById('toggleBooksIcon');

  const filtered = getFilteredBooks();
  const showAll = bookState.expanded || filtered.length <= INITIAL_VISIBLE_COUNT;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE_COUNT);

  grid.innerHTML = '';
  emptyEl.hidden = filtered.length !== 0;

  visible.forEach((book, i) => {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.id = book.id;
    card.style.animationDelay = `${(i % INITIAL_VISIBLE_COUNT) * 0.04}s`;

    const coverHtml = book.thumbnail
      ? `<img src="${book.thumbnail}" alt="Sampul buku ${escapeHtml(book.title)}" loading="lazy">`
      : `<div class="no-cover"><i class="fa-solid fa-book"></i><span>Tanpa sampul</span></div>`;

    card.innerHTML = `
      <div class="book-card__cover">
        ${coverHtml}
        <span class="book-card__badge">${escapeHtml(book.categoryLabel)}</span>
      </div>
      <div class="book-card__body">
        <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
        <span class="book-card__author">${escapeHtml(book.authors)}</span>
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
  };

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) close();
  });
}

function openBookModal(bookId) {
  const book = bookState.allBooks.find((b) => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById('bookModal');
  const content = document.getElementById('bookModalContent');

  const coverHtml = book.thumbnail
    ? `<img src="${book.thumbnail}" alt="Sampul buku ${escapeHtml(book.title)}">`
    : `<div class="no-cover" style="width:100%;height:100%;"><i class="fa-solid fa-book" style="font-size:2rem;"></i></div>`;

  const shortDesc = stripHtml(book.description).slice(0, 420);
  const descSuffix = stripHtml(book.description).length > 420 ? '…' : '';

  content.innerHTML = `
    <div class="modal__cover">${coverHtml}</div>
    <div class="modal__info">
      <span class="book-card__badge">${escapeHtml(book.categoryLabel)}</span>
      <h3>${escapeHtml(book.title)}</h3>
      <p class="modal__author">${escapeHtml(book.authors)}</p>
      <div class="modal__meta">
        <span><strong>Penerbit:</strong> ${escapeHtml(book.publisher)}</span>
        <span><strong>Terbit:</strong> ${escapeHtml(book.publishedDate)}</span>
        ${book.pageCount ? `<span><strong>Halaman:</strong> ${book.pageCount}</span>` : ''}
      </div>
      <p class="modal__desc">${escapeHtml(shortDesc)}${descSuffix}</p>
      <a href="${book.infoLink}" target="_blank" rel="noopener" class="btn btn--primary">
        <i class="fa-solid fa-book-open"></i> Lihat di Google Books
      </a>
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

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || div.innerText || '';
}
