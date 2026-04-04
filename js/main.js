/* ============================================
   Washington Homes 4 Cash — Main JS
   ============================================ */

(function () {
  'use strict';

  /* --- Mobile Nav Toggle --- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* --- FAQ Accordion (auto-close others) --- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });

  /* --- Smooth Scroll for Anchor Links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
        var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  /* --- Scroll Fade-In Animation (IntersectionObserver) --- */
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeElements.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();
