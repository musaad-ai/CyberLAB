/* ============================================================
   LAB.JS — Simulation Lab Engine
   Cyber Attack Simulation LAB
   ============================================================ */

'use strict';

const LabPage = {
  selectedAttack: null,
  isRunning: false,
  intensity: 5,
  defenses: { firewall: false, ids: false, honeypot: false, waf: false, mfa: false, dlp: false },
  canvas: null, ctx: null,
  particles: [], animFrame: null,

  init() {
    const user = Nav.init();
    if (!user) return;
    this.initCanvas();
    this.initAttackTypes();
    this.initIntensitySlider();
    this.initDefenseToggles();
    this.initLaunchBtn();
    this.renderSteps([]);
  },

  initCanvas() {
    this.canvas = document.getElementById('lab-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.drawIdle();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  },

  drawIdle() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Center text
    ctx.fillStyle = 'rgba(139,148,158,0.4)';
    ctx.font = '14px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ Select an attack type and click Launch ]', W / 2, H / 2);
  },

  initAttackTypes() {
    const labAttacks = [
      { id: 'ddos',      name: 'DDoS', icon: '💥', sev: 'Critical' },
      { id: 'sql',       name: 'SQL Injection', icon: '🗄️', sev: 'High' },
      { id: 'phishing',  name: 'Phishing', icon: '🎣', sev: 'High' },
      { id: 'brute',     name: 'Brute Force', icon: '🔨', sev: 'Medium' },
      { id: 'mitm',      name: 'MITM', icon: '👤', sev: 'Critical' },
      { id: 'ransomware',name: 'Ransomware', icon: '🔐', sev: 'Critical' },
    ];

    const grid = document.getElementById('attack-type-grid');
    if (!grid) return;

    labAttacks.forEach(a => {
      const btn = Utils.el('button', { class: 'attack-type-btn', id: `atype-${a.id}` }, [
        Utils.el('span', { class: 'attack-type-icon', text: a.icon }),
        Utils.el('div', { class: 'attack-type-name', text: a.name }),
        Utils.el('div', { class: 'attack-type-severity', text: `Severity: ${a.sev}` })
      ]);

      btn.addEventListener('click', () => {
        Utils.qsa('.attack-type-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedAttack = a;
        document.getElementById('launch-btn-text').textContent = `Launch ${a.name}`;
      });

      grid.appendChild(btn);
    });
  },

  initIntensitySlider() {
    const slider   = document.getElementById('intensity-slider');
    const fill     = document.getElementById('intensity-fill');
    const label    = document.getElementById('intensity-value');
    if (!slider) return;

    const update = () => {
      this.intensity = parseInt(slider.value);
      fill.style.width = (this.intensity * 10) + '%';
      label.textContent = `${this.intensity}/10`;
      label.style.color = this.intensity <= 3 ? 'var(--defense-green)' :
                           this.intensity <= 6 ? 'var(--warning-orange)' : 'var(--attack-red)';
    };

    slider.addEventListener('input', update);
    update();
  },

  initDefenseToggles() {
    Object.keys(this.defenses).forEach(key => {
      const toggle = document.getElementById(`defense-${key}`);
      if (!toggle) return;
      toggle.addEventListener('click', () => {
        this.defenses[key] = !this.defenses[key];
        toggle.classList.toggle('on', this.defenses[key]);
        const parent = toggle.closest('.defense-toggle');
        if (parent) parent.classList.toggle('enabled', this.defenses[key]);

        if (this.defenses[key]) {
          Utils.toast(`Defense Activated`, `${key.toUpperCase()} is now protecting your system`, 'success', 2500);
        }
      });
    });
  },

  initLaunchBtn() {
    const btn = document.getElementById('launch-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (!this.selectedAttack) {
        Utils.toast('No Attack Selected', 'Please select an attack type first', 'warning');
        return;
      }
      if (this.isRunning) {
        this.stopAttack();
      } else {
        this.launchAttack();
      }
    });
  },

  async launchAttack() {
    this.isRunning = true;
    const btn = document.getElementById('launch-btn');
    const btnText = document.getElementById('launch-btn-text');
    if (btn)     btn.classList.add('running');
    if (btnText) btnText.textContent = '⏹ Stop Attack';

    Utils.toast(`🚨 Attack Launched`, `${this.selectedAttack.name} at intensity ${this.intensity}/10`, 'danger', 3000);

    const steps = this.getAttackSteps(this.selectedAttack.id);
    this.renderSteps(steps);
    this.startVisualization();

    // Execute steps
    for (let i = 0; i < steps.length; i++) {
      if (!this.isRunning) break;
      await new Promise(r => setTimeout(r, steps[i].delay || 800));
      this.activateStep(i);

      // Check defenses
      if (this.isDefenseActive(steps[i].defense) && Math.random() > 0.4) {
        await new Promise(r => setTimeout(r, 600));
        this.blockStep(i);
        Utils.toast('🛡️ Attack Blocked!', `${steps[i].defense?.toUpperCase()} stopped the attack`, 'success');
        break;
      }
    }

    if (this.isRunning) {
      await new Promise(r => setTimeout(r, 1000));
      const defenseCount = Object.values(this.defenses).filter(Boolean).length;
      if (defenseCount >= 3) {
        Utils.toast('✅ Attack Mitigated', 'Strong defenses blocked the attack!', 'success');
      } else {
        Utils.toast('💀 Attack Successful', 'System compromised! Enable more defenses.', 'danger', 5000);
      }
    }

    this.stopAttack();
  },

  stopAttack() {
    this.isRunning = false;
    const btn = document.getElementById('launch-btn');
    const btnText = document.getElementById('launch-btn-text');
    if (btn) btn.classList.remove('running');
    if (btnText) btnText.textContent = this.selectedAttack ? `Launch ${this.selectedAttack.name}` : 'Select Attack Type';
    if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
    setTimeout(() => this.drawIdle(), 2000);
  },

  isDefenseActive(defense) {
    if (!defense) return false;
    return this.defenses[defense] === true;
  },

  getAttackSteps(id) {
    const stepsMap = {
      ddos: [
        { title: 'Target Discovery',       desc: 'Identifying target IP and open ports',         icon: '🔍', delay: 700,  defense: null },
        { title: 'Botnet Activation',       desc: 'Activating 50,000 bot nodes worldwide',        icon: '🤖', delay: 900,  defense: 'firewall' },
        { title: 'Traffic Amplification',   desc: 'UDP flood — 100Gbps traffic generated',        icon: '📡', delay: 800,  defense: 'ids' },
        { title: 'Server Overload',         desc: 'Target CPU at 100% — service degraded',        icon: '💥', delay: 1000, defense: null },
        { title: 'Service Disruption',      desc: 'Website DOWN — 0% availability',               icon: '💀', delay: 800,  defense: null },
      ],
      sql: [
        { title: 'Input Field Discovery',   desc: 'Scanning for injectable parameters',           icon: '🔍', delay: 600,  defense: 'waf' },
        { title: 'Payload Crafting',        desc: "Building: ' OR '1'='1 -- payload",             icon: '💉', delay: 700,  defense: 'waf' },
        { title: 'Authentication Bypass',   desc: 'Injecting payload into login form',            icon: '🔓', delay: 800,  defense: 'ids' },
        { title: 'Database Enumeration',    desc: 'UNION SELECT dumping table names',             icon: '🗃️', delay: 900,  defense: null },
        { title: 'Data Exfiltration',       desc: 'Downloading 50,000 user records',             icon: '📤', delay: 1000, defense: 'dlp' },
      ],
      phishing: [
        { title: 'Target Research (OSINT)', desc: 'Gathering email addresses and employee info', icon: '🔎', delay: 700,  defense: null },
        { title: 'Fake Domain Setup',       desc: 'Registering: secure-bank-login.xyz',           icon: '🌐', delay: 600,  defense: null },
        { title: 'Email Campaign',          desc: 'Sending 10,000 phishing emails',              icon: '📧', delay: 900,  defense: 'ids' },
        { title: 'Credential Harvest',      desc: 'Victims submitting credentials',              icon: '🎣', delay: 1000, defense: 'mfa' },
        { title: 'Account Takeover',        desc: 'Logging into victim accounts',                icon: '💀', delay: 800,  defense: 'mfa' },
      ],
      brute: [
        { title: 'Service Identification',  desc: 'SSH on port 22 — target confirmed',           icon: '🔍', delay: 500,  defense: 'firewall' },
        { title: 'Wordlist Preparation',    desc: 'Loading rockyou.txt — 14M passwords',         icon: '📚', delay: 600,  defense: null },
        { title: 'Attack Initiation',       desc: 'Hydra launching 50 parallel threads',         icon: '🔨', delay: 800,  defense: 'ids' },
        { title: 'Password Found',          desc: 'Credentials found: admin:password123',        icon: '🔑', delay: 1200, defense: 'mfa' },
        { title: 'Remote Access Gained',    desc: 'SSH session established as root',             icon: '💀', delay: 700,  defense: null },
      ],
      mitm: [
        { title: 'ARP Poisoning',           desc: 'Sending fake ARP replies to gateway',         icon: '☠️', delay: 600,  defense: 'firewall' },
        { title: 'Traffic Interception',    desc: 'Routing all traffic through attacker',        icon: '👤', delay: 700,  defense: 'ids' },
        { title: 'SSL Stripping',           desc: 'Downgrading HTTPS to HTTP',                   icon: '🔓', delay: 800,  defense: null },
        { title: 'Credential Capture',      desc: 'Reading plaintext login data',               icon: '📋', delay: 900,  defense: 'waf' },
        { title: 'Session Hijacking',       desc: 'Taking over authenticated sessions',          icon: '💀', delay: 700,  defense: null },
      ],
      ransomware: [
        { title: 'Initial Infection',       desc: 'Malicious macro in Word document',            icon: '📄', delay: 700,  defense: 'ids' },
        { title: 'Privilege Escalation',    desc: 'Exploiting UAC bypass for SYSTEM rights',    icon: '⬆️', delay: 900,  defense: null },
        { title: 'Shadow Copy Deletion',    desc: 'vssadmin delete shadows — backups gone',     icon: '🗑️', delay: 800,  defense: null },
        { title: 'File Encryption',         desc: 'AES-256 encrypting 847,293 files',           icon: '🔐', delay: 1200, defense: 'dlp' },
        { title: 'Ransom Note Deployed',    desc: 'README_DECRYPT.txt dropped — $500K BTC',     icon: '💀', delay: 700,  defense: null },
      ]
    };
    return stepsMap[id] || [];
  },

  renderSteps(steps) {
    const list = document.getElementById('steps-list');
    if (!list) return;

    if (steps.length === 0) {
      list.innerHTML = '<p class="text-secondary text-sm" style="padding:24px">Select an attack type and launch to see execution steps.</p>';
      return;
    }

    list.innerHTML = steps.map((step, i) => `
      <div class="step-item" id="step-${i}">
        <div class="step-num">${i + 1}</div>
        <div class="step-content">
          <div class="step-title">${step.icon} ${step.title}</div>
          <div class="step-desc">${step.desc}</div>
        </div>
      </div>
    `).join('');
  },

  activateStep(i) {
    const el = document.getElementById(`step-${i}`);
    if (el) el.classList.add('active');
    if (i > 0) {
      const prev = document.getElementById(`step-${i - 1}`);
      if (prev) { prev.classList.remove('active'); prev.classList.add('completed'); }
    }
  },

  blockStep(i) {
    const el = document.getElementById(`step-${i}`);
    if (el) { el.classList.remove('active'); el.classList.add('error'); }
  },

  /* ── Canvas Attack Visualization ── */
  startVisualization() {
    if (!this.ctx) return;
    this.particles = [];
    this.isRunning = true;

    const W = this.canvas.width;
    const H = this.canvas.height;

    // Attacker node (left)
    const attacker = { x: W * 0.15, y: H * 0.5 };
    // Target node (right)
    const target   = { x: W * 0.85, y: H * 0.5 };

    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: attacker.x + Utils.randFloat(-20, 20),
        y: attacker.y + Utils.randFloat(-50, 50),
        tx: target.x + Utils.randFloat(-20, 20),
        ty: target.y + Utils.randFloat(-50, 50),
        progress: Math.random(),
        speed: Utils.randFloat(0.003, 0.012),
        color: `hsl(${Utils.randInt(0, 30)}, 100%, 60%)`,
        size: Utils.randFloat(2, 5)
      });
    }

    const animate = () => {
      if (!this.isRunning) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Attacker node
      ctx.beginPath();
      ctx.arc(attacker.x, attacker.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,51,102,0.2)';
      ctx.fill();
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ff3366';
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💻', attacker.x, attacker.y);
      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = '#ff3366';
      ctx.fillText('ATTACKER', attacker.x, attacker.y + 42);

      // Target node
      const defActive = Object.values(this.defenses).filter(Boolean).length;
      const targetColor = defActive >= 3 ? '#00ff88' : defActive >= 1 ? '#ffaa00' : '#ff3366';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = targetColor + '33';
      ctx.fill();
      ctx.strokeStyle = targetColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText(defActive >= 3 ? '🛡️' : '🖥️', target.x, target.y);
      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = targetColor;
      ctx.fillText('TARGET', target.x, target.y + 42);

      // Particles
      this.particles.forEach(p => {
        p.progress += p.speed * (this.intensity / 5);
        if (p.progress >= 1) p.progress = 0;

        const x = p.x + (p.tx - p.x) * p.progress;
        const y = p.y + (p.ty - p.y) * p.progress + Math.sin(p.progress * Math.PI) * Utils.randFloat(-10, 10);

        ctx.beginPath();
        ctx.arc(x, y, p.size * (1 - Math.abs(p.progress - 0.5)), 0, Math.PI * 2);
        ctx.fillStyle = this.defenses.firewall && p.progress > 0.45 && p.progress < 0.55
          ? 'rgba(0,255,136,0.6)' : p.color;
        ctx.fill();
      });

      // Firewall barrier
      if (this.defenses.firewall) {
        const bx = W * 0.5;
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(bx, 20);
        ctx.lineTo(bx, H - 20);
        ctx.strokeStyle = 'rgba(0,255,136,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 FIREWALL', bx, 15);
      }

      this.animFrame = requestAnimationFrame(animate);
    };

    animate();
  }
};

