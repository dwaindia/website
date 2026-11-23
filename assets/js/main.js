/**
 * Dalit Welfare Association (DWA) - Core Vanilla JavaScript (Version 2)
 * Pure, accessible, modular interactions with zero external dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
  initFullscreenMenu();
  initPolicyModals();
  initNewsletterForm();
  initHeaderScroll();
  initSmoothScroll();
  initImageCarousel();
  initImageLightbox();
  initSubnavHighlight();
  initTabularNavigation();
});

/**
 * Full-Screen Navigation Overlay
 */
function initFullscreenMenu() {
  const openBtn = document.getElementById('btn-open-menu');
  const closeBtn = document.getElementById('btn-close-menu');
  const overlay = document.getElementById('fullscreen-menu');
  const menuLinks = document.querySelectorAll('.overlay-nav-link');

  if (!openBtn || !overlay) return;

  function openMenu() {
    overlay.classList.add('active');
    openBtn.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button or first actionable element
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  function closeMenu() {
    overlay.classList.remove('active');
    openBtn.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    openBtn.focus();
  }

  openBtn.addEventListener('click', openMenu);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Keyboard navigation & trap focus in menu
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeMenu();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = overlay.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}

/**
 * Accessible Policy Popup Modals (Privacy Policy & Refund Policy)
 */
function initPolicyModals() {
  const privacyTriggers = [
    document.getElementById('btn-open-privacy'),
    document.getElementById('btn-newsletter-privacy')
  ].filter(Boolean);

  const refundTriggers = [
    document.getElementById('btn-open-refund')
  ].filter(Boolean);

  const privacyModal = document.getElementById('modal-privacy');
  const refundModal = document.getElementById('modal-refund');

  let lastActiveTrigger = null;

  function openModal(modal, trigger) {
    if (!modal) return;
    lastActiveTrigger = trigger;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastActiveTrigger) {
      lastActiveTrigger.focus();
      lastActiveTrigger = null;
    }
  }

  privacyTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(privacyModal, btn);
    });
  });

  refundTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(refundModal, btn);
    });
  });

  // Close handlers on backdrops and buttons
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
  });

  // Global escape key handler for active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) {
        closeModal(activeModal);
      }
    }
  });
}

/**
 * Newsletter Form Handling with Honeypot Spam Protection (Name & Email)
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const statusMsg = document.getElementById('newsletter-status');

  if (!form || !statusMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Honeypot spam check
    const honeypot = form.querySelector('input[name="website_url"]');
    if (honeypot && honeypot.value.trim() !== '') {
      // Spam bot detected, silently ignore
      return;
    }

    const nameInput = form.querySelector('#newsletter-name') || form.querySelector('input[name="fullname"]');
    const emailInput = form.querySelector('#newsletter-email') || form.querySelector('input[type="email"]');

    if (nameInput && !nameInput.value.trim()) {
      showStatus('Please enter your full name.', 'error');
      nameInput.focus();
      return;
    }

    if (!emailInput || !emailInput.value.trim()) {
      showStatus('Please enter your email address.', 'error');
      emailInput.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      showStatus('Please provide a valid email format (e.g. name@domain.org).', 'error');
      emailInput.focus();
      return;
    }

    // Honest institutional state notification
    showStatus(
      'Thank you for subscribing. Newsletter backend integration is currently in staging configuration. Subscriptions will be activated once CRM integration is finalized in Phase 3.',
      'info'
    );
    form.reset();
  });

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = 'mt-3 text-xs leading-relaxed';
    statusMsg.style.color = '#FFFFFF';
    statusMsg.style.fontWeight = type === 'error' ? '700' : '500';
    statusMsg.classList.remove('hidden');
  }
}

/**
 * Smart Header & Tabular Menus:
 * - When above frame is visible: Tabular menu moves naturally with scroll respecting the above frame.
 * - When scrolled past above frame into sticky zone:
 *     Scroll down -> Both header and tabular menu scroll away off-screen.
 *     Scroll up   -> Header reappears, and tabular menu reappears right below main menu.
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const tabularMenus = document.querySelectorAll('.tabular-menu-bar, .about-subnav');

  function updateHeaderHeight() {
    const h = header.offsetHeight || (window.innerWidth < 768 ? 74 : 84);
    document.documentElement.style.setProperty('--header-actual-height', `${h}px`);
  }
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, { passive: true });

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  let ticking = false;
  const threshold = 8;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const headerH = header.offsetHeight || (window.innerWidth < 768 ? 74 : 84);

        // At or near the top: always show, remove scrolled shadow
        if (currentScrollY <= 40) {
          header.classList.remove('header-hidden');
          header.classList.remove('scrolled');
          tabularMenus.forEach(m => m.classList.remove('menu-hidden'));
        } else {
          header.classList.add('scrolled');

          const isScrollingDown = currentScrollY > lastScrollY + threshold;
          const isScrollingUp = currentScrollY < lastScrollY - threshold;

          if (isScrollingDown) {
            header.classList.add('header-hidden');
          } else if (isScrollingUp) {
            header.classList.remove('header-hidden');
          }

          // Handle Tabular Menus: Respect the above frame!
          tabularMenus.forEach(menu => {
            const container = menu.closest('[data-tabs-container]') || menu.parentElement;
            if (container) {
              const containerTop = container.getBoundingClientRect().top;
              // If containerTop > headerH + 5, the above frame is still in view!
              // The tabular menu must move naturally with scroll, respecting the above frame (NEVER hidden).
              if (containerTop > headerH + 5) {
                menu.classList.remove('menu-hidden');
              } else {
                // In sticky zone: scroll away on scroll down, reappear on scroll up
                if (isScrollingDown) {
                  menu.classList.add('menu-hidden');
                } else if (isScrollingUp) {
                  menu.classList.remove('menu-hidden');
                }
              }
            }
          });
        }

        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Smooth Anchor Navigation with Offset
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!' || targetId === '#top') {
        if (targetId === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const header = document.querySelector('.site-header');
        const offset = header ? header.offsetHeight + 16 : 0;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });
}

/**
 * Authentic Community Field Documentation Carousel
 * Full keyboard accessibility, touch swiping, pause on hover/focus, square indicator buttons
 */
