(() => {
  const sidebar = document.querySelector('.dashboard-sidebar nav');
  const content = document.querySelector('.dashboard-content');
  if (!sidebar || !content) return;

  const sectionLinks = [...sidebar.querySelectorAll('a[href^="#"]')];
  const sectionIds = sectionLinks.map(link => link.getAttribute('href').slice(1));
  const sectionPanels = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const overviewStats = content.querySelector('.dashboard-stat-grid');
  const splitGroups = [...content.querySelectorAll('.dashboard-split-grid')];

  const topbar = document.querySelector('.dashboard-topbar');
  const sidebarPanel = document.querySelector('.dashboard-sidebar');
  const mobileMenuButton = document.createElement('button');
  const mobileBackdrop = document.createElement('button');
  mobileMenuButton.className = 'dashboard-mobile-menu';
  mobileMenuButton.type = 'button';
  mobileMenuButton.setAttribute('aria-label', 'Open dashboard menu');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.innerHTML = '<span></span><span></span><span></span>';
  mobileBackdrop.className = 'dashboard-menu-backdrop';
  mobileBackdrop.type = 'button';
  mobileBackdrop.setAttribute('aria-label', 'Close dashboard menu');
  topbar.insertBefore(mobileMenuButton, topbar.querySelector('.dashboard-header-actions'));
  document.body.appendChild(mobileBackdrop);

  function setDashboardMenu(open) {
    sidebarPanel.classList.toggle('mobile-open', open);
    mobileMenuButton.classList.toggle('active', open);
    mobileBackdrop.classList.toggle('visible', open);
    mobileMenuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('dashboard-menu-open', open);
  }
  mobileMenuButton.addEventListener('click', () => setDashboardMenu(!sidebarPanel.classList.contains('mobile-open')));
  mobileBackdrop.addEventListener('click', () => setDashboardMenu(false));

  if (!sidebar.querySelector('.sidebar-logout')) {
    const logout = document.createElement('a');
    logout.href = 'index.html';
    logout.className = 'sidebar-logout';
    logout.textContent = 'Log out';
    sidebar.appendChild(logout);
  }

  function showSection(id, updateHash = true) {
    const target = sectionIds.includes(id) ? id : 'overview';
    sectionPanels.forEach(panel => { panel.hidden = panel.id !== target; });
    if (overviewStats) overviewStats.hidden = target !== 'overview';

    splitGroups.forEach(group => {
      const visibleChildren = [...group.children].filter(child => !child.hidden);
      group.hidden = visibleChildren.length === 0;
      group.classList.toggle('single-dashboard-panel', visibleChildren.length === 1);
    });

    sectionLinks.forEach(link => {
      const selected = link.getAttribute('href') === `#${target}`;
      link.classList.toggle('active', selected);
      link.setAttribute('aria-current', selected ? 'page' : 'false');
    });
    if (updateHash) history.replaceState(null, '', `#${target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sectionLinks.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    showSection(link.getAttribute('href').slice(1));
    setDashboardMenu(false);
  }));

  const isAdmin = document.body.classList.contains('admin-theme');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  let currentUser = { name: 'User', email: '' };
  if (!isAdmin) {
    try { currentUser = { ...currentUser, ...JSON.parse(localStorage.getItem('veloxUser') || '{}') }; } catch (error) { /* Use safe defaults. */ }
    currentUser.name = String(currentUser.name || 'User').trim();
    currentUser.email = String(currentUser.email || '').trim();
    const nameParts = currentUser.name.split(/\s+/).filter(Boolean);
    const initials = nameParts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U';
    document.querySelectorAll('[data-user-name]').forEach(element => { element.textContent = currentUser.name; });
    document.querySelectorAll('[data-user-first-name]').forEach(element => { element.textContent = nameParts[0] || 'User'; });
    document.querySelectorAll('[data-user-initials]').forEach(element => { element.textContent = initials; });
  }
  const detailContent = isAdmin ? {
    overview: [['Today\'s volume','18 production runs'],['Risk watch','2 escalations'],['Next review','16:30 operations call']],
    analytics: [['Top region','South India · 38%'],['Conversion','7.8% this month'],['Forecast','₹28.4L projected']],
    operations: [['On schedule','16 workflows'],['Cycle time','4.2 days average'],['Capacity','76% utilized']],
    approvals: [['Due today','7 requests'],['Average wait','2h 14m'],['Delegated','4 requests']],
    users: [['Active today','1,126 members'],['Invitations','18 pending'],['Retention','96.4% monthly']],
    system: [['Incidents','0 active'],['Backups','Verified 03:00'],['Security','No open alerts']]
  } : {
    overview: [['Due today','6 tasks'],['Team online','8 members'],['Recent activity','24 updates']],
    performance: [['Focus time','18.4 hours'],['Completion rate','92%'],['Best day','Thursday']],
    projects: [['Upcoming','3 milestones'],['At risk','1 project'],['Collaborators','14 active']],
    billing: [['Plan','Premium monthly'],['Payment method','Visa ending 2048'],['Next renewal','August 01, 2026']],
    documents: [['Storage','34 GB of 50 GB'],['Shared files','128 documents'],['Last backup','Today, 03:00']],
    support: [['Response target','Under 2 hours'],['Open tickets','1 request'],['Knowledge base','48 guides']]
  };

  sectionPanels.forEach(panel => {
    const items = detailContent[panel.id];
    if (!items) return;
    const grid = document.createElement('div');
    grid.className = 'dashboard-detail-grid';
    grid.innerHTML = items.map(([label, value]) => `<a href="404.html"><span>${label}</span><strong>${value}</strong><small>View details →</small></a>`).join('');
    panel.appendChild(grid);
  });

  const sidebarProfile = document.createElement('div');
  sidebarProfile.className = 'sidebar-profile-links';
  sidebarProfile.innerHTML = isAdmin
    ? '<span>Account</span><button data-profile-item="account">Admin profile</button><button data-profile-item="settings">Security settings</button>'
    : '<span>Account</span><button data-profile-item="account">My profile</button><button data-profile-item="settings">Account settings</button>';
  sidebar.insertAdjacentElement('afterend', sidebarProfile);
  const menuContent = {
    notifications: isAdmin
      ? '<div class="popover-title"><strong>Notifications</strong><span>3 new</span></div><a href="#approvals"><b>Approval required</b><small>Enterprise upgrade needs review.</small></a><a href="#system"><b>System report ready</b><small>Weekly health report is available.</small></a><a href="#operations"><b>Workflow escalated</b><small>Two items require attention.</small></a>'
      : '<div class="popover-title"><strong>Notifications</strong><span>2 new</span></div><a href="#projects"><b>Project updated</b><small>Brand system refresh reached 78%.</small></a><a href="#billing"><b>Payment confirmed</b><small>Your July invoice has been paid.</small></a>',
    profile: isAdmin
      ? '<div class="popover-profile"><span class="profile-avatar">AD</span><div><b>Administrator</b><small>admin@stackly.com</small></div></div><button data-profile-item="account">Admin profile</button><button data-profile-item="settings">Security settings</button><a href="index.html" class="popover-logout">Log out</a>'
      : `<div class="popover-profile"><span class="profile-avatar">${escapeHtml(currentUser.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U')}</span><div><b>${escapeHtml(currentUser.name)}</b><small>${escapeHtml(currentUser.email || 'Member account')}</small></div></div><button data-profile-item="account">My profile</button><button data-profile-item="settings">Account settings</button><a href="index.html" class="popover-logout">Log out</a>`
  };

  let activePopover = null;
  function closePopover() {
    if (activePopover) activePopover.remove();
    activePopover = null;
    document.querySelectorAll('[data-dashboard-action]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  }

  document.querySelectorAll('[data-dashboard-action]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const type = button.dataset.dashboardAction;
      const wasOpen = activePopover?.dataset.type === type;
      closePopover();
      if (wasOpen) return;
      activePopover = document.createElement('div');
      activePopover.className = `dashboard-popover ${type}-popover`;
      activePopover.dataset.type = type;
      activePopover.innerHTML = menuContent[type];
      document.querySelector('.dashboard-header-actions').appendChild(activePopover);
      button.setAttribute('aria-expanded', 'true');
      activePopover.addEventListener('click', popoverEvent => {
        popoverEvent.stopPropagation();
        if (popoverEvent.target.closest('[data-profile-item]')) {
          window.location.href = '404.html';
          return;
        }
        const sectionLink = popoverEvent.target.closest('a[href^="#"]');
        if (sectionLink) {
          popoverEvent.preventDefault();
          showSection(sectionLink.getAttribute('href').slice(1));
          closePopover();
        }
      });
    });
  });

  document.addEventListener('click', event => {
    const action = event.target.closest('.dashboard-content button, .sidebar-upgrade button, .sidebar-profile-links [data-profile-item]');
    if (action) window.location.href = '404.html';
  });

  document.addEventListener('click', closePopover);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closePopover(); setDashboardMenu(false); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 850) setDashboardMenu(false); });
  showSection(location.hash.slice(1) || 'overview', false);
})();