/* ── Analytics Page ── */
const AnalyticsPage = {
  init() {
    const user = Nav.init();
    if (!user) return;
    this.initCharts();
    this.initHeatmap();
  },

  initCharts() {
    // Attacks over week
    const weekCanvas = document.getElementById('week-chart');
    if (weekCanvas && window.Chart) {
      const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data  = days.map(() => Utils.randInt(50, 400));
      new Chart(weekCanvas, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Attacks',
            data,
            backgroundColor: data.map(v => v > 300 ? 'rgba(255,51,102,0.7)' : v > 150 ? 'rgba(255,170,0,0.7)' : 'rgba(0,212,255,0.7)'),
            borderColor: data.map(v => v > 300 ? '#ff3366' : v > 150 ? '#ffaa00' : '#00d4ff'),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#161b22', titleColor: '#e6edf3', bodyColor: '#8b949e' } },
          scales: {
            x: { ticks: { color: '#484f58', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#484f58', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
          }
        }
      });
    }

    // Attack types radar
    const radarCanvas = document.getElementById('radar-chart');
    if (radarCanvas && window.Chart) {
      new Chart(radarCanvas, {
        type: 'radar',
        data: {
          labels: ['DDoS', 'SQL Inj.', 'Phishing', 'Ransomware', 'Brute Force', 'MITM'],
          datasets: [{
            label: 'Attack Frequency',
            data: [85, 65, 78, 52, 60, 45],
            backgroundColor: 'rgba(0,212,255,0.15)',
            borderColor: '#00d4ff', borderWidth: 2,
            pointBackgroundColor: '#00d4ff'
          },{
            label: 'Defense Rate',
            data: [70, 80, 60, 45, 85, 75],
            backgroundColor: 'rgba(0,255,136,0.1)',
            borderColor: '#00ff88', borderWidth: 2,
            pointBackgroundColor: '#00ff88'
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#8b949e', font: { family: 'JetBrains Mono', size: 10 } } } },
          scales: {
            r: {
              ticks: { color: '#484f58', backdropColor: 'transparent', font: { size: 9 } },
              grid:  { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: '#8b949e', font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });
    }

    // Severity pie
    const pieCanvas = document.getElementById('severity-chart');
    if (pieCanvas && window.Chart) {
      new Chart(pieCanvas, {
        type: 'pie',
        data: {
          labels: ['Critical', 'High', 'Medium', 'Low'],
          datasets: [{
            data: [22, 35, 28, 15],
            backgroundColor: ['rgba(255,51,102,0.8)', 'rgba(255,170,0,0.8)', 'rgba(0,212,255,0.8)', 'rgba(0,255,136,0.8)'],
            borderColor: ['#ff3366', '#ffaa00', '#00d4ff', '#00ff88'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#8b949e', font: { family: 'JetBrains Mono', size: 10 }, padding: 12 } }
          }
        }
      });
    }
  },

  initHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const level = Math.random() > 0.6 ? Utils.randInt(1, 4) : 0;
        cell.setAttribute('data-level', level);
        cell.title = `Day ${day + 1}, Hour ${hour}:00 — ${level === 0 ? 'No attacks' : level === 1 ? 'Low activity' : level === 2 ? 'Medium' : level === 3 ? 'High' : 'Critical'}`;
        grid.appendChild(cell);
      }
    }
  }
};

/* ── Profile Page ── */
const ProfilePage = {
  init() {
    const user = Nav.init();
    if (!user) return;
    this.renderProfile(user);
    this.renderBadges(user);
  },

  renderProfile(user) {
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const initEl = document.getElementById('profile-init');
    const xpEl   = document.getElementById('profile-xp');
    const lvlEl  = document.getElementById('profile-level');
    const lvlBadge = document.getElementById('profile-level-badge');
    const xpBar  = document.getElementById('profile-xp-bar');
    const joinEl = document.getElementById('profile-join');

    const level = Math.floor((user.xp || 0) / 250) + 1;
    const xpInLevel = (user.xp || 0) % 250;
    const pct = Math.round((xpInLevel / 250) * 100);

    if (nameEl)    nameEl.textContent = user.name;
    if (roleEl)    roleEl.textContent = user.role?.toUpperCase() || 'STUDENT';
    if (initEl)    initEl.textContent = user.name.charAt(0).toUpperCase();
    if (xpEl)      xpEl.textContent = (user.xp || 0).toLocaleString();
    if (lvlEl)     lvlEl.textContent = `Level ${level}`;
    if (lvlBadge)  lvlBadge.textContent = level;
    if (xpBar)     xpBar.style.width = pct + '%';
    if (joinEl)    joinEl.textContent = Utils.formatDate(new Date(user.joinDate || Date.now()));

    const progress = Utils.storage.get('progress', {});
    const doneEl = document.getElementById('profile-modules');
    if (doneEl) doneEl.textContent = Object.keys(progress).filter(k => progress[k]).length;

    const rankEl = document.getElementById('profile-rank');
    if (rankEl) rankEl.textContent = level >= 10 ? 'Expert' : level >= 5 ? 'Advanced' : level >= 3 ? 'Intermediate' : 'Beginner';

    // XP labels
    const xpCurEl = document.getElementById('xp-current');
    const xpMaxEl = document.getElementById('xp-max');
    if (xpCurEl) xpCurEl.textContent = xpInLevel + ' XP';
    if (xpMaxEl) xpMaxEl.textContent = `250 XP (Level ${level + 1})`;

    // Animate stats
    ['profile-xp', 'profile-modules'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const target = parseInt(el.textContent);
        el.textContent = '0';
        setTimeout(() => Utils.animateCounter(el, target, 1200), 400);
      }
    });
  },

  renderBadges(user) {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;

    const badges = [
      { name: 'First Login', icon: '🎯', earned: true },
      { name: 'Cyber Rookie', icon: '🌱', earned: (user.xp || 0) >= 50 },
      { name: 'SQL Slayer', icon: '💉', earned: (user.xp || 0) >= 120 },
      { name: 'Malware Hunter', icon: '🦠', earned: (user.xp || 0) >= 200 },
      { name: 'Lab Rat', icon: '🧪', earned: false },
      { name: 'Quiz Master', icon: '🧠', earned: false },
      { name: 'Patch Tuesday', icon: '🔄', earned: false },
      { name: 'Zero Day', icon: '0️⃣', earned: false },
      { name: 'Red Team', icon: '🔴', earned: false },
      { name: 'Blue Team', icon: '🔵', earned: false },
      { name: 'Legend', icon: '🏆', earned: false },
      { name: 'APT Hunter', icon: '🎭', earned: false },
    ];

    grid.innerHTML = badges.map(b => `
      <div class="badge-card ${b.earned ? 'earned' : 'locked'}">
        <div class="badge-icon-wrap">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        ${b.earned ? '<div style="font-size:10px;color:var(--warning-orange);margin-top:4px">✓ Earned</div>' : ''}
      </div>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();
  if (page === 'lab.html')       LabPage.init();
  if (page === 'analytics.html') AnalyticsPage.init();
  if (page === 'profile.html')   ProfilePage.init();
});
