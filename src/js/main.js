(function() {
  "use strict";

  // Constants
  const SCROLL_OFFSET = 200;
  const SCROLL_THRESHOLD = 100;
  const DEBOUNCE_DELAY = 100;
  const PORTFOLIO_AUTOPLAY_DELAY = 25000;
  const PORTFOLIO_ANIMATION_SPEED = 600;
  const PORTFOLIO_SLIDE_PAUSE_SPEED = 400;
  const AOS_DURATION = 500;

  /**
   * Easy selector helper function
   * @param {string} el - The selector string.
   * @param {boolean} [all=false] - Whether to select all matching elements.
   * @returns {Element|Element[]} - The selected element(s).
   */
  const select = (el, all = false) => {
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  /**
   * Easy event listener function
   * @param {string} type - The event type.
   * @param {string} el - The selector string for the target element(s).
   * @param {Function} listener - The event handler function.
   * @param {boolean} [all=false] - Whether to attach to all matching elements.
   */
  const on = (type, el, listener, all = false) => {
    const selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   * @param {Element} el - The element to attach the scroll event to.
   * @param {Function} listener - The scroll event handler function.
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  /**
   * Debounce function to limit the rate of function execution.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The debounce delay in milliseconds.
   * @returns {Function} - The debounced function.
   */
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  /**
   * Navbar links active state on scroll
   */
  const navbarlinks = select('#navmenu .scrollto', true);
  const navbarlinksActive = () => {
    const position = window.scrollY + SCROLL_OFFSET;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      const section = select(navbarlink.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
        navbarlink.setAttribute('aria-current', 'page'); // Add ARIA attribute for active link
      } else {
        navbarlink.classList.remove('active');
        navbarlink.removeAttribute('aria-current'); // Remove ARIA attribute for inactive link
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, debounce(navbarlinksActive, DEBOUNCE_DELAY));

  /**
   * Scrolls to an element with header offset
   * @param {string} el - The selector string of the element to scroll to.
   */
  const scrollto = (el) => {
    const header = select('#header');
    const offset = header ? header.offsetHeight : 0;
    const element = select(el);
    if (element) {
      const elementPos = element.offsetTop;
      window.scrollTo({
        top: elementPos - offset,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  const selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('load', headerScrolled);
    onscroll(document, debounce(headerScrolled, DEBOUNCE_DELAY));
  }

  /**
   * Back to top button
   */
  const backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        backtotop.classList.add('active');
        backtotop.setAttribute('aria-hidden', 'false');
      } else {
        backtotop.classList.remove('active');
        backtotop.setAttribute('aria-hidden', 'true');
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, debounce(toggleBacktotop, DEBOUNCE_DELAY));
  }

  /**
   * Mobile nav toggle
   */
  const mobileNavToggle = () => {
    const body = document.querySelector('body');
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    if (!mobileNavToggleBtn) return;

    body.classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
    mobileNavToggleBtn.setAttribute('aria-expanded', body.classList.contains('mobile-nav-active'));
  };

  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToggle);
  }

  /**
   * Smooth scroll and mobile menu toggle on link click
   */
  document.addEventListener('click', function(e) {
    if (e.target.matches('.scrollto')) {
      const targetHash = e.target.getAttribute('href');
      const targetElement = document.querySelector(targetHash);

      if (targetElement) {
        e.preventDefault();

        if (document.querySelector('body').classList.contains('mobile-nav-active')) {
          mobileNavToggle();
        }

        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, true);

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
      this.setAttribute('aria-expanded', this.nextElementSibling.classList.contains('dropdown-active')); // Update ARIA attribute
    }
  }, true)


  /**
   * Scroll with offset on page load with hash links in the URL
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Preloader
   */
  const preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Portfolio filter controls with Swiper
   */
  let portfolioSwiperInstance = null;

  window.addEventListener('load', () => {
    const portfolioSwiper = select('.portfolio-swiper');
    const portfolioItems = select('.portfolio-item', true);
    const portfolioFilters = select('#portfolio-filters .filter-button', true);

    if (!portfolioSwiper || !portfolioItems.length || !portfolioFilters.length) {
      console.info('Portfolio swiper or filters not found, skipping filter setup.');
      return;
    }

    const applyFilter = (filterValue) => {
      portfolioItems.forEach(item => {
        const matches = filterValue === '*' || item.matches(filterValue);
        if (matches) {
          item.classList.remove('portfolio-item--hidden');
          item.removeAttribute('hidden');
          item.style.display = '';
        } else {
          item.classList.add('portfolio-item--hidden');
          item.setAttribute('hidden', 'true');
          item.style.display = 'none';
        }
      });

      if (portfolioSwiperInstance) {
        portfolioSwiperInstance.update();
        portfolioSwiperInstance.slideTo(0);
      }

      requestAnimationFrame(() => AOS.refresh());
    };

    on('click', '#portfolio-filters .filter-button', function(e) {
      e.preventDefault();
      const targetButton = this;
      const filterValue = targetButton.getAttribute('data-filter') || '*';

      portfolioFilters.forEach(btn => {
        btn.classList.remove('filter-active');
        btn.setAttribute('aria-selected', 'false');
      });

      targetButton.classList.add('filter-active');
      targetButton.setAttribute('aria-selected', 'true');

      applyFilter(filterValue);
    }, true);

    const activeButton = portfolioFilters.find(btn => btn.classList.contains('filter-active')) || portfolioFilters[0];
    if (activeButton) {
      applyFilter(activeButton.getAttribute('data-filter') || '*');
    }
  });


  /**
   * Portfolio slider
   */
  if (typeof Swiper !== 'undefined') {
    try {
      portfolioSwiperInstance = new Swiper('.portfolio-swiper', {
        speed: PORTFOLIO_ANIMATION_SPEED,
        loop: false,
        autoplay: {
          delay: PORTFOLIO_AUTOPLAY_DELAY,
          disableOnInteraction: true
        },
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        slidesPerView: 'auto',
        spaceBetween: 30,
        centeredSlides: false,
        watchOverflow: true,
        breakpoints: {
          320: { spaceBetween: 15 },
          640: { spaceBetween: 20 },
          768: { spaceBetween: 25 },
          1024: { spaceBetween: 30 }
        }
      });
    } catch (error) {
      console.error('Failed to initialize portfolio slider:', error);
    }
  }

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: AOS_DURATION,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  });

})();
