const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  const navActions = document.querySelector('.nav-actions');
  const navHome = { parent: navLinks.parentNode, next: navLinks.nextSibling };
  const actionsHome = navActions ? { parent: navActions.parentNode, next: navActions.nextSibling } : null;
  let menuIsPortaled = false;

  // Fixed elements inside a blurred header are viewport-constrained on some mobile browsers.
  // Place the overlay directly under body on mobile, then restore the desktop DOM order.
  const syncMobileStructure = () => {
    const shouldPortal = window.innerWidth <= 900;
    if (shouldPortal && !menuIsPortaled) {
      document.body.append(navLinks);
      if (navActions) document.body.append(navActions);
      menuIsPortaled = true;
    } else if (!shouldPortal && menuIsPortaled) {
      navHome.parent.insertBefore(navLinks, navHome.next);
      if (navActions && actionsHome) actionsHome.parent.insertBefore(navActions, actionsHome.next);
      menuIsPortaled = false;
    }
  };
  syncMobileStructure();
  const mobileMenuItems = [...navLinks.querySelectorAll('a'), ...(navActions ? navActions.querySelectorAll('button, a') : [])];
  const setMobileMenu = (open) => {
    navLinks.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.setAttribute('aria-hidden', String(!open && window.innerWidth <= 900));
    document.body.classList.toggle('mobile-menu-open', open);
    if (open) requestAnimationFrame(() => navLinks.querySelector('a')?.focus());
  };
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'navLinks');
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    setMobileMenu(!navLinks.classList.contains('open'));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMobileMenu(false)));
  document.addEventListener('click', (event) => {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) setMobileMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      setMobileMenu(false);
      hamburger.focus();
    }
    if (event.key === 'Tab' && navLinks.classList.contains('open')) {
      const focusable = [hamburger, ...mobileMenuItems];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMobileMenu(false);
    syncMobileStructure();
    navLinks.setAttribute('aria-hidden', String(window.innerWidth <= 900 && !navLinks.classList.contains('open')));
  });
  navLinks.setAttribute('aria-hidden', String(window.innerWidth <= 900));
}

const navA = document.querySelectorAll('.nav-link');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navA.forEach(a => {
  const targetPage = a.getAttribute('href').split('/').pop();
  if (targetPage === currentPage || (currentPage === '' && targetPage === 'index.html')) {
    a.classList.add('active');
  }
});

const revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .stat-row');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}

const authOverlay = document.getElementById('authOverlay');
if (authOverlay) {
  let authRole = 'user';
  let domainVisible = false;
  function setAuthRole(role){
    authRole = role;
    document.querySelectorAll('.role-option').forEach(btn => btn.classList.toggle('active', btn.dataset.role === role));
  }
  function openAuth(type){
    authOverlay.classList.add('open');
    switchAuth(type);
    setAuthRole('user');
    hideDomainField();
    document.body.style.overflow = 'hidden';
  }
  function closeAuth(){
    authOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function switchAuth(type){
    document.getElementById('loginPanel').classList.toggle('active', type === 'login');
    document.getElementById('signupPanel').classList.toggle('active', type === 'signup');
    document.querySelectorAll('.auth-message').forEach(message => {
      message.textContent = '';
      message.className = 'auth-message';
    });
  }
  function toggleDomainField(){
    domainVisible = !domainVisible;
    document.querySelectorAll('.auth-domain-row').forEach(row => row.classList.toggle('visible', domainVisible));
  }
  function hideDomainField(){
    domainVisible = false;
    document.querySelectorAll('.auth-domain-row').forEach(row => row.classList.remove('visible'));
  }
  function selectAuthRole(role){
    setAuthRole(role);
  }
  authOverlay.addEventListener('click', (e) => { if(e.target === authOverlay) closeAuth(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeAuth(); });
  window.openAuth = openAuth;
  window.closeAuth = closeAuth;
  window.switchAuth = switchAuth;
  window.toggleDomainField = toggleDomainField;
  window.selectAuthRole = selectAuthRole;
  window.requestPasswordReset = function requestPasswordReset(){
    window.location.href = '404.html';
  };
  window.submitAuth = function submitAuth(e, type){
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"] span');
    const original = btn.textContent;
    btn.textContent = type === 'login' ? 'Logging in…' : 'Creating account…';
    setTimeout(() => {
      btn.textContent = type === 'login' ? 'Logged in ✓' : 'Account created ✓';
      setTimeout(() => {
        closeAuth();
        const target = authRole === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        window.location.href = target;
      }, 900);
      setTimeout(() => { btn.textContent = original; }, 1500);
    }, 900);
    return false;
  };
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (this.checkValidity()) window.location.href = '404.html';
    else this.reportValidity();
    return;
    const note = document.getElementById('formNote');
    note.textContent = 'Sending…';
    note.className = 'form-note';
    setTimeout(() => {
      note.textContent = 'Request received — a process engineer will reach out within one business day.';
      note.className = 'form-note success';
      this.reset();
    }, 900);
  });
}

document.querySelectorAll('.blog-newsletter-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (form.checkValidity()) window.location.href = '404.html';
    else form.reportValidity();
  });
});

document.querySelectorAll('.footer-newsletter-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (form.checkValidity()) window.location.href = '404.html';
    else form.reportValidity();
  });
});
