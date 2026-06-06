/* ============================================
   COMMUNITY CONCIERGE SERVICES — MAIN SCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVBAR: Scroll effect + hamburger toggle
  // ============================================
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    // Animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ============================================
  // SMOOTH SCROLL for all anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // ACCORDION
  // ============================================
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      accordionItems.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Open first accordion item by default
  if (accordionItems.length > 0) {
    accordionItems[0].classList.add('open');
    accordionItems[0].querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
  }

  // ============================================
  // SCROLL ANIMATION (Intersection Observer)
  // ============================================
  const animateElements = document.querySelectorAll(
    '.service-card, .why-card, .benefit-card, .accordion-item, .contact-info, .contact-form, .trust-item, .duration-box, .service-areas-box, .duration-item'
  );

  animateElements.forEach(el => {
    el.classList.add('animate-up');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Staggered delay based on element index among siblings
          const siblings = Array.from(entry.target.parentElement?.children || []);
          const index = siblings.indexOf(entry.target);
          const delay = Math.min(index * 80, 400);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  animateElements.forEach(el => observer.observe(el));

  // ============================================
  // CONTACT FORM SUBMISSION
  // ============================================
  const form = document.getElementById('quote-form');
  const toast = document.getElementById('success-toast');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simple client-side validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('[required]:invalid, [required][style*="rgb(239"]');
      if (firstError) firstError.focus();
      return;
    }

    // Send form data to Web3Forms via Fetch
    const submitBtn = form.querySelector('#submit-quote');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Sending...
    `;

    const formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        // Show success toast
        showToast();
        // Reset form
        form.reset();
      } else {
        console.error(response);
        alert(json.message || "Something went wrong. Please try again.");
      }
    })
    .catch(error => {
      console.error(error);
      alert("Form submission failed. Please check your internet connection.");
    })
    .then(() => {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Send My Quote Request
      `;
    });
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  // Reset field error styles on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow = '';
    });
  });

  // ============================================
  // ACTIVE NAV LINK on scroll
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => sectionObserver.observe(section));

  // Add active nav styles dynamically
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    .nav-links a.active {
      color: var(--text-white) !important;
      background: rgba(14, 165, 233, 0.08) !important;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(activeStyle);

  // ============================================
  // HERO PARALLAX (subtle)
  // ============================================
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroImg.style.transform = `translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  // ============================================
  // GALLERY PLACEHOLDER HOVER EFFECT
  // ============================================
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const label = item.querySelector('.gallery-label--after');
      if (label) label.style.background = 'rgba(14, 165, 233, 1)';
    });
    item.addEventListener('mouseleave', () => {
      const label = item.querySelector('.gallery-label--after');
      if (label) label.style.background = 'rgba(14, 165, 233, 0.8)';
    });
  });

  console.log('✅ Community Concierge Services — Website loaded successfully.');
});
