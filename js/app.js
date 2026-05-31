/* ============================================================
   APP.JS — Core Application Logic & Authentication
   Cyber Attack Simulation LAB
   ============================================================ */

'use strict';

/* ── Auth Guard ── */
const Auth = {
  getUser() { return Utils.storage.get('user'); },

  login(userData) {
    Utils.storage.set('user', { ...userData, loginAt: Date.now() });
  },

  logout() {
    Utils.storage.remove('user');
    window.location.href = 'index.html';
  },

  guard() {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  }
};

/* ── Auth Page Logic ── */
const AuthPage = {
  selectedRole: 'student',

  init() {
    // If already logged in, go to dashboard
    if (Auth.getUser()) {
      window.location.href = 'dashboard.html';
      return;
    }

    this.initMatrix();
    this.initParticles();
    this.initTicker();
    this.initTabs();
    this.initForms();
    this.initRoles();
    this.animateCounters();
  },

  /* ── Matrix Rain ── */
  initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]!@#$%^&*';
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = new Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00d4ff';
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = Math.random() * 0.8 + 0.2;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      ctx.globalAlpha = 1;
    };

    setInterval(draw, 50);

    window.addEventListener('resize', () => {
      cols = Math.floor(canvas.width / fontSize);
      drops = new Array(cols).fill(1);
    });
  },

  /* ── Floating Particles ── */
  initParticles() {
    const left = document.querySelector('.auth-left');
    if (!left) return;
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${Utils.randFloat(6, 14)}s`;
      p.style.animationDelay    = `${Math.random() * 10}s`;
      p.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
      p.style.width = p.style.height = `${Math.random() > 0.7 ? 4 : 2}px`;
      if (Math.random() > 0.6) p.style.background = 'var(--defense-green)';
      if (Math.random() > 0.8) p.style.background = 'var(--attack-red)';
      left.appendChild(p);
    }
  },

  /* ── Live Attack Ticker ── */
  initTicker() {
    const tickerList = document.getElementById('ticker-list');
    if (!tickerList) return;

    const renderTicker = () => {
      const attack = Utils.pickRandom(ATTACK_TYPES);
      const geo    = Utils.pickRandom(GEO_DATA);
      const colors = { red: '#ff3366', orange: '#ffaa00', blue: '#00d4ff', green: '#00ff88', purple: '#a78bfa' };

      const item = Utils.el('div', { class: 'ticker-item' }, [
        Utils.el('div', { class: 'ticker-dot', style: `background: ${colors[attack.color]}` }),
        Utils.el('span', { class: 'ticker-ip',   text: Utils.fakeIP() }),
        Utils.el('span', { class: 'ticker-type', text: attack.name }),
        Utils.el('span', { text: `→ ${geo.flag} ${geo.city}` }),
        Utils.el('span', { class: 'ticker-time', text: Utils.formatTime() })
      ]);

      tickerList.prepend(item);
      const items = tickerList.querySelectorAll('.ticker-item');
      if (items.length > 5) items[items.length - 1].remove();
    };

    renderTicker();
    setInterval(renderTicker, Utils.randInt(1500, 3000));
  },

  /* ── Animated Counters ── */
  animateCounters() {
    const targets = { 'stat-attacks': 2847, 'stat-countries': 94, 'stat-blocked': 9983 };
    Object.entries(targets).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) setTimeout(() => Utils.animateCounter(el, val, 2000), 500);
    });
  },

  /* ── Tab Switching ── */
  initTabs() {
    const tabs  = Utils.qsa('.auth-tab');
    const forms = { login: document.getElementById('login-form'), register: document.getElementById('register-form') };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;
        Object.entries(forms).forEach(([key, form]) => {
          if (!form) return;
          form.classList.toggle('visible', key === target);
        });
      });
    });
  },

  /* ── Role Selection ── */
  initRoles() {
    const opts = Utils.qsa('.role-option');
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        opts.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedRole = opt.dataset.role;
      });
    });
  },

  /* ── Form Logic ── */
  initForms() {
    this.initLoginForm();
    this.initRegisterForm();
    this.initPasswordToggle();
    this.initPasswordStrength();
  },

  initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = Utils.qs('#login-email').value.trim();
      const pass  = Utils.qs('#login-pass').value;
      const btn   = Utils.qs('#login-btn');

      if (!email || !pass) {
        Utils.toast('Error', 'Please fill in all fields', 'danger');
        return;
      }

      btn.classList.add('loading');
      btn.textContent = 'Authenticating...';

      // Simulate auth delay
      await new Promise(r => setTimeout(r, 1500));

      // Check stored users
      const users = Utils.storage.get('users', []);
      const user  = users.find(u => u.email === email && u.password === pass);

      if (user) {
        Auth.login(user);
        Utils.toast('Welcome back!', `Logged in as ${user.name}`, 'success');
        await new Promise(r => setTimeout(r, 800));
        window.location.href = 'dashboard.html';
      } else {
        btn.classList.remove('loading');
        btn.textContent = 'Access System';
        Utils.toast('Access Denied', 'Invalid credentials. Try admin@cyberlab.com / password123', 'danger');

        // Auto-create demo account hint
        if (users.length === 0) {
          Utils.storage.set('users', [{
            id: 'demo', name: 'Admin User', email: 'admin@cyberlab.com',
            password: 'password123', role: 'admin', xp: 2500, level: 12,
            joinDate: Date.now(), completedModules: [0,1,2,4,5]
          }]);
        }
      }
    });
  },

  initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name  = Utils.qs('#reg-name').value.trim();
      const email = Utils.qs('#reg-email').value.trim();
      const pass  = Utils.qs('#reg-pass').value;
      const pass2 = Utils.qs('#reg-pass2').value;
      const btn   = Utils.qs('#register-btn');

      // Validate
      if (!name || !email || !pass || !pass2) {
        Utils.toast('Error', 'Please fill in all fields', 'danger');
        return;
      }
      if (pass !== pass2) {
        Utils.toast('Error', 'Passwords do not match', 'danger');
        return;
      }
      if (pass.length < 6) {
        Utils.toast('Error', 'Password must be at least 6 characters', 'danger');
        return;
      }

      const users = Utils.storage.get('users', []);
      if (users.find(u => u.email === email)) {
        Utils.toast('Error', 'Email already registered', 'danger');
        return;
      }

      btn.classList.add('loading');
      btn.textContent = 'Creating account...';
      await new Promise(r => setTimeout(r, 1800));

      const newUser = {
        id: Date.now().toString(),
        name, email, password: pass,
        role: this.selectedRole,
        xp: 0, level: 1,
        joinDate: Date.now(),
        completedModules: []
      };

      users.push(newUser);
      Utils.storage.set('users', users);
      Auth.login(newUser);

      Utils.toast('Account Created!', `Welcome to CyberLAB, ${name}!`, 'success');
      await new Promise(r => setTimeout(r, 800));
      window.location.href = 'dashboard.html';
    });
  },

  initPasswordToggle() {
    Utils.qsa('.form-input-action[data-toggle="password"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        const isPass = target.type === 'password';
        target.type  = isPass ? 'text' : 'password';
        btn.textContent = isPass ? '🙈' : '👁️';
      });
    });
  },

  initPasswordStrength() {
    const passInput = document.getElementById('reg-pass');
    const fill      = document.getElementById('strength-fill');
    const label     = document.getElementById('strength-label');
    if (!passInput || !fill || !label) return;

    passInput.addEventListener('input', () => {
      const val = passInput.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;

      const levels = [
        { class: '', label: '' },
        { class: 'weak',   label: 'Weak' },
        { class: 'fair',   label: 'Fair' },
        { class: 'good',   label: 'Good' },
        { class: 'strong', label: 'Strong 💪' }
      ];
      const lvl = levels[strength];
      fill.className  = `strength-fill ${lvl.class}`;
      label.textContent = lvl.label;
    });
  }
};

/* ── Navigation (shared across all pages) ── */
const Nav = {
  init() {
    const user = Auth.guard();
    if (!user) return null;

    // Update user info in sidebar
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const initEl = document.getElementById('nav-user-init');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role?.toUpperCase() || 'USER';
    if (initEl) initEl.textContent = user.name.charAt(0).toUpperCase();

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Utils.toast('Goodbye', 'Logging out...', 'info', 1500);
        setTimeout(() => Auth.logout(), 1000);
      });
    }

    // Set active nav item
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    Utils.qsa('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === page);
    });

    // Animate page in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });

    return user;
  }
};

window.Auth = Auth;
window.Nav  = Nav;

/* ── Initialize correct page ── */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '') {
    AuthPage.init();
  }
  // Other pages init their own modules
});
