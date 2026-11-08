// Dalit Welfare Association (DWA) - Open Society Foundations Aesthetic Design System
// Electric Neon Green Accent (#04cc86) & Interactive Broadside Micro-Interactions

document.addEventListener('DOMContentLoaded', () => {
  // 0. Smart Sticky Header (Open Society Foundations behavior: hide on scroll down, visible on scroll up)
  const headerEl = document.querySelector('header');
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  let isScrolling = false;

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (headerEl) {
          if (currentScrollY <= 40) {
            headerEl.classList.remove('header-hidden');
            headerEl.classList.remove('header-scrolled');
          } else {
            headerEl.classList.add('header-scrolled');
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down: hide header
              headerEl.classList.add('header-hidden');
            } else if (currentScrollY < lastScrollY) {
              // Scrolling up: reveal header smoothly
              headerEl.classList.remove('header-hidden');
            }
          }
        }
        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // 1. Mobile navigation drawer controls
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

  function openMobileMenu() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.add('open');
      mobileBackdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.remove('open');
      mobileBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  // Auto-close mobile drawer on link tap or Escape key
  if (mobileDrawer) {
    const drawerLinks = mobileDrawer.querySelectorAll('a, button:not(#mobile-drawer-close):not(#search-btn-mobile)');
    drawerLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // 2. Global Search Modal (Ctrl+K or Header Button)
  const searchBtn = document.getElementById('search-btn');
  const searchBtnMobile = document.getElementById('search-btn-mobile');
  const searchModal = document.getElementById('search-modal');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('site-search-input');
  const searchResults = document.getElementById('search-results');

  const searchableItems = [
    { title: "Our History & 30-Year Archive (1993–Present)", url: "about.html#dwa-history", desc: "Founding under the neem tree in 1993, drought survival, women SHGs, 12A/80G, FCRA, school adoptions, and global vetting.", tag: "HISTORY" },
    { title: "The Problem & Rayalaseema Hardships (Where We Serve)", url: "about.html#the-problem", desc: "Deep roots across Parnapalli Village, Sirivella Block, Bandi Atmakur, and Gospadu Block in Andhra Pradesh.", tag: "KURNOOL" },
    { title: "Our Core Principles & Constitutional Values", url: "about.html#our-principles", desc: "Unconditional love, dignity, radical openness, 100% voluntary board, and constitutional rights.", tag: "VALUES" },
    { title: "Vision & Mission: Stronger Together", url: "about.html#mission", desc: "Our 3 pillars: Women-owned micro-enterprises, rural primary education, and compassionate community relief.", tag: "MISSION" },
    { title: "Leadership & Community Volunteers", url: "about.html#people", desc: "Voluntary governance council, Experienced Project Officer S. Moses, and village organizers.", tag: "PEOPLE" },
    { title: "Chronological Milestones (1993 to Today)", url: "about.html#dwa-history", desc: "Detailed timeline of major eras, community water wells, Mahila Sanghams, STAR Society orphanage care, and Vision 2030.", tag: "TIMELINE" },
    { title: "Empowering Women Entrepreneurs", url: "projects.html#women-entrepreneurs", desc: "12-month business & banking cohort, sewing machines, sheep livestock, micro-retail shops in Kurnool.", tag: "PROGRAM" },
    { title: "Dalit Child Education Support", url: "projects.html#child-education", desc: "10 Government primary schools across Sirivella & Bandi Atmakur, backpacks & scholarships.", tag: "PROGRAM" },
    { title: "Official Legal Registrations & Trust Badges", url: "about.html#tab-dwa-history", desc: "Society Reg 384/1993, FCRA 010270166, 12A, 80G, NITI Aayog NGO Darpan AP/2021/0276162.", tag: "GOVERNANCE" },
    { title: "FCRA Statutory Banking Details", url: "donate.html#fcra-repository", desc: "State Bank of India Main Branch New Delhi account 40108791616 for foreign remittances.", tag: "STATUTORY BANK" },
    { title: "5-Year Audited Financial Statements", url: "accountability.html#audited-financials", desc: "Independent CA audit reports by Sivapuram Subramanyam & Co. FY 2020-21 through 2024-25.", tag: "AUDIT" },
    { title: "Section 80G 50% Tax Exemption", url: "donate.html#tax-exemption", desc: "Income Tax exemption under Section 80G (Provisional URN: AAKFD2353BF20216) & Form 10BE.", tag: "TAX EXEMPTION" },
    { title: "Corporate Social Responsibility (CSR) Partnerships", url: "donate.html", desc: "Section 135 CSR partnerships with complete CA utilization certificates and photo reports.", tag: "DONATE" },
    { title: "6-Step Journey with Families", url: "projects.html#six-step-journey", desc: "Listening, reaching out, skill-building, seed tools, coaching, celebrating independence.", tag: "METHODOLOGY" },
    { title: "Executive Leadership & Board of Governance", url: "about.html#leadership", desc: "S. Samuel (President), Jangam Nirmala (VP), Bandela Lakshmamma (Sec), P. Sarojamma (Treasurer).", tag: "LEADERSHIP" },
    { title: "Medical & Paralysis Care Fund", url: "donate.html#medical-fund", desc: "Specialized rehabilitation, medicines, and dignified support for paralyzed and elderly community members.", tag: "FUND" },
    { title: "Winter & Emergency Relief Fund", url: "donate.html#relief-fund", desc: "30 kg food ration kits and emergency support for vulnerable families in rural drought times.", tag: "FUND" },
    { title: "Stories of Resilience & Hope", url: "projects.html#stories-of-resilience", desc: "Real case studies: Village grocery shop establishment and sustainable livestock rearing in Kurnool.", tag: "STORIES" },
    { title: "Rayalaseema Context & Mandal Locations", url: "about.html#mandals", desc: "Deep grassroots service in Parnapalli, Sirivella, and Bandi Atmakur Mandals since 1993.", tag: "LOCATIONS" }
  ];

  function openSearch() {
    if (searchModal && searchInput) {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput.focus(), 60);
      renderSearchResults('');
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
      if (searchInput) searchInput.value = '';
    }
  }

  function renderSearchResults(query) {
    if (!searchResults) return;
    const q = query.toLowerCase().trim();
    const filtered = q === '' 
      ? searchableItems.slice(0, 6) 
      : searchableItems.filter(item => 
          item.title.toLowerCase().includes(q) || 
          item.desc.toLowerCase().includes(q) || 
          item.tag.toLowerCase().includes(q)
        );

    if (filtered.length === 0) {
      searchResults.innerHTML = `
        <div class="py-12 text-center text-neutral-500">
          <p class="font-serif text-xl italic">No matching records found for "${query}"</p>
          <p class="text-xs uppercase tracking-widest mt-2 font-mono text-neutral-400">Try searching "FCRA", "Women", "Education", "Kurnool", or "Audit"</p>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = filtered.map(item => `
      <a href="${item.url}" class="group block p-4 border border-neutral-200 hover:border-black transition-all bg-white hover:bg-neutral-50">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 bg-neutral-100 group-hover:bg-[#04cc86] group-hover:text-black transition-colors">${item.tag}</span>
          <span class="text-xs text-neutral-400 group-hover:text-black transition-colors font-mono">&rarr; Jump to section</span>
        </div>
        <h4 class="font-serif text-lg text-neutral-900 group-hover:underline">${item.title}</h4>
        <p class="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">${item.desc}</p>
      </a>
    `).join('');

    searchResults.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeSearch);
    });
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchBtnMobile) searchBtnMobile.addEventListener('click', () => { closeMobileMenu(); openSearch(); });
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }

  // Keyboard shortcut Ctrl+K or / or Escape
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchModal && searchModal.classList.contains('active')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape') {
      closeSearch();
      closeMobileMenu();
    }
  });

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // 3. Interactive Thematic Filter for DWA Programs
  const programFilterBtns = document.querySelectorAll('.dwa-filter-btn');
  const programCards = document.querySelectorAll('.dwa-program-card');
  const programCountBadge = document.getElementById('dwa-filter-count');

  if (programFilterBtns.length > 0 && programCards.length > 0) {
    programFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.filter;

        programFilterBtns.forEach(b => {
          b.classList.remove('active', 'bg-[#04cc86]', 'bg-[#fab802]', 'bg-black', 'text-white', 'border-black');
          b.classList.add('bg-white', 'text-black', 'border-neutral-300');
        });
        btn.classList.add('active', 'text-black', 'border-black', 'font-bold');
        btn.classList.remove('bg-white', 'text-black', 'border-neutral-300');

        let count = 0;
        programCards.forEach(card => {
          const cardThemes = card.dataset.categories ? card.dataset.categories.split(',') : [];
          if (theme === 'all' || cardThemes.includes(theme)) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.transition = 'opacity 0.25s ease';
              card.style.opacity = '1';
            }, 20);
            count++;
          } else {
            card.style.display = 'none';
          }
        });

        if (programCountBadge) {
          programCountBadge.textContent = `Showing ${count} of ${programCards.length} Programs`;
        }
      });
    });
  }

  // 4. One-Click Copy to Clipboard with Glowing Neon Green Toast
  window.copyToClipboard = function(text, label) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${label || 'text'} to clipboard: ${text}`);
      }).catch(() => fallbackCopy(text, label));
    } else {
      fallbackCopy(text, label);
    }
  };

  function fallbackCopy(text, label) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${label || 'text'} to clipboard: ${text}`);
    } catch (e) {
      showToast(`Account: ${text}`);
    }
    document.body.removeChild(ta);
  }

  function showToast(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-[#04cc86] flex-shrink-0 animate-pulse"></span>
        <span class="text-xs font-mono tracking-wide text-white">${message}</span>
      </div>
    `;
    toast.classList.add('show');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // 5. Contact / Inquiry Form Submission Simulation
  const contactForm = document.getElementById('dwa-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Sending inquiry...`;
      setTimeout(() => {
        const trackingId = 'DWA-' + Math.floor(100000 + Math.random() * 900000);
        contactForm.innerHTML = `
          <div class="p-8 bg-[#F9F9F6] border border-black text-center">
            <div class="w-12 h-12 bg-black text-[#04cc86] rounded-full flex items-center justify-center mx-auto mb-4 font-mono font-bold text-xl">&#10003;</div>
            <span class="inline-block px-3 py-1 bg-[#04cc86] text-black text-xs font-mono uppercase tracking-widest font-bold mb-3">Transmission Confirmed</span>
            <h3 class="font-serif text-2xl font-normal text-black mb-2">Thank you for walking beside us.</h3>
            <p class="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your message has been assigned tracking code <strong class="font-mono text-black font-bold">${trackingId}</strong> and delivered to General Secretary Bandela Lakshmamma and our field team in Parnapalli Village.
            </p>
            <p class="text-xs font-mono text-neutral-400 mt-4 uppercase tracking-widest">Dalit Welfare Association • Society Reg: 384/1993</p>
          </div>
        `;
      }, 700);
    });
  }

  // 6. Volunteer / Partner Form Simulation
  const volunteerForm = document.getElementById('volunteer-form');
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      volunteerForm.innerHTML = `
        <div class="p-8 bg-[#F9F9F6] border border-black text-center">
          <span class="inline-block px-3 py-1 bg-[#04cc86] text-black text-xs font-mono uppercase tracking-widest font-bold mb-3">Application Received</span>
          <h3 class="font-serif text-2xl text-black mb-2">Welcome to the DWA Community</h3>
          <p class="text-sm text-neutral-700 max-w-lg mx-auto leading-relaxed font-sans">
            Thank you for offering your skills and solidarity. Project Officer S. Moses and our community coordinators will review your proposal and get in touch within 2 working days.
          </p>
          <div class="mt-4 pt-3 border-t border-neutral-300 font-mono text-[11px] text-neutral-500">
            Kurnool District, Andhra Pradesh • 80G Tax Deductible
          </div>
        </div>
      `;
    });
  }

  // 7. Interactive Donation Amount Selector with Real-Time Impact Description
  const donationAmountBtns = document.querySelectorAll('.donation-amount-btn');
  const customAmountInput = document.getElementById('custom-donation-amount');
  const donationImpactDesc = document.getElementById('donation-impact-description');
  const currencyToggleINR = document.getElementById('currency-inr');
  const currencyToggleUSD = document.getElementById('currency-usd');

  let currentCurrency = 'INR';

  const impactMap = {
    INR: {
      '1000': 'Provides a full primary school learning kit (backpack, notebooks, stationery & uniform) for 1 Dalit student.',
      '2500': 'Funds 1 month of sewing machine training & fabric supplies for a rural widow starting her tailoring trade.',
      '5000': 'Supplies a pair of healthy sheep with 1-year veterinary insurance care for sustainable rural livestock income.',
      '10000': 'Provides seed inventory kits for a woman entrepreneur establishing a village micro-retail grocery store.',
      '25000': 'Full enterprise sponsorship: Equipment, 12-month mentorship, bank account setup & Udyog Aadhaar licensing.'
    },
    USD: {
      '25': 'Provides comprehensive school ready supplies, textbooks & notebooks for 2 rural primary school children.',
      '60': 'Funds 1 month of master tailoring mentorship and materials for rural single mothers.',
      '125': 'Provides a woman entrepreneur with livestock (sheep pair) and veterinary health insurance.',
      '275': 'Covers complete initial shop fixtures and inventory to launch a micro-grocery store in Kurnool District.',
      '500': 'Comprehensive sponsorship of an entire rural enterprise cohort cycle with ongoing field coaching.'
    }
  };

  function updateImpactText(val) {
    if (!donationImpactDesc) return;
    const lookup = impactMap[currentCurrency];
    if (lookup && lookup[val]) {
      donationImpactDesc.textContent = lookup[val];
    } else if (val) {
      donationImpactDesc.textContent = `Your contribution directly empowers marginalized families in rural Andhra Pradesh under Section 80G tax benefits.`;
    }
  }

  if (donationAmountBtns) {
    donationAmountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        donationAmountBtns.forEach(b => {
          b.classList.remove('bg-[#04cc86]', 'border-black', 'bg-black', 'text-white');
          b.classList.add('bg-white', 'text-black', 'border-neutral-300');
        });
        btn.classList.remove('bg-white', 'text-black', 'border-neutral-300');
        btn.classList.add('bg-[#04cc86]', 'text-black', 'border-black', 'font-bold');
        if (customAmountInput) customAmountInput.value = btn.dataset.amount;
        updateImpactText(btn.dataset.amount);
      });
    });
  }

  if (customAmountInput) {
    customAmountInput.addEventListener('input', (e) => {
      donationAmountBtns.forEach(b => {
        b.classList.remove('bg-[#04cc86]', 'border-black', 'bg-black', 'text-white');
        b.classList.add('bg-white', 'text-black', 'border-neutral-300');
      });
      updateImpactText(e.target.value);
    });
  }

  if (currencyToggleINR && currencyToggleUSD) {
    currencyToggleINR.addEventListener('click', () => {
      currentCurrency = 'INR';
      currencyToggleINR.classList.add('bg-black', 'text-white', 'font-bold');
      currencyToggleINR.classList.remove('bg-white', 'text-black');
      currencyToggleUSD.classList.remove('bg-black', 'text-white');
      currencyToggleUSD.classList.add('bg-white', 'text-black');
      
      const inrAmounts = ['1000', '2500', '5000', '10000', '25000'];
      donationAmountBtns.forEach((btn, idx) => {
        btn.dataset.amount = inrAmounts[idx];
        btn.textContent = `₹${parseInt(inrAmounts[idx]).toLocaleString('en-IN')}`;
      });
      if (customAmountInput) customAmountInput.placeholder = "Enter custom amount in ₹ INR";
      if (donationAmountBtns[1]) updateImpactText(donationAmountBtns[1].dataset.amount);
      if (window.switchDonorTab) window.switchDonorTab('indian');
    });

    currencyToggleUSD.addEventListener('click', () => {
      currentCurrency = 'USD';
      currencyToggleUSD.classList.add('bg-black', 'text-white', 'font-bold');
      currencyToggleUSD.classList.remove('bg-white', 'text-black');
      currencyToggleINR.classList.remove('bg-black', 'text-white');
      currencyToggleINR.classList.add('bg-white', 'text-black');
      
      const usdAmounts = ['25', '60', '125', '275', '500'];
      donationAmountBtns.forEach((btn, idx) => {
        btn.dataset.amount = usdAmounts[idx];
        btn.textContent = `$${usdAmounts[idx]}`;
      });
      if (customAmountInput) customAmountInput.placeholder = "Enter custom amount in $ USD";
      if (donationAmountBtns[1]) updateImpactText(donationAmountBtns[1].dataset.amount);
      if (window.switchDonorTab) window.switchDonorTab('intl');
    });
  }

  // 7.5 Donor Channel Toggle (Indian Donors vs International Donors)
  const donorToggleIndian = document.getElementById('donor-toggle-indian');
  const donorToggleIntl = document.getElementById('donor-toggle-intl');
  const panelIndianDonors = document.getElementById('panel-indian-donors');
  const panelIntlDonors = document.getElementById('panel-intl-donors');

  window.switchDonorTab = function(mode) {
    if (!donorToggleIndian || !donorToggleIntl || !panelIndianDonors || !panelIntlDonors) return;

    if (mode === 'indian') {
      donorToggleIndian.classList.add('bg-white', 'text-black', 'border-b-[#04cc86]');
      donorToggleIndian.classList.remove('bg-neutral-100', 'text-neutral-600', 'border-b-transparent');
      donorToggleIndian.setAttribute('aria-selected', 'true');

      donorToggleIntl.classList.remove('bg-white', 'text-black', 'border-b-[#04cc86]');
      donorToggleIntl.classList.add('bg-neutral-100', 'text-neutral-600', 'border-b-transparent');
      donorToggleIntl.setAttribute('aria-selected', 'false');

      panelIndianDonors.classList.remove('hidden');
      panelIntlDonors.classList.add('hidden');
    } else {
      donorToggleIntl.classList.add('bg-white', 'text-black', 'border-b-[#04cc86]');
      donorToggleIntl.classList.remove('bg-neutral-100', 'text-neutral-600', 'border-b-transparent');
      donorToggleIntl.setAttribute('aria-selected', 'true');

      donorToggleIndian.classList.remove('bg-white', 'text-black', 'border-b-[#04cc86]');
      donorToggleIndian.classList.add('bg-neutral-100', 'text-neutral-600', 'border-b-transparent');
      donorToggleIndian.setAttribute('aria-selected', 'false');

      panelIntlDonors.classList.remove('hidden');
      panelIndianDonors.classList.add('hidden');
    }
  };

  if (donorToggleIndian) {
    donorToggleIndian.addEventListener('click', () => window.switchDonorTab('indian'));
  }
  if (donorToggleIntl) {
    donorToggleIntl.addEventListener('click', () => window.switchDonorTab('intl'));
  }

  // Giving Frequency Selector (One-Time Gift vs Monthly Sustainer)
  const donationFreqBtns = document.querySelectorAll('.donation-freq-btn');
  if (donationFreqBtns) {
    donationFreqBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        donationFreqBtns.forEach(b => {
          b.classList.remove('bg-black', 'text-white', 'border-black');
          b.classList.add('bg-white', 'text-neutral-800', 'border-neutral-300');
        });
        btn.classList.remove('bg-white', 'text-neutral-800', 'border-neutral-300');
        btn.classList.add('bg-black', 'text-white', 'border-black');
      });
    });
  }

  // Hash check for donor channel options
  function checkDonorHash() {
    const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
    if (['fcra', 'fcra-repository', 'international', 'intl', 'global', 'benevity', 'swift'].includes(rawHash)) {
      if (window.switchDonorTab) window.switchDonorTab('intl');
      const target = document.getElementById('donor-options-box') || document.getElementById('fcra-repository');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else if (['tax', 'tax-exemption', '80g', 'indian', 'domestic', '12a'].includes(rawHash)) {
      if (window.switchDonorTab) window.switchDonorTab('indian');
      const target = document.getElementById('donor-options-box') || document.getElementById('tax-exemption');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }
  checkDonorHash();
  window.addEventListener('hashchange', checkDonorHash);

  // 6. Global Privacy & Refund Policy Modals
  window.openPolicyModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closePolicyModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  document.querySelectorAll('.policy-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // 7. Featured Programs Mobile Card Slider
  const programsTrack = document.getElementById('featured-programs-track');
  const prevProgramBtn = document.getElementById('program-slider-prev');
  const nextProgramBtn = document.getElementById('program-slider-next');
  const programDots = document.querySelectorAll('#program-slider-dots .program-dot');

  if (programsTrack) {
    if (prevProgramBtn && nextProgramBtn) {
      prevProgramBtn.addEventListener('click', () => {
        const cardWidth = programsTrack.firstElementChild ? programsTrack.firstElementChild.offsetWidth + 24 : 320;
        programsTrack.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      });

      nextProgramBtn.addEventListener('click', () => {
        const cardWidth = programsTrack.firstElementChild ? programsTrack.firstElementChild.offsetWidth + 24 : 320;
        programsTrack.scrollBy({ left: cardWidth, behavior: 'smooth' });
      });
    }

    if (programDots.length > 0) {
      programsTrack.addEventListener('scroll', () => {
        const cardWidth = programsTrack.firstElementChild ? programsTrack.firstElementChild.offsetWidth + 24 : 320;
        const activeIndex = Math.min(
          programDots.length - 1,
          Math.max(0, Math.round(programsTrack.scrollLeft / cardWidth))
        );
        programDots.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.className = 'program-dot w-6 h-2 bg-[#04cc86] border border-black inline-block transition-all cursor-pointer';
          } else {
            dot.className = 'program-dot w-2 h-2 bg-neutral-300 border border-neutral-400 inline-block transition-all cursor-pointer';
          }
        });
      }, { passive: true });

      programDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          const cardWidth = programsTrack.firstElementChild ? programsTrack.firstElementChild.offsetWidth + 24 : 320;
          programsTrack.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
        });
      });
    }
  }

  // 8. Community at a Glance Slide-Up Cards Interaction (Touch, Click & Keyboard Support)
  const glanceCards = document.querySelectorAll('.glance-slide-card');
  if (glanceCards.length > 0) {
    glanceCards.forEach(card => {
      // Toggle card slide-up on tap / click
      card.addEventListener('click', () => {
        const isActive = card.classList.contains('is-active');
        // Close sibling cards on mobile
        glanceCards.forEach(c => {
          if (c !== card) c.classList.remove('is-active');
        });
        card.classList.toggle('is-active', !isActive);
      });

      // Keyboard support: Enter or Space toggles slide-up
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-active');
        }
      });
    });

    // Tap outside to close all active cards
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.glance-slide-card')) {
        glanceCards.forEach(card => card.classList.remove('is-active'));
      }
    });
  }

  // 9. About Us Page Interactive Tabs System
  const aboutTabBtns = document.querySelectorAll('.about-tab-btn');
  const aboutTabPanels = document.querySelectorAll('.about-tab-panel');

  if (aboutTabBtns.length > 0 && aboutTabPanels.length > 0) {
    function switchAboutTab(targetId, updateHash = true) {
      const targetBtn = document.querySelector(`.about-tab-btn[data-tab="${targetId}"]`);
      const targetPanel = document.getElementById(targetId);

      if (!targetBtn || !targetPanel) return;

      aboutTabBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });

      aboutTabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });

      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');
      targetPanel.classList.add('active');
      targetPanel.style.display = 'block';

      // On mobile screens, smoothly scroll active tab button into view
      try {
        targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (err) {}

      if (updateHash) {
        const hashSlug = targetId.replace('tab-', '');
        if (history.pushState) {
          history.pushState(null, null, `#${hashSlug}`);
        } else {
          location.hash = hashSlug;
        }
      }
    }

    // Expose globally for header nav & hash links
    window.switchAboutTab = switchAboutTab;

    aboutTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabTarget = btn.getAttribute('data-tab');
        switchAboutTab(tabTarget, true);
        const tabsContainer = btn.closest('nav') || document.getElementById('about-tabs-container') || document.getElementById('page-tabs-container');
        if (tabsContainer) {
          const rect = tabsContainer.getBoundingClientRect();
          if (rect.top > 2) {
            tabsContainer.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Check hash on page load or on hash change
    function checkInitialHash() {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      if (!rawHash) return;

      const hashMapping = {
        'dwa-history': 'tab-dwa-history',
        'history': 'tab-dwa-history',
        'the-problem': 'tab-the-problem',
        'problem': 'tab-the-problem',
        'hardships': 'tab-the-problem',
        'kurnool': 'tab-the-problem',
        'our-principles': 'tab-our-principles',
        'principles': 'tab-our-principles',
        'values': 'tab-our-principles',
        'mission': 'tab-mission',
        'vision': 'tab-mission',
        'people': 'tab-people',
        'leadership': 'tab-people',
        'board': 'tab-people',
        'women-empowerment': 'tab-women-empowerment',
        'women': 'tab-women-empowerment',
        'child-education': 'tab-child-education',
        'education': 'tab-child-education',
        'orphanage': 'tab-orphanage',
        'testimonials': 'tab-testimonials',
        'past-projects-archive': 'tab-past-projects-archive',
        'archive': 'tab-past-projects-archive',
        'transparency': 'tab-transparency',
        'tracking-changes': 'tab-tracking-changes',
        'photo-gallery': 'tab-photo-gallery',
        'gallery': 'tab-photo-gallery',
        'publications': 'tab-publications'
      };

      const matchedTabId = hashMapping[rawHash] || (document.getElementById(`tab-${rawHash}`) ? `tab-${rawHash}` : null);
      if (matchedTabId) {
        switchAboutTab(matchedTabId, false);
        const tabsContainer = document.getElementById('about-tabs-container') || document.getElementById('page-tabs-container') || document.querySelector('nav[role="tablist"]');
        if (tabsContainer) {
          tabsContainer.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }

    checkInitialHash();
    window.addEventListener('hashchange', checkInitialHash);
  }

  // 10. DWA History Pop-Up Note Modal Logic
  const historyModal = document.getElementById('history-note-modal');
  const openHistoryBtn = document.getElementById('open-history-note-btn');
  const closeHistoryBtn = document.getElementById('history-modal-close');
  const closeHistoryFooterBtn = document.getElementById('history-modal-close-footer');

  if (openHistoryBtn && historyModal) {
    openHistoryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openPolicyModal === 'function') {
        window.openPolicyModal('history-note-modal');
      } else {
        historyModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (closeHistoryBtn && historyModal) {
    closeHistoryBtn.addEventListener('click', () => {
      if (typeof window.closePolicyModal === 'function') {
        window.closePolicyModal('history-note-modal');
      } else {
        historyModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  if (closeHistoryFooterBtn && historyModal) {
    closeHistoryFooterBtn.addEventListener('click', () => {
      if (typeof window.closePolicyModal === 'function') {
        window.closePolicyModal('history-note-modal');
      } else {
        historyModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Handle ESC key to close active history modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (historyModal && historyModal.classList.contains('active')) {
        if (typeof window.closePolicyModal === 'function') {
          window.closePolicyModal('history-note-modal');
        } else {
          historyModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    }
  });

  // Check if URL hash opens history note popup
  function checkHistoryNoteHash() {
    const rawHash = window.location.hash.toLowerCase();
    if (rawHash === '#history-note' || rawHash === '#history-popup' || rawHash === '#popup-note') {
      if (typeof window.openPolicyModal === 'function') {
        window.openPolicyModal('history-note-modal');
      }
    }
  }
  checkHistoryNoteHash();
  window.addEventListener('hashchange', checkHistoryNoteHash);

  // 11. About Us Page Clean Image Carousel & Lightbox Popup
  const aboutSliderTrack = document.getElementById('about-slider-track');
  const aboutSliderPrev = document.getElementById('about-slider-prev');
  const aboutSliderNext = document.getElementById('about-slider-next');
  const aboutSliderCounter = document.getElementById('about-slider-counter');
  const aboutSliderDots = document.querySelectorAll('#about-slider-dots .about-slider-dot');

  // Lightbox Modal Elements
  const lightboxModal = document.getElementById('image-lightbox-modal');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCounter = document.getElementById('lightbox-counter');

  if (aboutSliderTrack) {
    const slides = aboutSliderTrack.querySelectorAll('.about-slide-card');
    const totalSlides = slides.length;
    let autoPlayTimer = null;
    let currentLightboxIndex = 0;
    const imageList = [];

    // Collect images for lightbox
    slides.forEach((card) => {
      const fullSrc = card.dataset.fullImg || card.querySelector('img')?.src;
      imageList.push(fullSrc);
    });

    function getCardStep() {
      const firstCard = aboutSliderTrack.querySelector('.about-slide-card');
      return firstCard ? firstCard.offsetWidth + 24 : 380;
    }

    function updateActiveState() {
      const step = getCardStep();
      const currentScroll = aboutSliderTrack.scrollLeft;
      const activeIndex = Math.min(
        totalSlides - 1,
        Math.max(0, Math.round(currentScroll / step))
      );

      // Update counter
      if (aboutSliderCounter) {
        aboutSliderCounter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
      }

      // Update dots
      if (aboutSliderDots.length > 0) {
        aboutSliderDots.forEach((dot, idx) => {
          if (idx === activeIndex) {
            dot.className = 'about-slider-dot w-8 h-2.5 bg-black border border-black transition-all cursor-pointer';
            dot.setAttribute('aria-current', 'true');
          } else {
            dot.className = 'about-slider-dot w-2.5 h-2.5 bg-neutral-300 border border-neutral-400 hover:bg-neutral-500 transition-all cursor-pointer';
            dot.removeAttribute('aria-current');
          }
        });
      }
    }

    function scrollNext() {
      const step = getCardStep();
      const maxScroll = aboutSliderTrack.scrollWidth - aboutSliderTrack.clientWidth;
      if (aboutSliderTrack.scrollLeft >= maxScroll - 15) {
        aboutSliderTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        aboutSliderTrack.scrollBy({ left: step, behavior: 'smooth' });
      }
    }

    function scrollPrev() {
      const step = getCardStep();
      if (aboutSliderTrack.scrollLeft <= 15) {
        const maxScroll = aboutSliderTrack.scrollWidth - aboutSliderTrack.clientWidth;
        aboutSliderTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        aboutSliderTrack.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }

    if (aboutSliderNext) {
      aboutSliderNext.addEventListener('click', () => {
        scrollNext();
        resetAutoPlay();
      });
    }

    if (aboutSliderPrev) {
      aboutSliderPrev.addEventListener('click', () => {
        scrollPrev();
        resetAutoPlay();
      });
    }

    if (aboutSliderDots.length > 0) {
      aboutSliderDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          const step = getCardStep();
          aboutSliderTrack.scrollTo({ left: idx * step, behavior: 'smooth' });
          resetAutoPlay();
        });
      });
    }

    aboutSliderTrack.addEventListener('scroll', () => {
      updateActiveState();
    }, { passive: true });

    // Mouse drag scrolling on desktop
    let isMouseDown = false;
    let hasDragged = false;
    let startX = 0;
    let startScrollLeft = 0;

    aboutSliderTrack.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      hasDragged = false;
      startX = e.pageX - aboutSliderTrack.offsetLeft;
      startScrollLeft = aboutSliderTrack.scrollLeft;
      stopAutoPlay();
    });

    aboutSliderTrack.addEventListener('mouseleave', () => {
      if (isMouseDown) {
        isMouseDown = false;
        startAutoPlay();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDown) {
        isMouseDown = false;
        startAutoPlay();
      }
    });

    aboutSliderTrack.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - aboutSliderTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) {
        hasDragged = true;
      }
      aboutSliderTrack.scrollLeft = startScrollLeft - walk;
    });

    // Lightbox Popup Functionality
    function openLightbox(idx) {
      if (!lightboxModal || !lightboxImg) return;
      currentLightboxIndex = idx;
      updateLightboxImage();
      lightboxModal.classList.remove('hidden');
      lightboxModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      stopAutoPlay();
    }

    function closeLightbox() {
      if (!lightboxModal) return;
      lightboxModal.classList.add('hidden');
      lightboxModal.classList.remove('flex');
      document.body.style.overflow = '';
      startAutoPlay();
    }

    function updateLightboxImage() {
      if (!lightboxImg || imageList.length === 0) return;
      lightboxImg.style.opacity = '0';
      lightboxImg.src = imageList[currentLightboxIndex];
      lightboxImg.onload = () => {
        lightboxImg.style.opacity = '1';
      };
      if (lightboxCounter) {
        lightboxCounter.textContent = `${String(currentLightboxIndex + 1).padStart(2, '0')} / ${String(imageList.length).padStart(2, '0')}`;
      }
    }

    function nextLightboxImage() {
      if (imageList.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex + 1) % imageList.length;
      updateLightboxImage();
    }

    // Lightbox Mobile Touch Swipe Gestures
    if (lightboxModal) {
      let touchStartX = 0;
      let touchStartY = 0;
      lightboxModal.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }
      }, { passive: true });

      lightboxModal.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const touchEndX = e.changedTouches[0].screenX;
          const touchEndY = e.changedTouches[0].screenY;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;
          if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
              nextLightboxImage();
            } else {
              prevLightboxImage();
            }
          }
        }
      }, { passive: true });
    }

    function prevLightboxImage() {
      if (imageList.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex - 1 + imageList.length) % imageList.length;
      updateLightboxImage();
    }

    // Attach click listeners to each slide card for popup
    slides.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (!hasDragged) {
          openLightbox(idx);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextLightboxImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightboxImage);

    // Keyboard navigation for Lightbox
    window.addEventListener('keydown', (e) => {
      if (lightboxModal && !lightboxModal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight') {
          nextLightboxImage();
        } else if (e.key === 'ArrowLeft') {
          prevLightboxImage();
        }
      }
    });

    // Autoplay rotation every 5 seconds
    function startAutoPlay() {
      stopAutoPlay();
      if (!lightboxModal || lightboxModal.classList.contains('hidden')) {
        autoPlayTimer = setInterval(scrollNext, 5000);
      }
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    aboutSliderTrack.addEventListener('mouseenter', stopAutoPlay);
    aboutSliderTrack.addEventListener('mouseleave', startAutoPlay);
    aboutSliderTrack.addEventListener('touchstart', stopAutoPlay, { passive: true });
    aboutSliderTrack.addEventListener('touchend', startAutoPlay, { passive: true });

    startAutoPlay();
    updateActiveState();
  }
});
