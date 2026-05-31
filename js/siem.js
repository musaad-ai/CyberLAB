'use strict';

const SIEM = {
  paused: false,
  logs: [],
  counts: { critical:0, high:0, medium:0, low:0, info:0, total:0 },
  agentCounts: { kali:0, windows:0, ubuntu:0, wazuh:0 },
  ruleCounts: {},
  activeAlerts: [],
  correlations: [],
  filterLevel: 'all',
  filterAgent: 'all',
  timelineData: new Array(20).fill(0),
  chart: null,
  interval: null,

  RULES: [
    { id:'1002',  lvl:'high',     name:'Unknown problem somewhere in the system' },
    { id:'2502',  lvl:'medium',   name:'User login failed' },
    { id:'2503',  lvl:'high',     name:'User missed the password more than 6 times' },
    { id:'2932',  lvl:'critical', name:'Attempt to access file outside the allowed' },
    { id:'31103', lvl:'high',     name:'SQL injection attempt detected' },
    { id:'31104', lvl:'critical', name:'XSS attack attempt blocked' },
    { id:'31151', lvl:'medium',   name:'Web server 400 error code' },
    { id:'40101', lvl:'critical', name:'Multiple authentication failures (brute force)' },
    { id:'40112', lvl:'high',     name:'High number of port scan connections' },
    { id:'40113', lvl:'critical', name:'Possible SYN flood attack' },
    { id:'40116', lvl:'high',     name:'Malware found in directory' },
    { id:'50100', lvl:'critical', name:'Privilege escalation detected' },
    { id:'50103', lvl:'high',     name:'Rootkit files found' },
    { id:'60103', lvl:'medium',   name:'New network connection established' },
    { id:'60106', lvl:'low',      name:'Process created with unusual parent' },
    { id:'80700', lvl:'critical', name:'Ransomware file extension pattern detected' },
    { id:'80701', lvl:'high',     name:'Mass file modification event' },
    { id:'92300', lvl:'medium',   name:'Shellshock attack attempt' },
    { id:'100010',lvl:'low',      name:'User account created' },
    { id:'100020',lvl:'info',     name:'System restarted' },
  ],

  AGENTS: [
    { id:'kali',    name:'Kali-Attacker', ip:'10.0.0.5' },
    { id:'windows', name:'WIN-SRV2019',   ip:'192.168.1.100' },
    { id:'ubuntu',  name:'UBUNTU-22',     ip:'192.168.1.101' },
  ],

  CORR_TEMPLATES: [
    { title:'🚨 Brute Force → Login', desc:'Multiple failed logins from 10.0.0.5 followed by successful authentication. Possible credential stuffing.', badge:'ATTACK CHAIN DETECTED' },
    { title:'🔍 Recon → Exploitation', desc:'Port scan from attacker (10.0.0.5) followed by targeted exploit attempt on detected services.', badge:'KILL CHAIN STAGE 1→3' },
    { title:'💀 Lateral Movement', desc:'Successful login from internal IP 192.168.1.100 to 192.168.1.101 — unusual for this time of day.', badge:'LATERAL MOVEMENT' },
    { title:'📂 Data Exfiltration', desc:'Large outbound transfer (>500MB) detected to external IP. Possible data theft in progress.', badge:'DATA BREACH RISK' },
    { title:'🔐 Privilege Escalation', desc:'Process running as low-privilege user spawned a root shell — CVE-2021-4034 exploitation pattern.', badge:'PRIVESC CHAIN' },
    { title:'🦠 Ransomware Pattern', desc:'Mass file rename events (.locked extension) detected on Ubuntu target. Immediate action required.', badge:'RANSOMWARE ACTIVE' },
  ],

  init() {
    const user = Nav.init();
    if (!user) return;
    this.initChart();
    this.startStream();
    this.updateTopRules();
  },

  initChart() {
    const ctx = document.getElementById('siem-timeline-chart');
    if (!ctx) return;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.timelineData.map((_,i) => `-${20-i}s`),
        datasets: [{
          label: 'Events/s',
          data: [...this.timelineData],
          borderColor: '#ff3366',
          backgroundColor: 'rgba(255,51,102,0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color:'#484f58', font:{family:'JetBrains Mono',size:9} }, grid:{color:'rgba(255,255,255,0.03)'} },
          y: { ticks: { color:'#484f58', font:{family:'JetBrains Mono',size:9} }, grid:{color:'rgba(255,255,255,0.03)'}, min:0 }
        }
      }
    });
  },

  startStream() {
    let batch = 0;
    this.interval = setInterval(() => {
      if (this.paused) return;
      const count = Utils.randInt(1, 4);
      for (let i = 0; i < count; i++) {
        setTimeout(() => this.generateLog(), i * Utils.randInt(80, 300));
      }
      // Update timeline
      this.timelineData.shift();
      this.timelineData.push(count);
      if (this.chart) {
        this.chart.data.datasets[0].data = [...this.timelineData];
        this.chart.update('none');
      }

      batch++;
      // Add correlation every 25 batches
      if (batch % 25 === 0) this.addCorrelation();
      // Update top rules every 10
      if (batch % 10 === 0) this.updateTopRules();
    }, 800);
  },

  generateLog() {
    const rule  = this.RULES[Utils.randInt(0, this.RULES.length - 1)];
    const agent = this.AGENTS[Utils.randInt(0, this.AGENTS.length - 1)];
    const now   = new Date();
    const time  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const srcIP = `${Utils.randInt(1,254)}.${Utils.randInt(1,254)}.${Utils.randInt(1,254)}.${Utils.randInt(1,254)}`;

    const log = { rule, agent, time, srcIP, lvl: rule.lvl };
    this.logs.unshift(log);
    if (this.logs.length > 500) this.logs.pop();

    // Counts
    const lvl = rule.lvl === 'info' ? 'low' : rule.lvl;
    if (this.counts[rule.lvl] !== undefined) this.counts[rule.lvl]++;
    this.counts.total++;
    this.agentCounts[agent.id]++;

    // Rule counts
    this.ruleCounts[rule.id] = (this.ruleCounts[rule.id] || 0) + 1;

    // Active alerts for critical/high
    if (rule.lvl === 'critical' || rule.lvl === 'high') {
      this.activeAlerts.unshift({ rule, agent, time });
      if (this.activeAlerts.length > 10) this.activeAlerts.pop();
    }

    this.updateDOM(log);
    this.updateStats();
    this.updateAgents();
    this.updateActiveAlerts();
  },

  updateDOM(log) {
    if (this.filterLevel !== 'all' && log.lvl !== this.filterLevel) return;
    if (this.filterAgent !== 'all' && log.agent.id !== this.filterAgent) return;

    const stream = document.getElementById('log-stream');
    if (!stream) return;

    const row = document.createElement('div');
    row.className = `log-row ${log.lvl}`;
    row.innerHTML = `
      <span class="log-level ${log.lvl}">${log.lvl}</span>
      <span class="log-time">${log.time}</span>
      <span class="log-agent">${log.agent.name}</span>
      <span class="log-rule">${log.rule.id}</span>
      <span class="log-desc">${log.rule.name}</span>
      <span class="log-src">${log.srcIP}</span>
    `;
    row.addEventListener('click', () => this.showLogDetail(log));

    stream.insertBefore(row, stream.firstChild);
    if (stream.children.length > 200) stream.removeChild(stream.lastChild);
  },

  showLogDetail(log) {
    Utils.toast(
      `Rule ${log.rule.id} — ${log.lvl.toUpperCase()}`,
      `${log.rule.name} · Agent: ${log.agent.name} · ${log.agent.ip}`,
      log.lvl === 'critical' ? 'danger' : log.lvl === 'high' ? 'warning' : 'info',
      4000
    );
  },

  updateStats() {
    ['critical','high','medium','low'].forEach(l => {
      const el = document.getElementById(`cnt-${l}`);
      if (el) el.textContent = (this.counts[l] || 0).toLocaleString();
    });
    const tot = document.getElementById('cnt-total');
    if (tot) tot.textContent = this.counts.total.toLocaleString();
  },

  updateAgents() {
    Object.entries(this.agentCounts).forEach(([id, cnt]) => {
      const el = document.getElementById(`agent-${id}-count`);
      if (el) el.textContent = `${cnt.toLocaleString()} events`;
    });
  },

  updateActiveAlerts() {
    const list = document.getElementById('active-alerts');
    const badge = document.getElementById('active-alert-count');
    if (!list) return;
    if (badge) badge.textContent = this.activeAlerts.length;

    list.innerHTML = this.activeAlerts.slice(0, 6).map(a => `
      <div class="active-alert-item">
        <div class="active-alert-title ${a.rule.lvl}">${a.rule.lvl === 'critical' ? '💀' : '⚠️'} ${a.rule.name}</div>
        <div class="active-alert-meta">Rule ${a.rule.id} · ${a.agent.name} · ${a.time}</div>
      </div>
    `).join('');
  },

  updateTopRules() {
    const list = document.getElementById('top-rules-list');
    if (!list) return;

    const sorted = Object.entries(this.ruleCounts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 6);

    const max = sorted[0]?.[1] || 1;

    list.innerHTML = sorted.map(([id, cnt]) => {
      const rule = this.RULES.find(r => r.id === id);
      const pct  = Math.round((cnt / max) * 100);
      return `
        <div class="rule-item">
          <span class="rule-id">${id}</span>
          <span class="rule-name">${rule?.name?.substring(0,30) || id}...</span>
          <div class="rule-bar-wrap">
            <div class="rule-bar"><div class="rule-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <span class="rule-count">${cnt}</span>
        </div>
      `;
    }).join('');
  },

  addCorrelation() {
    const tmpl = this.CORR_TEMPLATES[Utils.randInt(0, this.CORR_TEMPLATES.length - 1)];
    this.correlations.unshift(tmpl);
    if (this.correlations.length > 4) this.correlations.pop();

    const list = document.getElementById('correlation-list');
    if (!list) return;

    list.innerHTML = this.correlations.map(c => `
      <div class="corr-item">
        <div class="corr-title">${c.title}</div>
        <div class="corr-desc">${c.desc}</div>
        <span class="corr-badge">${c.badge}</span>
      </div>
    `).join('');

    Utils.toast('🔗 Correlation Alert', tmpl.title, 'warning', 3000);
  },

  togglePause() {
    this.paused = !this.paused;
    const btn  = document.getElementById('siem-pause-btn');
    const stat = document.getElementById('siem-status');
    if (btn)  btn.textContent = this.paused ? '▶ Resume' : '⏸ Pause';
    if (stat) stat.textContent = this.paused ? 'PAUSED' : 'MONITORING';
  },

  clearLogs() {
    const stream = document.getElementById('log-stream');
    if (stream) stream.innerHTML = '';
    this.logs = [];
    this.counts = { critical:0, high:0, medium:0, low:0, info:0, total:0 };
    this.updateStats();
    Utils.toast('🗑 Cleared', 'Log stream cleared', 'info', 2000);
  },

  filterLevel(val) { this.filterLevel = val; },
  filterAgent(val) { this.filterAgent = val; },
};

document.addEventListener('DOMContentLoaded', () => SIEM.init());
