(function () {
  const root = document.documentElement;
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
  const themeText = themeToggle ? themeToggle.querySelector('.theme-text') : null;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const typingText = document.getElementById('typingText');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const contactForm = document.getElementById('contactForm');
  const year = document.getElementById('year');
  const themeStorageKey = 'portfolio-theme';

  if (year) {
    year.textContent = new Date().getFullYear().toString();
  }

  function preferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function readSavedTheme() {
    try {
      const saved = localStorage.getItem(themeStorageKey);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function writeSavedTheme(theme) {
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      // Local storage might be blocked; runtime switch still works.
    }
  }

  function setThemeUI(theme) {
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'light' ? '#f4f7ff' : '#070b1a');
    }

    if (!themeToggle || !themeIcon || !themeText) {
      return;
    }

    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeText.textContent = isLight ? 'Light' : 'Dark';

    themeIcon.classList.remove('fa-sun', 'fa-moon');
    themeIcon.classList.add(isLight ? 'fa-sun' : 'fa-moon');
  }

  function applyTheme(theme, persist) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    setThemeUI(nextTheme);
    if (persist) {
      writeSavedTheme(nextTheme);
    }
  }

  const activeTheme = root.getAttribute('data-theme');
  if (activeTheme === 'dark' || activeTheme === 'light') {
    setThemeUI(activeTheme);
  } else {
    const initTheme = readSavedTheme() || preferredTheme();
    applyTheme(initTheme, false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme, true);
    });
  }

  // Mobile navigation toggle and close behaviors.
  function setNavState(isOpen) {
    if (!navToggle) {
      return;
    }
    body.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = body.classList.contains('nav-open');
      setNavState(!isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setNavState(false);
      });
    });

    document.addEventListener('click', function (event) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!body.classList.contains('nav-open')) {
        return;
      }
      if (!navMenu.contains(target) && !navToggle.contains(target)) {
        setNavState(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && body.classList.contains('nav-open')) {
        setNavState(false);
      }
    });
  }

  // Smooth scrolling for browsers needing manual handling.
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        return;
      }
      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    });
  });

  // Active navigation link highlighting using section intersection.
  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    const navMap = new Map(navLinks.map(function (link) {
      return [link.getAttribute('href'), link];
    }));

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        const id = '#' + entry.target.id;
        navLinks.forEach(function (l) {
          l.classList.remove('active');
        });
        const current = navMap.get(id);
        if (current) {
          current.classList.add('active');
        }
      });
    }, {
      threshold: 0.55,
      rootMargin: '-15% 0px -35% 0px'
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  // Typing animation in hero section.
  if (typingText) {
    const words = [
      'practical full-stack web applications.',
      'secure and scalable Symfony backends.',
      'recruiter-friendly portfolio projects.',
      'clean user-focused web experiences.'
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeFrame() {
      const currentWord = words[wordIndex];
      const speed = deleting ? 38 : 72;

      if (!deleting) {
        charIndex += 1;
        typingText.textContent = currentWord.slice(0, charIndex);

        if (charIndex >= currentWord.length) {
          deleting = true;
          setTimeout(typeFrame, 1200);
          return;
        }
      } else {
        charIndex -= 1;
        typingText.textContent = currentWord.slice(0, charIndex);

        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      setTimeout(typeFrame, speed);
    }

    typeFrame();
  }

  // Scroll reveal for cards and section content.
  if (revealItems.length > 0) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach(function (item) {
        item.classList.add('visible');
      });
    }
  }

  // Clipboard copy for email with fallback.
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async function () {
      const email = copyEmailBtn.getAttribute('data-email') || '';
      const originalText = copyEmailBtn.textContent;
      if (!email) {
        return;
      }

      const setFeedback = function (text) {
        copyEmailBtn.textContent = text;
        setTimeout(function () {
          copyEmailBtn.textContent = originalText || 'Copy Email';
        }, 1500);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          setFeedback('Copied');
          return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        setFeedback(copied ? 'Copied' : 'Failed');
      } catch (error) {
        setFeedback('Failed');
      }
    });
  }

  // Mailto form creation for static hosting.
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const nameField = document.getElementById('name');
      const emailField = document.getElementById('email');
      const subjectField = document.getElementById('subject');
      const messageField = document.getElementById('message');
      const recipient = (copyEmailBtn && copyEmailBtn.getAttribute('data-email')) || '[your-email-here]';

      if (!nameField || !emailField || !subjectField || !messageField) {
        return;
      }

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const subject = encodeURIComponent(subjectField.value.trim());
      const body = encodeURIComponent(
        'Name: ' + nameField.value.trim() + '\n' +
        'Email: ' + emailField.value.trim() + '\n\n' +
        messageField.value.trim()
      );

      window.location.href = 'mailto:' + recipient + '?subject=' + subject + '&body=' + body;
    });
  }
})();
