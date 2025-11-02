(function() {
  "use strict";

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
    const position = window.scrollY + 200;
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
  onscroll(document, debounce(navbarlinksActive, 100)); // Debounce scroll event handler

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
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('load', headerScrolled);
    onscroll(document, debounce(headerScrolled, 100)); // Debounce scroll event handler
  }

  /**
   * Back to top button
   */
  const backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
        backtotop.setAttribute('aria-hidden', 'false'); // Ensure the button is visible to screen readers
      } else {
        backtotop.classList.remove('active');
        backtotop.setAttribute('aria-hidden', 'true'); // Hide the button from screen readers
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, debounce(toggleBacktotop, 100)); // Debounce scroll event handler
  }

  /**
   * Mobile nav toggle
   */

  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

/**
 * Toggle mobile navigation menu
 */
function mobileNavToogle() {
  document.querySelector('body').classList.toggle('mobile-nav-active');
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  mobileNavToggleBtn.classList.toggle('bi-list');
  mobileNavToggleBtn.classList.toggle('bi-x');
  mobileNavToggleBtn.setAttribute('aria-expanded', document.querySelector('body').classList.contains('mobile-nav-active'));
}

// Toggle mobile menu on click
document.querySelector('.mobile-nav-toggle')?.addEventListener('click', mobileNavToogle);

/**
 * Smooth scroll and mobile menu toggle on link click
 */
document.addEventListener('click', function(e) {
  if (e.target.matches('.scrollto')) {
    const targetHash = e.target.getAttribute('href');
    const targetElement = document.querySelector(targetHash);

    if (targetElement) {
      e.preventDefault();

      // Close mobile menu if it's open
      if (document.querySelector('body').classList.contains('mobile-nav-active')) {
        mobileNavToogle();
      }

      // Smooth scroll to the target element
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, true);





  /**
   * Hide mobile nav on same-page/hash links
   */
  // document.querySelectorAll('#navmenu a').forEach(navmenu => {
  //   navmenu.addEventListener('click', () => {
  //     if (document.querySelector('.mobile-nav-active')) {
  //       mobileNavToogle();
  //     }
  //   });

  // });


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

  // /**
  //  * Scroll with offset on links with a class name .scrollto
  //  */
  // on('click', '.scrollto', function(e) {
  //   if (select(this.hash)) {
  //     e.preventDefault();

  //     const navbar = select('#navbar');
  //     if (navbar.classList.contains('navbar-mobile')) {
  //       navbar.classList.remove('navbar-mobile');
  //       const navbarToggle = select('.mobile-nav-toggle');
  //       navbarToggle.classList.toggle('bi-list');
  //       navbarToggle.classList.toggle('bi-x');
  //       navbarToggle.setAttribute('aria-expanded', 'false');
  //     }
  //     scrollto(this.hash);
  //   }
  // }, true);

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
   * Clients Slider
   */
  // try {
  //   new Swiper('.clients-slider', {
  //     speed: 400,
  //     loop: true,
  //     autoplay: {
  //       delay: 5000,
  //       disableOnInteraction: false
  //     },
  //     slidesPerView: 'auto',
  //     pagination: {
  //       el: '.swiper-pagination',
  //       type: 'bullets',
  //       clickable: true
  //     },
  //     breakpoints: {
  //       320: {
  //         slidesPerView: 2,
  //         spaceBetween: 40
  //       },
  //       480: {
  //         slidesPerView: 3,
  //         spaceBetween: 60
  //       },
  //       640: {
  //         slidesPerView: 4,
  //         spaceBetween: 80
  //       },
  //       992: {
  //         slidesPerView: 6,
  //         spaceBetween: 120
  //       }
  //     }
  //   });
  // } catch (error) {
  //   console.error('Failed to initialize clients slider:', error);
  // }

  /**
   * Portfolio filter controls
   */
  window.addEventListener('load', () => {
    const portfolioGrid = select('.portfolio-grid');
    const portfolioItems = select('.portfolio-item', true);
    const portfolioFilters = select('#portfolio-filters .filter-button', true);

    if (!portfolioGrid || !portfolioItems.length || !portfolioFilters.length) {
      console.info('Portfolio grid or filters not found, skipping filter setup.');
      return;
    }

    const applyFilter = (filterValue) => {
      portfolioItems.forEach(item => {
        const matches = filterValue === '*' || item.matches(filterValue);
        if (matches) {
          item.classList.remove('portfolio-item--hidden');
          item.removeAttribute('hidden');
        } else {
          item.classList.add('portfolio-item--hidden');
          item.setAttribute('hidden', 'true');
        }
      });

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
   * Initiate portfolio lightbox 
   */
  // Uncomment and configure the lightbox as needed
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  try {
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize portfolio details slider:', error);
  }


  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  });

  /**
   * Initiate Pure Counter 
   */
  // new PureCounter();

})();
