/* ============================================================
   DASHBOARD.JS — Live Attack Simulation Engine
   Cyber Attack Simulation LAB
   ============================================================ */

'use strict';

const Dashboard = {
  attackCount:   0,
  blockedCount:  0,
  activeThreats: 0,
  totalPackets:  0,
  chartInstance: null,
  lineChart:     null,
  attackHistory: [],
  feedInterval:  null,
  originMarkers: [],

  /* ── Boot ── */
  init() {
    const user = Nav.init();
    if (!user) return;

    this.attackCount  = Utils.randInt(800, 2400);
    this.blockedCount = Math.floor(this.attackCount * Utils.randFloat(0.7, 0.92));
    this.activeThreats = Utils.randInt(3, 18);
    this.totalPackets  = Utils.randInt(50000, 900000);

    this.renderStats();
    this.renderTopBar();
    this.initDonutChart();
    this.initLineChart();
    this.initWorldMap();
    this.initFeed();
    this.initSystemGauges();
    this.initThreatIntel();
    this.initTopAttacks();
    this.startLiveUpdates();

    // Welcome toast
    const user2 = Auth.getUser();
    setTimeout(() => Utils.toast('System Online', `Welcome back, ${user2.name}. Monitoring active.`, 'success'), 800);
  },

  /* ── Stats ── */
  renderStats() {
    const stats = [
      { id: 'stat-total',    val: this.attackCount,           suffix: '' },
      { id: 'stat-blocked',  val: this.blockedCount,          suffix: '' },
      { id: 'stat-active',   val: this.activeThreats,         suffix: '' },
      { id: 'stat-packets',  val: this.totalPackets,          suffix: '' },
      { id: 'stat-severity', val: Utils.randInt(60, 95),      suffix: '%' },
    ];
    stats.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) Utils.animateCounter(el, s.val, 1800, '', s.suffix);
    });

    const rateEl = document.getElementById('stat-rate');
    if (rateEl) {
      let rate = Utils.randFloat(2.4, 12.8);
      rateEl.textContent = rate.toFixed(1);
      setInterval(() => {
        rate = Utils.clamp(rate + Utils.randFloat(-0.5, 0.5), 0.5, 20);
        rateEl.textContent = rate.toFixed(1);
      }, 2000);
    }
  },

  /* ── Top bar clock ── */
  renderTopBar() {
    const el = document.getElementById('topbar-time');
    if (!el) return;
    const tick = () => el.textContent = Utils.formatTime();
    tick();
    setInterval(tick, 1000);
  },

  /* ── Donut Chart (attack types) ── */
  initDonutChart() {
    const canvas = document.getElementById('donut-chart');
    if (!canvas || !window.Chart) return;

    const data = {
      labels: ['DDoS', 'SQL Injection', 'Phishing', 'Brute Force', 'Ransomware', 'XSS', 'Other'],
      values: [28, 19, 17, 12, 10, 8, 6],
      colors: ['#ff3366','#ffaa00','#00d4ff','#7c3aed','#ff6b35','#00ff88','#8b949e']
    };

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: data.colors.map(c => c + '99'),
          borderColor: data.colors,
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#8b949e',
              font: { size: 11, family: 'JetBrains Mono' },
              boxWidth: 12,
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            borderWidth: 1,
            titleColor: '#e6edf3',
            bodyColor: '#8b949e',
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw}%`
            }
          }
        }
      }
    });
  },

  /* ── Line Chart (attacks over time) ── */
  initLineChart() {
    const canvas = document.getElementById('line-chart');
    if (!canvas || !window.Chart) return;

    const labels = [];
    const attacks = [];
    const blocked = [];

    for (let i = 23; i >= 0; i--) {
      const d = new Date(Date.now() - i * 3600000);
      labels.push(d.getHours().toString().padStart(2, '0') + ':00');
      const a = Utils.randInt(20, 180);
      attacks.push(a);
      blocked.push(Math.floor(a * Utils.randFloat(0.6, 0.95)));
    }

    this.lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Attacks',
            data: attacks,
            borderColor: '#ff3366',
            backgroundColor: 'rgba(255,51,102,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: 'Blocked',
            data: blocked,
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0,255,136,0.06)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#8b949e', font: { size: 11, family: 'JetBrains Mono' }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: '#161b22', borderColor: '#21262d', borderWidth: 1,
            titleColor: '#e6edf3', bodyColor: '#8b949e'
          }
        },
        scales: {
          x: {
            ticks: { color: '#484f58', font: { size: 10, family: 'JetBrains Mono' }, maxTicksLimit: 8 },
            grid:  { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            ticks: { color: '#484f58', font: { size: 10, family: 'JetBrains Mono' } },
            grid:  { color: 'rgba(255,255,255,0.04)' }
          }
        }
      }
    });

    // Live update chart
    setInterval(() => {
      const chart = this.lineChart;
      if (!chart) return;
      chart.data.labels.shift();
      chart.data.labels.push(Utils.formatTime().slice(0, 5));
      const a = Utils.randInt(20, 180);
      chart.data.datasets[0].data.shift(); chart.data.datasets[0].data.push(a);
      chart.data.datasets[1].data.shift(); chart.data.datasets[1].data.push(Math.floor(a * 0.8));
      chart.update('none');
    }, 5000);
  },

  /* ── World Map ── */
  initWorldMap() {
    const mapWrap = document.getElementById('map-wrap');
    if (!mapWrap) return;

    const addOrigin = () => {
      const geo = Utils.pickRandom(GEO_DATA);
      const dot = document.createElement('div');
      dot.className = 'attack-origin';
      dot.style.left = geo.x + '%';
      dot.style.top  = geo.y + '%';
      dot.title = `${geo.flag} ${geo.city}, ${geo.country}`;
      mapWrap.appendChild(dot);
      this.originMarkers.push(dot);

      // Draw line to center (target)
      const line = document.createElement('div');
      line.className = 'attack-line';
      const cx = 50, cy = 50;
      const dx = cx - geo.x, dy = cy - geo.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      line.style.left   = geo.x + '%';
      line.style.top    = geo.y + '%';
      line.style.width  = len * 5 + 'px';
      line.style.setProperty('--angle', angle + 'deg');
      line.style.transform = `rotate(${angle}deg)`;
      mapWrap.appendChild(line);
      setTimeout(() => line.remove(), 1200);

      // Limit dots
      if (this.originMarkers.length > 20) {
        this.originMarkers[0].remove();
        this.originMarkers.shift();
      }
    };

    // Initial markers
    for (let i = 0; i < 8; i++) setTimeout(() => addOrigin(), i * 200);
    setInterval(addOrigin, 1500);
  },

  /* ── Live Attack Feed ── */
  initFeed() {
    const feed = document.getElementById('attack-feed');
    if (!feed) return;

    const addFeedItem = (isNew = false) => {
      const attack = Utils.pickRandom(ATTACK_TYPES);
      const geo    = Utils.pickRandom(GEO_DATA);
      const status = Utils.pickRandom(STATUSES);
      const target = Utils.fakeIP();

      const item = Utils.el('div', { class: `feed-item${isNew ? ' new' : ''}` }, [
        Utils.el('div', { class: `feed-severity ${attack.severity}` }),
        Utils.el('span', { class: 'feed-type',   text: attack.name }),
        Utils.el('span', { class: 'feed-source', text: `${geo.flag} ${Utils.fakeIP()}` }),
        Utils.el('span', { class: 'feed-target', text: `→ ${target}` }),
        Utils.el('span', { class: 'feed-status' }, [
          Utils.el('span', { class: `badge ${status.class}`, text: status.label })
        ]),
        Utils.el('span', { class: 'feed-time',  text: Utils.formatTime() })
      ]);

      feed.prepend(item);
      const items = feed.querySelectorAll('.feed-item');
      if (items.length > 60) items[items.length - 1].remove();

      // Update counters
      this.attackCount++;
      if (status.label === 'BLOCKED' || status.label === 'MITIGATED') this.blockedCount++;
      if (status.label === 'ACTIVE') this.activeThreats++;

      if (isNew) {
        const totalEl = document.getElementById('stat-total');
        const activeEl = document.getElementById('stat-active');
        if (totalEl) totalEl.textContent = this.attackCount.toLocaleString();
        if (activeEl) activeEl.textContent = this.activeThreats;

        // Occasionally fire a critical toast
        if (attack.severity === 'critical' && Math.random() > 0.7) {
          Utils.toast(`🚨 ${attack.name}`, `${geo.flag} ${geo.city} → ${target}`, 'danger', 3000);
        }
      }
    };

    // Initial items
    for (let i = 0; i < 20; i++) addFeedItem(false);

    // Live updates
    this.feedInterval = setInterval(() => {
      addFeedItem(true);
    }, Utils.randInt(800, 2200));

    // Re-randomize interval
    setInterval(() => {
      clearInterval(this.feedInterval);
      this.feedInterval = setInterval(() => addFeedItem(true), Utils.randInt(600, 2500));
    }, 10000);
  },

  /* ── System Gauges ── */
  initSystemGauges() {
    const gauges = [
      { id: 'gauge-cpu',  fill: 'gauge-fill cpu',  val: Utils.randInt(30, 85) },
      { id: 'gauge-mem',  fill: 'gauge-fill mem',  val: Utils.randInt(40, 75) },
      { id: 'gauge-net',  fill: 'gauge-fill net',  val: Utils.randInt(20, 60) },
      { id: 'gauge-disk', fill: 'gauge-fill disk', val: Utils.randInt(15, 50) },
    ];

    gauges.forEach(g => {
      const bar  = document.getElementById(g.id);
      const valEl = document.getElementById(g.id + '-val');
      if (!bar || !valEl) return;

      bar.style.width = g.val + '%';
      valEl.textContent = g.val + '%';
      if (g.val > 80) valEl.style.color = 'var(--attack-red)';
      else if (g.val > 60) valEl.style.color = 'var(--warning-orange)';
      else valEl.style.color = 'var(--defense-green)';

      // Live updates
      setInterval(() => {
        g.val = Utils.clamp(g.val + Utils.randInt(-5, 5), 5, 95);
        bar.style.width = g.val + '%';
        valEl.textContent = g.val + '%';
        if (g.val > 80) valEl.style.color = 'var(--attack-red)';
        else if (g.val > 60) valEl.style.color = 'var(--warning-orange)';
        else valEl.style.color = 'var(--defense-green)';
      }, 3000);
    });
  },

  /* ── Threat Intelligence Feed ── */
  initThreatIntel() {
    const list = document.getElementById('threat-intel-list');
    if (!list) return;

    const items = [
      { icon: '🔴', title: 'APT-41 Campaign Active', desc: 'Chinese nation-state actor targeting healthcare orgs', badge: 'critical', src: 'CISA' },
      { icon: '🟠', title: 'New Ransomware Variant', desc: 'LockBit 4.0 exploiting unpatched Exchange servers', badge: 'high', src: 'FBI' },
      { icon: '🟡', title: 'Log4Shell Still Exploited', desc: '32% of orgs still vulnerable to CVE-2021-44228', badge: 'medium', src: 'NIST' },
      { icon: '🔵', title: 'Phishing Campaign Wave', desc: 'Mass email campaign impersonating major banks', badge: 'high', src: 'Cisco' },
      { icon: '🔴', title: 'Zero-Day in Chrome', desc: 'V8 engine vulnerability actively exploited in wild', badge: 'critical', src: 'Google' },
      { icon: '🟠', title: 'Supply Chain Attack', desc: 'Compromised npm package with 1M+ weekly downloads', badge: 'high', src: 'GitHub' },
    ];

    items.forEach(item => {
      const badgeClass = { critical: 'badge-red', high: 'badge-orange', medium: 'badge-blue' }[item.badge] || 'badge-gray';
      const el = Utils.el('div', { class: 'threat-intel-item' }, [
        Utils.el('span', { class: 'intel-icon', text: item.icon }),
        Utils.el('div', { class: 'intel-content' }, [
          Utils.el('div', { class: 'intel-title', text: item.title }),
          Utils.el('div', { class: 'intel-desc',  text: item.desc }),
          Utils.el('div', { class: 'intel-meta' }, [
            Utils.el('span', { class: `badge ${badgeClass}`, text: item.badge }),
            Utils.el('span', { class: 'badge badge-gray', text: `📡 ${item.src}` })
          ])
        ])
      ]);
      list.appendChild(el);
    });
  },

  /* ── Top Attacks Bar Chart ── */
  initTopAttacks() {
    const list = document.getElementById('top-attacks-list');
    if (!list) return;

    const attackData = [
      { name: 'DDoS Attack',         count: 1284, pct: 100 },
      { name: 'SQL Injection',        count: 867,  pct: 67  },
      { name: 'Phishing',             count: 743,  pct: 58  },
      { name: 'Brute Force',          count: 521,  pct: 41  },
      { name: 'Ransomware',           count: 398,  pct: 31  },
      { name: 'Man-in-the-Middle',    count: 267,  pct: 21  },
    ];

    attackData.forEach((a, i) => {
      const el = Utils.el('div', { class: 'attack-bar-item' }, [
        Utils.el('div', { class: 'attack-bar-header' }, [
          Utils.el('span', { class: 'attack-bar-name', text: a.name }),
          Utils.el('span', { class: 'attack-bar-count', text: a.count.toLocaleString() })
        ]),
        Utils.el('div', { class: 'attack-bar-track' }, [
          Utils.el('div', { class: 'attack-bar-fill', style: 'width:0%', id: `bar-${i}` })
        ])
      ]);
      list.appendChild(el);

      setTimeout(() => {
        const fill = document.getElementById(`bar-${i}`);
        if (fill) fill.style.width = a.pct + '%';
      }, 300 + i * 100);
    });
  },

  /* ── Start All Live Updates ── */
  startLiveUpdates() {
    // Alert badge counter
    let alertCount = Utils.randInt(3, 12);
    const badge = document.getElementById('alert-badge');
    if (badge) {
      badge.textContent = alertCount;
      setInterval(() => {
        if (Math.random() > 0.7) {
          alertCount++;
          badge.textContent = alertCount;
        }
      }, 5000);
    }

    // Recent alerts list
    const alertsList = document.getElementById('alerts-list');
    if (alertsList) {
      const addAlert = () => {
        const attack = Utils.pickRandom(ATTACK_TYPES);
        const geo    = Utils.pickRandom(GEO_DATA);
        const sevColors = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };
        const sevClass  = sevColors[attack.severity] || 'medium';
        const icons     = { critical: '🚨', high: '⚠️', medium: 'ℹ️', low: '📋' };

        const el = Utils.el('div', { class: 'alert-item' }, [
          Utils.el('div', { class: `alert-icon ${sevClass}`, text: icons[attack.severity] }),
          Utils.el('div', { class: 'alert-content' }, [
            Utils.el('div', { class: 'alert-title', text: `${attack.name} Detected` }),
            Utils.el('div', { class: 'alert-desc', text: `${geo.flag} ${Utils.fakeIP()} → ${Utils.fakeIP()} [Port ${attack.port}]` })
          ]),
          Utils.el('div', { class: 'alert-time', text: Utils.formatTime() })
        ]);

        alertsList.prepend(el);
        const all = alertsList.querySelectorAll('.alert-item');
        if (all.length > 15) all[all.length - 1].remove();
      };

      for (let i = 0; i < 8; i++) addAlert();
      setInterval(addAlert, 4000);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Dashboard.init();
});