let carouselInstance = {
  pause: () => {},
  resume: () => {}
};

/**
 * Authentic Moving Field Carousel
 * Auto-advances smoothly every 3.5 seconds; pauses on hover, focus, and when lightbox is open.
 */
function initImageCarousel() {
  const viewport = document.getElementById('field-carousel');
  if (!viewport) return;

  const track = viewport.querySelector('.carousel-track');
  const slides = Array.from(viewport.querySelectorAll('.carousel-slide'));
  const prevBtn = document.querySelector('.carousel-prev-btn');
  const nextBtn = document.querySelector('.carousel-next-btn');
  const playPauseBtn = document.querySelector('.carousel-play-pause-btn');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  const currentNumEl = document.getElementById('carousel-current');
  const totalNumEl = document.getElementById('carousel-total');

  if (!track || slides.length === 0) return;

  const totalSlides = slides.length;
  let currentIndex = 0;
  let isManuallyPaused = false;
  let isHovered = false;
  let isFocused = false;
  let isLightboxOpen = false;
  let autoPlayTimer = null;
  const autoPlayInterval = 3500; // Moving every 3.5 seconds

  if (totalNumEl) {
    totalNumEl.textContent = String(totalSlides).padStart(2, '0');
  }

  // Create square numbered indicator buttons
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `carousel-indicator-btn ${idx === 0 ? 'is-active' : ''}`;
      btn.textContent = String(idx + 1).padStart(2, '0');
      btn.setAttribute('aria-label', `Go to slide ${idx + 1} of ${totalSlides}`);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(idx);
        restartAutoPlay();
      });
      indicatorsContainer.appendChild(btn);
    });
  }

  const indicatorBtns = indicatorsContainer ? Array.from(indicatorsContainer.querySelectorAll('.carousel-indicator-btn')) : [];

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, idx) => {
      const isActive = idx === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    indicatorBtns.forEach((btn, idx) => {
      const isActive = idx === currentIndex;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (currentNumEl) {
      currentNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (!isManuallyPaused && !isHovered && !isFocused && !isLightboxOpen) {
      autoPlayTimer = setInterval(nextSlide, autoPlayInterval);
    }
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Export control for lightbox
  carouselInstance.pause = () => {
    isLightboxOpen = true;
    stopAutoPlay();
  };
  carouselInstance.resume = () => {
    isLightboxOpen = false;
    startAutoPlay();
  };

  // Click on any slide to open full screen Lightbox
  slides.forEach((slide, idx) => {
    slide.setAttribute('tabindex', '0');
    slide.setAttribute('role', 'button');
    slide.setAttribute('aria-label', `View full screen image: slide ${idx + 1} of ${totalSlides}`);
    
    // Add expand badge if not present
    if (!slide.querySelector('.carousel-expand-badge')) {
      const badge = document.createElement('span');
      badge.className = 'carousel-expand-badge';
      badge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> Full Screen`;
      slide.appendChild(badge);
    }

    slide.addEventListener('click', () => {
      if (typeof window.openLightboxModal === 'function') {
        window.openLightboxModal(idx);
      }
    });

    slide.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof window.openLightboxModal === 'function') {
          window.openLightboxModal(idx);
        }
      }
    });
  });

  // Navigation button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      restartAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      restartAutoPlay();
    });
  }

  // Play / Pause toggle
  if (playPauseBtn) {
    const pauseIcon = playPauseBtn.querySelector('.icon-pause');
    const playIcon = playPauseBtn.querySelector('.icon-play');

    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isManuallyPaused = !isManuallyPaused;
      if (isManuallyPaused) {
        stopAutoPlay();
        playPauseBtn.setAttribute('aria-label', 'Play automatic carousel cycle');
        playPauseBtn.title = 'Play automatic rotation';
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
      } else {
        startAutoPlay();
        playPauseBtn.setAttribute('aria-label', 'Pause automatic carousel cycle');
        playPauseBtn.title = 'Pause automatic rotation';
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (playIcon) playIcon.classList.add('hidden');
      }
    });
  }

  // Pause on hover
  viewport.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAutoPlay();
  });

  viewport.addEventListener('mouseleave', () => {
    isHovered = false;
    startAutoPlay();
  });

  // Pause on focus
  viewport.addEventListener('focusin', () => {
    isFocused = true;
    stopAutoPlay();
  });

  viewport.addEventListener('focusout', () => {
    isFocused = false;
    startAutoPlay();
  });

  // Keyboard navigation when viewport has focus
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
      restartAutoPlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
      restartAutoPlay();
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 45;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > threshold) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      restartAutoPlay();
    }
  }

  // Start initial moving rotation
  startAutoPlay();
}

/**
 * Full-Screen Image Lightbox Viewer
 */
function initImageLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const carouselViewport = document.getElementById('field-carousel');
  if (!lightbox || !carouselViewport) return;

  const slides = Array.from(carouselViewport.querySelectorAll('.carousel-slide'));
  if (slides.length === 0) return;

  const imgEl = document.getElementById('lightbox-img');
  const tagEl = document.getElementById('lightbox-tag');
  const titleEl = document.getElementById('lightbox-title');
  const counterEl = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const mainArea = document.getElementById('lightbox-main');

  let currentIdx = 0;

  function getSlideData() {
    return Array.from(carouselViewport.querySelectorAll('.carousel-slide')).map(slide => {
      const img = slide.querySelector('img');
      const tag = slide.querySelector('.carousel-caption-tag')?.textContent?.trim() || 'DWA Field Documentation';
      const title = slide.querySelector('.carousel-caption-title')?.textContent?.trim() || 'Community Initiative';
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        tag: tag,
        title: title
      };
    });
  }

  function showImage(idx) {
    const slideData = getSlideData();
    if (slideData.length === 0) return;

    if (idx < 0) {
      currentIdx = slideData.length - 1;
    } else if (idx >= slideData.length) {
      currentIdx = 0;
    } else {
      currentIdx = idx;
    }

    const item = slideData[currentIdx];
    if (imgEl && item) {
      imgEl.src = item.src;
      imgEl.alt = item.alt;
    }
    if (tagEl && item) tagEl.textContent = item.tag;
    if (titleEl && item) titleEl.textContent = item.title;
    if (counterEl) counterEl.textContent = `${String(currentIdx + 1).padStart(2, '0')} / ${String(slideData.length).padStart(2, '0')}`;
  }

  function openLightbox(idx) {
    const slideData = getSlideData();
    currentIdx = idx >= 0 && idx < slideData.length ? idx : 0;
    showImage(currentIdx);
    lightbox.classList.add('is-active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    carouselInstance.pause();
    if (closeBtn) setTimeout(() => closeBtn.focus(), 60);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    carouselInstance.resume();
  }

  window.openLightboxModal = openLightbox;

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(currentIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(currentIdx + 1);
    });
  }

  // Click background outside image to close
  if (mainArea) {
    mainArea.addEventListener('click', (e) => {
      if (e.target === mainArea || e.target.classList.contains('lightbox-img-wrapper')) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showImage(currentIdx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showImage(currentIdx + 1);
    }
  });

  // Touch swipe in lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        showImage(currentIdx + 1);
      } else {
        showImage(currentIdx - 1);
      }
    }
  }, { passive: true });
}

function initSubnavHighlight() {
  const subnavLinks = document.querySelectorAll('.about-subnav-link');
  if (subnavLinks.length === 0) return;

  const sections = Array.from(subnavLinks).map(link => {
    const id = link.getAttribute('href');
    return document.querySelector(id);
  }).filter(Boolean);

  if (sections.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          subnavLinks.forEach(link => {
            const isTarget = link.getAttribute('href') === id;
            link.classList.toggle('is-active', isTarget);
          });
        }
      });
    }, {
      rootMargin: '-15% 0px -70% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
  }
}

/**
 * Tabular Navigation System
 * Hides all inactive sections, keeps only ONE active section visible,
 * full-screen 2-column layout with left photo and right context.
 */
function initTabularNavigation() {
  const containers = document.querySelectorAll('[data-tabs-container]');
  if (containers.length === 0) return;

  containers.forEach(container => {
    const tabBtns = Array.from(container.querySelectorAll('.tabular-menu-btn, [role="tab"]'));
    const tabPanels = Array.from(container.querySelectorAll('.tab-panel, [role="tabpanel"]'));

    if (tabBtns.length === 0 || tabPanels.length === 0) return;

    function activateTab(targetId, updateHistory = true, shouldScroll = false) {
      if (!targetId) return;
      const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;

      let matchedBtn = null;
      let matchedPanel = null;

      tabBtns.forEach(btn => {
        const controls = btn.getAttribute('aria-controls') || btn.getAttribute('href')?.replace('#', '');
        const isMatch = controls === cleanId;
        btn.classList.toggle('is-active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        btn.setAttribute('tabindex', isMatch ? '0' : '-1');
        if (isMatch) matchedBtn = btn;
      });

      tabPanels.forEach(panel => {
        const isMatch = panel.id === cleanId;
        panel.classList.toggle('is-active', isMatch);
        panel.setAttribute('aria-hidden', isMatch ? 'false' : 'true');
        if (isMatch) matchedPanel = panel;
      });

      // If nothing matched, activate first tab as fallback
      if (!matchedPanel && tabPanels.length > 0) {
        tabBtns[0].classList.add('is-active');
        tabBtns[0].setAttribute('aria-selected', 'true');
        tabBtns[0].setAttribute('tabindex', '0');
        tabPanels[0].classList.add('is-active');
        tabPanels[0].setAttribute('aria-hidden', 'false');
        matchedBtn = tabBtns[0];
        matchedPanel = tabPanels[0];
      }

      if (updateHistory && matchedPanel) {
        history.replaceState(null, '', '#' + matchedPanel.id);
      }

      // Reset scroll position of the right matter to top when switching chapters
      if (matchedPanel) {
        const matter = matchedPanel.querySelector('.split-right-matter');
        if (matter) matter.scrollTop = 0;
      }

      if (matchedBtn) {
        matchedBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }

      if (shouldScroll && container) {
        const header = document.querySelector('.site-header');
        const headerH = header ? header.offsetHeight : (window.innerWidth < 768 ? 74 : 84);
        const containerTop = container.getBoundingClientRect().top;
        // Only scroll if the container is entirely scrolled out of view (e.g. navigating from deep footer)
        if (containerTop < 0 || containerTop > window.innerHeight) {
          const targetY = window.pageYOffset + containerTop - headerH;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
      }
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('aria-controls') || btn.getAttribute('href');
        // Do not force-scroll: switch in place respecting the above frame
        activateTab(targetId, true, false);
      });

      btn.addEventListener('keydown', (e) => {
        const index = tabBtns.indexOf(btn);
        let nextIndex = null;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabBtns.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabBtns.length) % tabBtns.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = tabBtns.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          tabBtns[nextIndex].focus();
          const targetId = tabBtns[nextIndex].getAttribute('aria-controls') || tabBtns[nextIndex].getAttribute('href');
          activateTab(targetId, true, false);
        }
      });
    });

    // Check initial hash on page load
    const initialHash = window.location.hash;
    if (initialHash) {
      activateTab(initialHash, false, false);
    } else {
      // Default to first tab
      const firstTarget = tabBtns[0].getAttribute('aria-controls') || tabBtns[0].getAttribute('href');
      activateTab(firstTarget, false, false);
    }

    // Support window hashchange (e.g. from full-screen overlay menu links)
    window.addEventListener('hashchange', () => {
      if (window.location.hash) {
        activateTab(window.location.hash, false, true);
      }
    });
  });
}
