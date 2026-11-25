/* ==========================================================================
   Dalit Welfare Association (DWA) — Core UI Interactions
   Lightweight Vanilla JS: Overlay Menu, Modals, Tab Scrollspy, Donation Selector, Forms
   Zero external dependencies
   ========================================================================== */

(function () {
  'use strict';

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'summary'
  ].join(', ');

  let activeModal = null;
  let lastTriggerBeforeModal = null;
  let lastTriggerBeforeOverlay = null;

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null && !el.closest('[hidden]')
    );
  }

  function trapFocus(event, container) {
    if (event.key !== 'Tab') return;
    const focusables = getFocusableElements(container);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function updateScrollLock() {
    const overlay = document.getElementById('fullscreen-menu');
    const overlayOpen = overlay && !overlay.hasAttribute('hidden');
    if (overlayOpen || activeModal) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
  }

  /* ------------------------------------------------------------------------
     1. FULL-SCREEN MENU OVERLAY
     ------------------------------------------------------------------------ */
  const overlay = document.getElementById('fullscreen-menu');
  const openMenuBtn = document.getElementById('btn-open-menu');
  const closeMenuBtn = document.getElementById('btn-close-overlay');

  function openOverlay() {
    if (!overlay) return;
    lastTriggerBeforeOverlay = document.activeElement;
    overlay.removeAttribute('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    if (openMenuBtn) openMenuBtn.setAttribute('aria-expanded', 'true');
    updateScrollLock();

    const focusTarget = closeMenuBtn || getFocusableElements(overlay)[0];
    if (focusTarget) focusTarget.focus();
  }

  function closeOverlay(restoreFocus = true) {
    if (!overlay || overlay.hasAttribute('hidden')) return;
    overlay.setAttribute('hidden', '');
    overlay.setAttribute('aria-hidden', 'true');
    if (openMenuBtn) openMenuBtn.setAttribute('aria-expanded', 'false');
    updateScrollLock();

    if (restoreFocus && lastTriggerBeforeOverlay && typeof lastTriggerBeforeOverlay.focus === 'function') {
      lastTriggerBeforeOverlay.focus();
    }
    lastTriggerBeforeOverlay = null;
  }

  if (openMenuBtn && overlay) {
    openMenuBtn.addEventListener('click', openOverlay);
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => closeOverlay(true));
  }

  if (overlay) {
    overlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeOverlay(false);
      });
    });

    const colButtons = overlay.querySelectorAll('.overlay-col-heading');
    function syncOverlayColumns() {
      const isDesktop = window.innerWidth >= 768;
      colButtons.forEach((btn) => {
        const targetId = btn.getAttribute('aria-controls');
        const list = targetId ? document.getElementById(targetId) : null;
        if (!list) return;
        if (isDesktop) {
          btn.setAttribute('aria-expanded', 'true');
        } else {
          btn.setAttribute('aria-expanded', String(!list.classList.contains('is-collapsed')));
        }
      });
    }

    syncOverlayColumns();
    window.addEventListener('resize', syncOverlayColumns);

    colButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.innerWidth >= 768) return;
        const targetId = btn.getAttribute('aria-controls');
        const list = targetId ? document.getElementById(targetId) : null;
        if (!list) return;

        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isExpanded));
        list.classList.toggle('is-collapsed', isExpanded);
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. ACCESSIBLE MODAL DIALOGS (POLICIES)
     ------------------------------------------------------------------------ */
  function openModal(modalId, triggerEl) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (overlay && !overlay.hasAttribute('hidden')) {
      closeOverlay(false);
    }

    lastTriggerBeforeModal = triggerEl || document.activeElement;
    activeModal = modal;
    modal.removeAttribute('hidden');
    updateScrollLock();

    const closeBtn = modal.querySelector('[data-modal-close]');
    const focusTarget = closeBtn || getFocusableElements(modal)[0];
    if (focusTarget) focusTarget.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.setAttribute('hidden', '');
    activeModal = null;
    updateScrollLock();

    if (lastTriggerBeforeModal && typeof lastTriggerBeforeModal.focus === 'function') {
      lastTriggerBeforeModal.focus();
    }
    lastTriggerBeforeModal = null;
  }

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(trigger.getAttribute('data-modal-open'), trigger);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });

    backdrop.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });
  });

  /* ------------------------------------------------------------------------
     3. GLOBAL KEYBOARD HANDLERS
     ------------------------------------------------------------------------ */
  document.addEventListener('keydown', (event) => {
    if (activeModal) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      trapFocus(event, activeModal);
      return;
    }

    if (overlay && !overlay.hasAttribute('hidden')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay(true);
        return;
      }
      trapFocus(event, overlay);
    }
  });

  /* ------------------------------------------------------------------------
     4. IN-PAGE TABULAR SUBNAVIGATION SCROLLSPY
     ------------------------------------------------------------------------ */
  const subnavLinks = Array.from(document.querySelectorAll('.subnav-link[href^="#"]'));
  if (subnavLinks.length > 0 && 'IntersectionObserver' in window) {
    const sections = subnavLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    function setActiveTab(id) {
      subnavLinks.forEach((link) => {
        const match = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', match);
        if (match) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible && visible.target.id) {
          setActiveTab(visible.target.id);
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0.01 }
    );

    sections.forEach((section) => observer.observe(section));
    subnavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('href').slice(1);
        setActiveTab(id);
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. INTERACTIVE CONTRIBUTION AMOUNT SELECTOR & METER (DONATE PAGE)
     ------------------------------------------------------------------------ */
  const selectorWidget = document.getElementById('donation-selector-widget');
  if (selectorWidget) {
    const ROUTE_CONFIG = {
      domestic: {
        currencySymbol: '₹',
        code: 'INR',
        presets: [500, 1500, 5000, 10000],
        defaultAmount: 1500,
        meterMax: 25000,
        actionLabel: 'Proceed via Give.do (India)',
        actionHref: 'https://give.do/discover/18G1/dalit-welfare-association/',
        actionExternal: true,
        routeNote: 'Domestic Indian route (Give.do) for contributions in Indian Rupees.'
      },
      international: {
        currencySymbol: '$',
        code: 'USD',
        presets: [25, 50, 100, 250],
        defaultAmount: 100,
        meterMax: 500,
        actionLabel: 'Donate Through Benevity',
        actionHref: 'https://mygoodness.benevity.org/community/cause/356-5640831431326_7b83',
        actionExternal: true,
        routeNote: 'International FCRA-compliant route (Benevity or SBI FCRA Account 40108791616). Do not route foreign contributions through domestic accounts.'
      }
    };

    let currentRoute = 'domestic';
    let currentAmount = ROUTE_CONFIG.domestic.defaultAmount;
    let currentFund = "Women's Livelihood & Enterprise Fund";

    const routeButtons = selectorWidget.querySelectorAll('[data-route]');
    const presetButtons = Array.from(selectorWidget.querySelectorAll('[data-preset-index]'));
    const customInput = document.getElementById('custom-donation-amount');
    const customLabel = document.getElementById('custom-amount-label');
    const displayEl = document.getElementById('selected-amount-display');
    const fundSummaryEl = document.getElementById('selected-fund-summary');
    const meterFillEl = document.getElementById('donation-meter-fill');
    const meterBarEl = document.getElementById('donation-meter-track');
    const routeNoteEl = document.getElementById('donation-route-note');
    const primaryCta = document.getElementById('donation-route-cta');
    const fundButtons = selectorWidget.querySelectorAll('[data-fund-name]');
    const winterPresetButtons = selectorWidget.querySelectorAll('[data-winter-route]');

    function formatAmount(route, amount) {
      const cfg = ROUTE_CONFIG[route];
      const safe = Math.max(0, Number(amount) || 0);
      if (route === 'domestic') {
        return cfg.currencySymbol + safe.toLocaleString('en-IN');
      }
      return cfg.currencySymbol + safe.toLocaleString('en-US') + ' ' + cfg.code;
    }

    function setActiveRoute(nextRoute, overrideAmount) {
      if (!ROUTE_CONFIG[nextRoute]) return;
      currentRoute = nextRoute;
      currentAmount =
        typeof overrideAmount === 'number' && Number.isFinite(overrideAmount) && overrideAmount > 0
          ? Math.round(overrideAmount)
          : ROUTE_CONFIG[currentRoute].defaultAmount;

      routeButtons.forEach((b) => {
        const active = b.getAttribute('data-route') === currentRoute;
        b.classList.toggle('is-selected', active);
        b.setAttribute('aria-pressed', String(active));
      });

      if (customLabel) {
        customLabel.textContent = 'Custom amount (' + ROUTE_CONFIG[currentRoute].code + ' ' + ROUTE_CONFIG[currentRoute].currencySymbol + ')';
      }
      if (customInput) customInput.value = String(currentAmount);
    }

    function setActiveFund(fundName) {
      if (!fundName) return;
      let matched = null;
      fundButtons.forEach((b) => {
        if (b.getAttribute('data-fund-name') === fundName) {
          matched = b;
        }
      });
      if (!matched) return;
      currentFund = fundName;
      fundButtons.forEach((b) => {
        const active = b === matched;
        b.classList.toggle('is-selected', active);
        b.setAttribute('aria-pressed', String(active));
      });
    }

    function renderDonationState() {
      const cfg = ROUTE_CONFIG[currentRoute];
      const formatted = formatAmount(currentRoute, currentAmount);
      const pct = Math.min(100, Math.max(4, Math.round((currentAmount / cfg.meterMax) * 100)));

      if (displayEl) displayEl.textContent = formatted;
      if (fundSummaryEl) fundSummaryEl.textContent = 'Selected focus: ' + currentFund;
      if (meterFillEl) meterFillEl.style.width = pct + '%';
      if (meterBarEl) {
        meterBarEl.setAttribute('aria-valuenow', String(currentAmount));
        meterBarEl.setAttribute('aria-valuemax', String(cfg.meterMax));
        meterBarEl.setAttribute('aria-valuetext', formatted);
      }
      if (routeNoteEl) routeNoteEl.textContent = cfg.routeNote;
      if (primaryCta) {
        primaryCta.textContent = cfg.actionLabel;
        primaryCta.setAttribute('href', cfg.actionHref);
      }

      presetButtons.forEach((btn, idx) => {
        const val = cfg.presets[idx];
        btn.textContent = cfg.currencySymbol + val.toLocaleString(currentRoute === 'domestic' ? 'en-IN' : 'en-US');
        const isSelected = currentAmount === val;
        btn.classList.toggle('is-selected', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
      });
    }

    routeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextRoute = btn.getAttribute('data-route');
        if (!ROUTE_CONFIG[nextRoute] || nextRoute === currentRoute) return;
        setActiveRoute(nextRoute);
        renderDonationState();
      });
    });

    presetButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        currentAmount = ROUTE_CONFIG[currentRoute].presets[idx];
        if (customInput) customInput.value = String(currentAmount);
        renderDonationState();
      });
    });

    if (customInput) {
      customInput.addEventListener('input', () => {
        const parsed = parseFloat(customInput.value);
        currentAmount = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
        renderDonationState();
      });
    }

    fundButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveFund(btn.getAttribute('data-fund-name'));
        renderDonationState();
      });
    });

    winterPresetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-winter-route') || 'domestic';
        const amount = parseFloat(btn.getAttribute('data-winter-amount') || '1700');
        const fund = btn.getAttribute('data-winter-fund') || 'Emergency Relief & Community Care Fund';
        setActiveFund(fund);
        setActiveRoute(route, amount);
        renderDonationState();
      });
    });

    // Apply URL query parameters (?route=...&amount=...&fund=...) for deep links from Winter Appeal
    const params = new URLSearchParams(window.location.search);
    const paramRoute = params.get('route');
    const paramAmount = parseFloat(params.get('amount') || '');
    const paramFund = params.get('fund');
    if (paramFund) setActiveFund(paramFund);
    if (paramRoute && ROUTE_CONFIG[paramRoute]) {
      setActiveRoute(paramRoute, Number.isFinite(paramAmount) && paramAmount > 0 ? paramAmount : undefined);
    } else if (Number.isFinite(paramAmount) && paramAmount > 0) {
      setActiveRoute(currentRoute, paramAmount);
    }

    renderDonationState();
  }

  /* ------------------------------------------------------------------------
     6. COPY-TO-CLIPBOARD HELPER FOR STATUTORY / FCRA FIELDS
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.copy-btn[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-copy');
      if (!value || !navigator.clipboard) return;
      const original = btn.textContent;
      navigator.clipboard.writeText(value).then(() => {
        btn.textContent = 'Copied';
        setTimeout(() => {
          btn.textContent = original;
        }, 1800);
      }).catch(() => {
        btn.textContent = 'Copy unavailable';
      });
    });
  });

  /* ------------------------------------------------------------------------
     7. FORM VALIDATION & WORKER API SUBMISSION (NEWSLETTER & CONTACT)
     ------------------------------------------------------------------------ */
  function showStatus(box, message, isError) {
    if (!box) return;
    box.textContent = message;
    box.classList.toggle('is-error', Boolean(isError));
    box.removeAttribute('hidden');
  }

  function getApiEndpoint(routePath) {
    if (window.location.protocol === 'file:') return '';
    const meta = document.querySelector('meta[name="dwa-api-base"]');
    const base = meta ? meta.getAttribute('content').trim() : '';
    if (!base) return '';
    if (base === 'same-origin' || base === '/') {
      return routePath;
    }
    return base.replace(/\/+$/, '') + routePath;
  }

  async function submitJsonForm(form, routePath, payload, statusBox, unconfiguredMessage) {
    const endpoint = getApiEndpoint(routePath);
    if (!endpoint) {
      showStatus(statusBox, unconfiguredMessage, false);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      const isLocalStatic =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (response.ok && data.ok === true) {
        showStatus(statusBox, data.message || 'Submitted successfully.', false);
        form.reset();
      } else if ((response.status === 404 || response.status === 501) && isLocalStatic) {
        showStatus(statusBox, unconfiguredMessage, false);
      } else {
        showStatus(
          statusBox,
          data.message || data.error || 'Submission could not be confirmed. Please write to dalitwelfareassociation1@gmail.com.',
          true
        );
      }
    } catch {
      showStatus(
        statusBox,
        'Unable to reach submission service. Please email dalitwelfareassociation1@gmail.com or call +91 8309744864.',
        true
      );
    } finally {
      clearTimeout(timer);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const newsletterForm = document.getElementById('dwa-newsletter-form');
  if (newsletterForm) {
    const emailInput = document.getElementById('newsletter-email');
    const consentInput = document.getElementById('newsletter-consent');
    const honeypotInput = document.getElementById('newsletter-company');
    const statusBox = document.getElementById('newsletter-status');

    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (honeypotInput && honeypotInput.value.trim() !== '') return;

      const email = emailInput ? emailInput.value.trim() : '';
      if (!EMAIL_REGEX.test(email)) {
        showStatus(statusBox, 'Please enter a valid email address before submitting.', true);
        if (emailInput) emailInput.focus();
        return;
      }

      if (consentInput && !consentInput.checked) {
        showStatus(statusBox, 'Please confirm consent to receive updates in accordance with DWA privacy standards.', true);
        consentInput.focus();
        return;
      }

      submitJsonForm(
        newsletterForm,
        '/api/newsletter',
        { email, consent: true, company_website: '' },
        statusBox,
        'Email format and consent verified for ' +
          email +
          '. Configure <meta name="dwa-api-base"> with your deployed Cloudflare Worker URL (workers/form-api) to store live subscriptions. For immediate updates, write to dalitwelfareassociation1@gmail.com.'
      );
    });
  }

  const contactForm = document.getElementById('dwa-contact-form');
  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const orgInput = document.getElementById('contact-org');
    const typeSelect = document.getElementById('contact-type');
    const messageInput = document.getElementById('contact-message');
    const consentInput = document.getElementById('contact-consent');
    const honeypotInput = document.getElementById('contact-website');
    const statusBox = document.getElementById('contact-status');

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (honeypotInput && honeypotInput.value.trim() !== '') return;

      const fullName = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const organization = orgInput ? orgInput.value.trim() : '';
      const enquiryType = typeSelect ? typeSelect.value : 'General';
      const message = messageInput ? messageInput.value.trim() : '';

      if (fullName.length < 2) {
        showStatus(statusBox, 'Please enter your full name.', true);
        if (nameInput) nameInput.focus();
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        showStatus(statusBox, 'Please enter a valid email address.', true);
        if (emailInput) emailInput.focus();
        return;
      }

      if (message.length < 10) {
        showStatus(statusBox, 'Please include a brief message (at least 10 characters).', true);
        if (messageInput) messageInput.focus();
        return;
      }

      if (consentInput && !consentInput.checked) {
        showStatus(statusBox, 'Please confirm consent to be contacted regarding your enquiry.', true);
        consentInput.focus();
        return;
      }

      submitJsonForm(
        contactForm,
        '/api/contact',
        {
          full_name: fullName,
          email,
          phone,
          organization,
          enquiry_type: enquiryType,
          message,
          consent: true,
          website: ''
        },
        statusBox,
        'Enquiry fields validated (' +
          enquiryType +
          '). Configure <meta name="dwa-api-base"> with your deployed Cloudflare Worker URL (workers/form-api) to submit directly; meanwhile, please email dalitwelfareassociation1@gmail.com or call +91 8309744864.'
      );
    });
  }

  /* ------------------------------------------------------------------------
     8. WHOLE-SITE SMOOTH SECTION, BOX & IMAGE SLIDE-UP SCROLL REVEAL
     Progressive enhancement; respects prefers-reduced-motion
     ------------------------------------------------------------------------ */
  const BOX_AND_IMAGE_SELECTOR = [
    '.hero-content',
    '.page-hero .split-grid > div',
    '.photo-figure',
    'main img:not(.site-logo-img)',
    '.meter-item',
    '.vision-block',
    '.programme-item',
    '.credentials-summary',
    '.credentials-ledger',
    '.international-grid > div',
    '.fcra-disclosure-box',
    '.newsletter-grid > div',
    '.newsletter-form',
    '.editorial-block-item',
    '.callout-note',
    '.timeline-row',
    '.stage-step',
    '.gov-node',
    '.table-scroll',
    '.donation-panel',
    '.holiday-highlight-item',
    '.winter-summary-card',
    '.kit-card',
    '.tier-card',
    '.share-quote-box',
    '#winter-give .split-grid > div:first-child',
    '#share-appeal .split-grid > div:last-child',
    '#office .split-grid > div:first-child',
    '#policies .split-grid > div:first-child',
    '#domestic-giving .split-grid > div:first-child',
    '#international-giving .split-grid > div:first-child',
    '.site-footer .footer-grid > div'
  ].join(', ');

  const revealSections = Array.from(document.querySelectorAll('main > section'));
  const rawBoxNodes = Array.from(document.querySelectorAll(BOX_AND_IMAGE_SELECTOR)).filter(
    (el) => !el.closest('#fullscreen-menu') && !el.closest('.modal-backdrop')
  );
  // Avoid double-animating nested items (e.g., img inside .photo-figure, or .photo-figure inside .programme-item)
  const revealItems = rawBoxNodes.filter(
    (el) => !rawBoxNodes.some((other) => other !== el && other.contains(el))
  );

  const allRevealTargets = [...revealSections, ...revealItems];
  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (allRevealTargets.length > 0 && !reduceMotion && 'IntersectionObserver' in window) {
    revealItems.forEach((el) => el.classList.add('reveal-item'));
    document.documentElement.classList.add('js-reveal-ready');

    function showTarget(el) {
      if (el && !el.classList.contains('is-visible')) {
        el.classList.add('is-visible');
      }
    }

    function revealInViewportOrAbove() {
      const cutoff = window.innerHeight * 0.98;
      let pending = 0;
      allRevealTargets.forEach((el) => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= cutoff) {
          showTarget(el);
        } else {
          pending += 1;
        }
      });
      return pending;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showTarget(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -20px 0px' }
    );

    allRevealTargets.forEach((el) => revealObserver.observe(el));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealInViewportOrAbove();
      });
    });

    function revealForHash() {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      const targetBottom = target.getBoundingClientRect().top + window.scrollY;
      allRevealTargets.forEach((el) => {
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        if (elTop <= targetBottom + window.innerHeight || el.contains(target) || target.contains(el)) {
          showTarget(el);
          revealObserver.unobserve(el);
        }
      });
    }

    if (window.location.hash) {
      revealForHash();
    }
    window.addEventListener('hashchange', revealForHash);
    window.addEventListener(
      'scroll',
      () => {
        if (revealInViewportOrAbove() === 0) {
          allRevealTargets.forEach((el) => revealObserver.unobserve(el));
        }
      },
      { passive: true }
    );
  } else {
    revealSections.forEach((el) => el.classList.add('is-visible'));
    revealItems.forEach((el) => el.classList.add('reveal-item', 'is-visible'));
  }
})();
