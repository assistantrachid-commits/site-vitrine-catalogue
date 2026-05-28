/* ─── BURGER / NAV OVERLAY ─── */
const burger     = document.getElementById('burger');
const navOverlay = document.getElementById('navOverlay');
const navClose   = document.getElementById('navClose');

function openNav() {
  navOverlay.classList.add('open');
  navOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  navOverlay.classList.remove('open');
  navOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

burger.addEventListener('click', openNav);
navClose.addEventListener('click', closeNav);

document.querySelectorAll('[data-nav-close]').forEach(link => {
  link.addEventListener('click', closeNav);
});

/* ─── MODAL SYSTEM ─── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('open');
  // Only restore scroll if no nav is open
  if (!navOverlay.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

// Open via [data-modal] triggers
document.querySelectorAll('[data-modal]').forEach(trigger => {
  trigger.addEventListener('click', e => {
    e.preventDefault();
    const id = trigger.getAttribute('data-modal');
    openModal(id);
  });
});

// Close via [data-close-modal] buttons
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    if (modal) closeModal(modal);
  });
});

// Close on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(modal);
  });
});

// Escape key closes modals and nav
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal.open').forEach(m => closeModal(m));
  if (navOverlay.classList.contains('open')) closeNav();
});

/* ─── SCROLL REVEAL ─── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─── STATS COUNT-UP ─── */
function countUp(el, target, suffix, duration) {
  const start = performance.now();
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = (el.dataset.prefix || '') + Math.round(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    countUp(el, target, suffix, 1600);
    statObserver.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-target]').forEach(el => statObserver.observe(el));

/* ─── RÉALISATIONS CAROUSEL ─── */
(function () {
  const grid     = document.getElementById('realGrid');
  if (!grid) return;

  const track    = grid.parentElement;
  const dotsWrap = document.getElementById('realDots');
  const prevBtn  = track.querySelector('.carousel-prev');
  const nextBtn  = track.querySelector('.carousel-next');
  const cards    = Array.from(grid.querySelectorAll('.real-card'));
  const total    = cards.length;

  let current    = 0;
  let perView    = 0;
  let dots       = [];
  let startX     = 0;
  let isDragging = false;
  let dragDelta  = 0;
  let timer      = null;
  let resizeTimer = null;

  function getPerView() { return window.innerWidth >= 900 ? 2 : 1; }
  function getGap()     { return perView > 1 ? 24 : 0; }
  function getCardW()   { return (track.offsetWidth - getGap() * (perView - 1)) / perView; }
  function getSlide()   { return getCardW() + getGap(); }
  function maxStep()    { return Math.max(0, total - perView); }
  function numSteps()   { return maxStep() + 1; }

  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = [];
    for (let i = 0; i < numSteps(); i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', 'Vue ' + (i + 1));
      const idx = i;
      dot.addEventListener('click', () => goTo(idx));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function updateTransform() {
    grid.style.transform = 'translateX(-' + (current * getSlide()) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    const s = numSteps();
    current = ((index % s) + s) % s;
    updateTransform();
  }

  function setup() {
    const newPerView = getPerView();
    const changed = newPerView !== perView;
    perView = newPerView;
    const cardW = getCardW();
    cards.forEach(c => { c.style.width = cardW + 'px'; c.style.flex = '0 0 ' + cardW + 'px'; });
    current = Math.min(current, maxStep());
    if (changed) buildDots();
    updateTransform();
  }

  requestAnimationFrame(setup);

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 80);
  });

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; isDragging = true; dragDelta = 0;
    grid.classList.add('dragging'); clearInterval(timer);
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (isDragging) dragDelta = e.touches[0].clientX - startX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false; grid.classList.remove('dragging');
    if (dragDelta < -50) goTo(current + 1);
    else if (dragDelta > 50) goTo(current - 1);
    startTimer();
  });

  track.addEventListener('mousedown', e => {
    e.preventDefault();
    startX = e.clientX; isDragging = true; dragDelta = 0;
    grid.classList.add('dragging'); clearInterval(timer);
  });

  window.addEventListener('mousemove', e => { if (isDragging) dragDelta = e.clientX - startX; });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false; grid.classList.remove('dragging');
    if (dragDelta < -50) goTo(current + 1);
    else if (dragDelta > 50) goTo(current - 1);
    startTimer();
  });

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  startTimer();
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', startTimer);
})();

