/* ============================================================
   SOS Hub Canada — Premium JS
   Scroll progress, back-to-top, cookie banner, mobile menu,
   page transitions, lazy images, ARIA, form validation
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ── */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progressBar) return;
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }

  /* ── 2. BACK TO TOP ── */
  const backBtn = document.getElementById('back-to-top');
  function updateBackToTop() {
    if (!backBtn) return;
    backBtn.style.opacity = window.scrollY > 500 ? '1' : '0';
    backBtn.style.pointerEvents = window.scrollY > 500 ? 'all' : 'none';
  }
  if (backBtn) {
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── 3. SCROLL LISTENER ── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── 4. MOBILE MENU ── */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on nav link click (mobile)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileToggle.contains(e.target)) {
        nav.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 5. COOKIE BANNER ── */
  const COOKIE_KEY = 'soshub_cookies_accepted';
  const cookieBanner = document.getElementById('cookie-banner');
  function showCookieBanner() {
    if (!cookieBanner) return;
    if (!localStorage.getItem(COOKIE_KEY)) {
      setTimeout(() => {
        cookieBanner.classList.add('visible');
      }, 1500);
    }
  }
  window.acceptCookies = function () {
    localStorage.setItem(COOKIE_KEY, '1');
    if (cookieBanner) {
      cookieBanner.classList.remove('visible');
      cookieBanner.classList.add('hiding');
      setTimeout(() => cookieBanner.remove(), 500);
    }
    loadAnalytics();
  };
  window.declineCookies = function () {
    localStorage.setItem(COOKIE_KEY, '0');
    if (cookieBanner) {
      cookieBanner.classList.remove('visible');
      cookieBanner.classList.add('hiding');
      setTimeout(() => cookieBanner.remove(), 500);
    }
  };
  showCookieBanner();

  /* ── 5b. ANALYTICS (cookie-gated) ── */
  function loadAnalytics() {
    if (document.getElementById('ga4-script')) return;
    // Google Analytics 4
    const ga = document.createElement('script');
    ga.id = 'ga4-script';
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(ga);
    ga.onload = function() {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    };
    // Microsoft Clarity
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/XXXXXXXXXX";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script");
  }
  // Auto-load if previously accepted
  if (localStorage.getItem(COOKIE_KEY) === '1') loadAnalytics();

  /* ── 6. HEADER SCROLL STYLE ── */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── 7. FAQ ACCORDION ── */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.setAttribute('role', 'button');
    q.setAttribute('tabindex', '0');
    q.setAttribute('aria-expanded', q.parentElement.classList.contains('open') ? 'true' : 'false');
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.toggle('open');
      q.setAttribute('aria-expanded', isOpen);
    });
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        q.click();
      }
    });
  });

  /* ── 8. SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 9. INTERSECTION OBSERVER — animate on scroll ── */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }

  /* ── 10. PAGE TRANSITION ── */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href && !href.startsWith('#') && !href.startsWith('http') &&
      !href.startsWith('mailto') && !href.startsWith('tel') &&
      !href.startsWith('whatsapp') && link.target !== '_blank'
    ) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = href; }, 200);
      });
    }
  });

  /* ── 11. FORM VALIDATION & SUBMIT ── */
  function setupForm(formId, apiEndpoint, successRedirect) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;

      // Validate
      let valid = true;
      form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('error');
          valid = false;
        } else {
          input.classList.remove('error');
        }
      });
      if (!valid) {
        showFormError(form, 'Veuillez remplir tous les champs obligatoires.');
        return;
      }

      btn.innerHTML = '<span class="spinner"></span> Envoi en cours…';
      btn.disabled = true;

      const data = {};
      new FormData(form).forEach((val, key) => data[key] = val);
      data.source = form.dataset.source || formId;
      data.created_at = new Date().toISOString();

      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          btn.innerHTML = '✅ Envoyé! On vous contacte sous 24h.';
          btn.style.background = '#10b981';
          form.reset();
          if (successRedirect) {
            setTimeout(() => window.location.href = successRedirect, 2000);
          }
        } else throw new Error();
      } catch {
        btn.innerHTML = originalText;
        btn.disabled = false;
        // Fallback WhatsApp
        const msg = Object.entries(data)
          .filter(([k]) => !['source','created_at'].includes(k))
          .map(([k,v]) => `${k}: ${v}`)
          .join('\n');
        showFormError(form, 'Une erreur est survenue. Vous pouvez aussi nous écrire directement sur WhatsApp.', msg);
      }
    });
  }

  function showFormError(form, message, whatsappMsg) {
    let errDiv = form.querySelector('.form-error');
    if (!errDiv) {
      errDiv = document.createElement('div');
      errDiv.className = 'form-error';
      form.appendChild(errDiv);
    }
    errDiv.innerHTML = `<span>⚠️ ${message}</span>` +
      (whatsappMsg ? ` <a href="https://wa.me/14386302869?text=${encodeURIComponent(whatsappMsg)}" target="_blank" style="color:#25D366;font-weight:700;">💬 WhatsApp</a>` : '');
    errDiv.style.display = 'block';
  }

  setupForm(
    'employerForm',
    'https://soshubca.vercel.app/api/employer-leads',
    'https://soshubca.vercel.app/employeur/merci'
  );

  setupForm(
    'quizForm',
    'https://soshubca.vercel.app/api/crm/leads',
    null  // Stay on page, show success inline
  );

  /* ── 12. COUNTERS ANIMATION ── */
  function animateCounter(el, target, suffix) {
    const duration = 2000;
    const start = performance.now();
    const update = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + (suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const countersObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const val = parseInt(el.dataset.count, 10);
        const suf = el.dataset.suffix || '';
        animateCounter(el, val, suf);
        countersObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countersObserver.observe(el));

  /* ── INIT ── */
  updateProgress();
  updateBackToTop();

})();
