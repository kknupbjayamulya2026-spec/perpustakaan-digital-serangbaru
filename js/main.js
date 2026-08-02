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

const BOOK_CATEGORIES = {
  sd: 'Pelajaran SD', smp: 'Pelajaran SMP', sma: 'Pelajaran SMA',
  novel: 'Novel', biografi: 'Biografi Tokoh', kamus: 'Kamus',
};

function createBook(title, authors, category) {
  return {
    id: `${category}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    authors,
    category,
    categoryLabel: BOOK_CATEGORIES[category],
    previewLink: null,
    previewPromise: null,
  };
}

// Katalog tetap membuat jumlah dan kategorinya konsisten. Pratinjau Google Books
// dicari berdasarkan judul dan penulis saat buku dipilih, lalu URL-nya di-cache.
const BOOK_COLLECTION = [
  ...[
    ['Kamus Besar Bahasa Indonesia', 'Badan Pengembangan dan Pembinaan Bahasa'],
    ['Kamus Inggris Indonesia', 'John M. Echols dan Hassan Shadily'],
    ['Kamus Indonesia Inggris', 'John M. Echols dan Hassan Shadily'],
    ['Kamus Sinonim Bahasa Indonesia', 'Eko Endarmoko'],
    ['Kamus Praktis Bahasa Jepang Indonesia', 'Katsuhiko Kusano'],
  ].map(([title, authors]) => createBook(title, authors, 'kamus')),
  ...[
    ['Soekarno: Biografi Singkat 1901–1970', 'Hering Tjokroaminoto'],
    ['Hatta: Biografi Politik', 'Deliar Noer'],
    ['Ki Hadjar Dewantara', 'Abdurrachman Surjomihardjo'],
    ['R.A. Kartini', 'Pramoedya Ananta Toer'],
    ['Jenderal Sudirman', 'T. B. Simatupang'],
    ['B.J. Habibie: The Power of Ideas', 'Makmur Makka'],
    ['Cut Nyak Dien', 'M. A. H. Djalal'],
    ['Mohammad Natsir', 'Yusril Ihza Mahendra'],
    ['Nelson Mandela: Long Walk to Freedom', 'Nelson Mandela'],
    ['Steve Jobs', 'Walter Isaacson'],
  ].map(([title, authors]) => createBook(title, authors, 'biografi')),
  ...[
    ['Matematika untuk SD/MI Kelas I', 'Kementerian Pendidikan'],
    ['Bahasa Indonesia untuk SD/MI Kelas II', 'Kementerian Pendidikan'],
    ['Ilmu Pengetahuan Alam SD/MI Kelas III', 'Kementerian Pendidikan'],
    ['Pendidikan Pancasila SD/MI Kelas IV', 'Kementerian Pendidikan'],
    ['IPAS untuk SD/MI Kelas V', 'Kementerian Pendidikan'],
    ['Pendidikan Agama Islam SD/MI Kelas V', 'Kementerian Pendidikan'],
    ['Seni Budaya SD/MI Kelas VI', 'Kementerian Pendidikan'],
  ].map(([title, authors]) => createBook(title, authors, 'sd')),
  ...[
    ['Matematika untuk SMP/MTs Kelas VII', 'Kementerian Pendidikan'],
    ['Bahasa Indonesia untuk SMP/MTs Kelas VII', 'Kementerian Pendidikan'],
    ['Ilmu Pengetahuan Alam SMP/MTs Kelas VIII', 'Kementerian Pendidikan'],
    ['Ilmu Pengetahuan Sosial SMP/MTs Kelas VIII', 'Kementerian Pendidikan'],
    ['Bahasa Inggris untuk SMP/MTs Kelas IX', 'Kementerian Pendidikan'],
    ['Pendidikan Pancasila SMP/MTs Kelas IX', 'Kementerian Pendidikan'],
    ['Informatika SMP/MTs Kelas VIII', 'Kementerian Pendidikan'],
  ].map(([title, authors]) => createBook(title, authors, 'smp')),
  ...[
    ['Matematika untuk SMA/MA Kelas X', 'Kementerian Pendidikan'],
    ['Bahasa Indonesia untuk SMA/MA Kelas X', 'Kementerian Pendidikan'],
    ['Fisika untuk SMA/MA Kelas XI', 'Kementerian Pendidikan'],
    ['Kimia untuk SMA/MA Kelas XI', 'Kementerian Pendidikan'],
    ['Biologi untuk SMA/MA Kelas XII', 'Kementerian Pendidikan'],
    ['Ekonomi untuk SMA/MA Kelas XII', 'Kementerian Pendidikan'],
  ].map(([title, authors]) => createBook(title, authors, 'sma')),
  ...[
    ['Laskar Pelangi', 'Andrea Hirata'],
    ['Bumi', 'Tere Liye'],
    ['Negeri 5 Menara', 'Ahmad Fuadi'],
    ['Perahu Kertas', 'Dee Lestari'],
    ['Pulang', 'Tere Liye'],
    ['Siti Nurbaya', 'Marah Rusli'],
    ['Bumi Manusia', 'Pramoedya Ananta Toer'],
    ['Ayat-Ayat Cinta', 'Habiburrahman El Shirazy'],
    ['Dilan: Dia adalah Dilanku Tahun 1990', 'Pidi Baiq'],
    ['Ronggeng Dukuh Paruk', 'Ahmad Tohari'],
  ].map(([title, authors]) => createBook(title, authors, 'novel')),
];

const INITIAL_VISIBLE_COUNT = 9;

const bookState = {
  allBooks: [],
  activeCategory: 'semua',
  searchTerm: '',
  expanded: false,
  loaded: true,
};

function initBookCollection() {
  const grid = document.getElementById('bookGrid');
  const searchInput = document.getElementById('bookSearch');
  const filterWrap = document.getElementById('bookFilters');
  const toggleBtn = document.getElementById('toggleBooksBtn');
  if (!grid) return;
  bookState.allBooks = BOOK_COLLECTION;
  renderBooks();

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

  grid.addEventListener('click', openBookPreview);

}

async function getBookPreviewLink(book) {
  if (book.previewLink) return book.previewLink;
  if (book.previewPromise) return book.previewPromise;

  const query = `intitle:\"${book.title}\" inauthor:\"${book.authors}\"`;
  const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&printType=books`;

  book.previewPromise = fetch(endpoint)
    .then((response) => {
      if (!response.ok) throw new Error('Google Books tidak dapat dihubungi.');
      return response.json();
    })
    .then((data) => {
      const volume = data.items?.find((item) => item.volumeInfo?.previewLink || item.accessInfo?.webReaderLink);
      const previewLink = volume?.volumeInfo?.previewLink || volume?.accessInfo?.webReaderLink;
      if (!previewLink) throw new Error('Pratinjau untuk buku ini belum tersedia di Google Books.');
      book.previewLink = previewLink.replace('http://', 'https://');
      return book.previewLink;
    })
    .finally(() => {
      book.previewPromise = null;
    });

  return book.previewPromise;
}

async function openBookPreview(event) {
  const card = event.target.closest('.book-card');
  if (!card) return;
  const book = bookState.allBooks.find((item) => item.id === card.dataset.id);
  if (!book) return;
  if (book.previewLink) return;
  event.preventDefault();

  const previewTab = window.open('about:blank', '_blank');
  if (previewTab) previewTab.opener = null;
  card.classList.add('book-card--loading');
  card.setAttribute('aria-busy', 'true');

  try {
    const previewLink = await getBookPreviewLink(book);
    card.href = previewLink;
    if (previewTab) previewTab.location.replace(previewLink);
    else window.open(previewLink, '_blank', 'noopener');
  } catch (error) {
    if (previewTab) previewTab.close();
    const status = document.getElementById('bookStatus');
    status.classList.add('error');
    status.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Pratinjau buku belum tersedia. Silakan coba buku lain.';
  } finally {
    card.classList.remove('book-card--loading');
    card.removeAttribute('aria-busy');
  }
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
    const card = document.createElement('a');
    card.className = 'book-card';
    card.href = book.previewLink || '#';
    card.dataset.id = book.id;
    if (book.previewLink) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
    card.setAttribute('aria-label', `Buka pratinjau ${book.title} di Google Books`);
    card.style.animationDelay = `${(i % INITIAL_VISIBLE_COUNT) * 0.04}s`;

    card.innerHTML = `
      <div class="book-card__cover">
        <div class="no-cover"><i class="fa-solid fa-book-open"></i><span>Pratinjau Google Books</span></div>
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