/* ─── AVIS CAROUSEL ─── */
(function () {
  const grid     = document.getElementById('avisGrid');
  if (!grid) return;

  const track    = grid.parentElement;
  const dotsWrap = document.getElementById('avisDots');
  const cards    = Array.from(grid.querySelectorAll('.avis-card'));
  const total    = cards.length;

  let current   = 0;
  let dots      = [];
  let startX    = 0;
  let isDragging = false;
  let dragDelta  = 0;

  function perView()   { return window.innerWidth > 768 ? 3 : 1; }
  function numPages()  { return Math.ceil(total / perView()); }

  function setWidths() {
    const w = Math.floor(track.offsetWidth / perView());
    cards.forEach(c => { c.style.width = w + 'px'; c.style.flex = '0 0 ' + w + 'px'; });
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = [];
    for (let i = 0; i < numPages(); i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', 'Page ' + (i + 1));
      const idx = i;
      dot.addEventListener('click', () => goTo(idx));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function updateTransform() {
    grid.style.transform = 'translateX(-' + (current * track.offsetWidth) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = ((index % numPages()) + numPages()) % numPages();
    updateTransform();
  }

  function init() {
    current = 0;
    setWidths();
    buildDots();
    updateTransform();
  }

  requestAnimationFrame(init);
  window.addEventListener('resize', init);

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; isDragging = true; dragDelta = 0;
    grid.classList.add('dragging');
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    dragDelta = e.touches[0].clientX - startX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false; grid.classList.remove('dragging');
    if (dragDelta < -50) goTo(current + 1);
    else if (dragDelta > 50) goTo(current - 1);
  });
})();

/* ─── SERVICE STEPS : cascade + progression ─── */
(function () {
  const grid = document.getElementById('serviceGrid');
  if (!grid) return;

  const steps = Array.from(grid.querySelectorAll('.service-step'));
  const fill  = document.getElementById('spbFill');
  const dots  = Array.from(document.querySelectorAll('.spb-dot'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // 1. cartes en cascade
      const directions = ['step-from-left', 'step-from-bottom', 'step-from-bottom', 'step-from-right'];
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.classList.add(directions[i] || 'step-from-bottom');
        }, i * 190);
      });

      // 2. points s'allument un par un après les cartes
      const dotsDelay = 700;
      const dotSpacing = 220;
      dots.forEach((dot, i) => {
        setTimeout(() => dot.classList.add('dot-active'), dotsDelay + i * dotSpacing);
      });

      // 3. ligne se remplit en même temps que les points
      setTimeout(() => { if (fill) fill.style.width = '100%'; }, dotsDelay);

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  observer.observe(grid);
})();

/* ─── TYPEWRITER ─── */
(function () {
  const nameEl = document.getElementById('hero-name');
  const roleEl = document.getElementById('hero-role');
  if (!nameEl || !roleEl) return;

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';

  function typeText(el, text, speed, onDone) {
    let i = 0;
    el.textContent = '';
    el.appendChild(cursor);
    const interval = setInterval(() => {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onDone) setTimeout(onDone, 350);
      }
    }, speed);
  }

  setTimeout(() => {
    typeText(nameEl, 'Rachid', 90, () => {
      nameEl.removeChild(cursor);
      typeText(roleEl, 'Expert Acquisition Produit', 55, null);
    });
  }, 400);
})();

/* ─── CONTACT FORM ─── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(201,169,110,0.7)';
        valid = false;
      }
    });
    if (!valid) return;

    const submitBtn = contactForm.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.querySelector('.btn-text').textContent = 'Envoi…'; }

    try {
      const data = new FormData(contactForm);
      const res = await fetch('https://formsubmit.co/ajax/rachid.finder@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });
      const json = await res.json();
      if (json.success === 'true' || json.success === true) {
        const body = contactForm.closest('.modal-body');
        body.innerHTML = `
          <div class="form-success">
            <div class="form-success-icon"><i class="ti ti-circle-check"></i></div>
            <h3>Demande envoyée</h3>
            <p>Merci ! Je reviendrai vers vous sous 48h.</p>
          </div>
        `;
      } else {
        throw new Error();
      }
    } catch {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.querySelector('.btn-text').textContent = 'Envoyer'; }
      alert('Une erreur est survenue. Contactez-moi directement : rachid.finder@gmail.com');
    }
  });
}
