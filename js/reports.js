'use strict';

const Reports = {
  history: [],
  filtered: [],

  ATTACK_TYPES: ['DDoS SYN Flood','SQL Injection','Brute Force SSH','Metasploit EternalBlue','ARP Spoofing MITM','Phishing Email','Ransomware Deploy','Nmap Port Scan','XSS Attack','CSRF Attack'],
  TARGETS: ['192.168.1.100 (Win)','192.168.1.101 (Ubuntu)','192.168.1.102 (Web)','10.0.0.50 (DB)'],
  DEFENSES: ['Firewall','IDS/IPS','WAF','MFA','Honeypot','DLP','None'],
  SEVERITIES: ['critical','critical','high','high','high','medium','medium','low'],

  CERTIFICATES: [
    { id:'c1', name:'🟢 Beginner Defender', desc:'Completed all Beginner level modules and quizzes', xpRequired:100,  modulesRequired:2 },
    { id:'c2', name:'🔵 Network Guardian',  desc:'Successfully blocked 5+ network attacks in the lab', xpRequired:300,  modulesRequired:4 },
    { id:'c3', name:'🟠 Exploit Analyst',   desc:'Completed Intermediate and Advanced levels', xpRequired:600,  modulesRequired:6 },
    { id:'c4', name:'🔴 Threat Hunter',     desc:'Completed all 4 difficulty levels with 80%+ quiz score', xpRequired:1000, modulesRequired:8 },
    { id:'c5', name:'💀 Red Team Operator', desc:'Launched 10+ different attack types in simulation lab', xpRequired:1500, modulesRequired:8 },
    { id:'c6', name:'🛡️ CyberShield Expert',desc:'Achieved 90%+ defense success rate across all sessions', xpRequired:2000, modulesRequired:8 },
  ],

  init() {
    const user = Nav.init();
    if (!user) return;
    this.generateHistory();
    this.loadKPIs(user);
    this.renderHistory();
    this.renderCertificates(user);
  },

  generateHistory() {
    // Generate 40 realistic history entries
    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const type   = this.ATTACK_TYPES[Utils.randInt(0, this.ATTACK_TYPES.length - 1)];
      const sev    = this.SEVERITIES[Utils.randInt(0, this.SEVERITIES.length - 1)];
      const target = this.TARGETS[Utils.randInt(0, this.TARGETS.length - 1)];
      const def    = this.DEFENSES[Utils.randInt(0, this.DEFENSES.length - 1)];
      const blocked= def !== 'None' ? Math.random() > 0.3 : Math.random() > 0.9;
      const ts     = new Date(now - Utils.randInt(0, 7 * 24 * 60 * 60 * 1000));

      this.history.push({ id: i+1, type, sev, target, def, blocked, ts });
    }
    this.history.sort((a,b) => b.ts - a.ts);
    this.filtered = [...this.history];
  },

  loadKPIs(user) {
    const xp       = user.xp || 0;
    const total    = this.history.length;
    const blocked  = this.history.filter(h => h.blocked).length;
    const rate     = total > 0 ? Math.round((blocked/total)*100) : 0;
    const modules  = Object.values(user.progress || {}).filter(Boolean).length;
    const score    = Math.min(100, Math.round((rate * 0.5) + (xp / 20) + (modules * 2)));

    document.getElementById('rpt-total').textContent   = total;
    document.getElementById('rpt-blocked').textContent = blocked;
    document.getElementById('rpt-rate').textContent    = rate + '%';
    document.getElementById('rpt-xp').textContent      = xp.toLocaleString() + ' XP';
    document.getElementById('rpt-modules').textContent = `${modules}/8`;
    document.getElementById('rpt-score').textContent   = score + '/100';
  },

  renderHistory(data = null) {
    const rows = data || this.filtered;
    const body = document.getElementById('history-body');
    if (!body) return;

    body.innerHTML = rows.map(h => {
      const date = h.ts.toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      return `
        <div class="history-row">
          <span style="color:var(--text-muted);font-family:var(--font-mono)">${h.id}</span>
          <span style="font-weight:500">${h.type}</span>
          <span><span class="sev-badge ${h.sev}">${h.sev}</span></span>
          <span style="color:var(--text-muted);font-size:11px;font-family:var(--font-mono)">${h.target}</span>
          <span style="color:var(--cyber-blue);font-size:11px">${h.def}</span>
          <span><span class="result-tag ${h.blocked ? 'blocked' : 'success'}">${h.blocked ? '✓ Blocked' : '✗ Breached'}</span></span>
          <span style="color:var(--text-muted);font-size:11px;font-family:var(--font-mono)">${date}</span>
        </div>
      `;
    }).join('') || '<div style="padding:40px;text-align:center;color:var(--text-muted)">No records found</div>';
  },

  filterHistory() {
    const typeVal   = document.getElementById('filter-type')?.value || 'all';
    const resultVal = document.getElementById('filter-result')?.value || 'all';

    this.filtered = this.history.filter(h => {
      const typeOk   = typeVal === 'all'   || h.type.includes(typeVal);
      const resultOk = resultVal === 'all' || (resultVal === 'blocked' ? h.blocked : !h.blocked);
      return typeOk && resultOk;
    });
    this.renderHistory();
  },

  renderCertificates(user) {
    const xp      = user.xp || 0;
    const modules = Object.values(user.progress || {}).filter(Boolean).length;
    const list    = document.getElementById('cert-list');
    const badge   = document.getElementById('cert-count');
    if (!list) return;

    let earned = 0;
    list.innerHTML = this.CERTIFICATES.map(cert => {
      const unlocked = xp >= cert.xpRequired && modules >= cert.modulesRequired;
      if (unlocked) earned++;
      return `
        <div class="${unlocked ? '' : 'cert-locked'}">
          <div class="cert-card">
            <div class="cert-name">${cert.name}</div>
            <div class="cert-desc">${cert.desc}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
              <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">
                ${unlocked ? '✓ EARNED' : `Need ${cert.xpRequired} XP · ${cert.modulesRequired} modules`}
              </span>
              ${unlocked ? `<button onclick="Reports.downloadCert('${cert.name}')" class="btn btn-primary" style="font-size:10px;padding:4px 12px">⬇ Download</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (badge) badge.textContent = `${earned} / ${this.CERTIFICATES.length}`;
  },

  /* ── CSV Download ── */
  downloadCSV() {
    const user = Auth.getUser();
    const header = ['#','Attack Type','Severity','Target','Defense','Result','Timestamp'];
    const rows   = this.history.map(h => [
      h.id, h.type, h.sev, h.target, h.def,
      h.blocked ? 'Blocked' : 'Breached',
      h.ts.toISOString()
    ]);

    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const meta = `# CyberLAB Security Report\n# User: ${user?.name || 'Unknown'}\n# Generated: ${new Date().toISOString()}\n# ALMAAREEFA University — Graduation Project 2025\n\n`;
    this.download(meta + csv, `CyberLAB_Report_${Date.now()}.csv`, 'text/csv');
    Utils.toast('⬇ Downloading', 'CSV report saved', 'success', 2000);
  },

  /* ── JSON Export ── */
  downloadJSON() {
    const user = Auth.getUser();
    const data = {
      meta: {
        project: 'CyberLAB — Cyber Attack Simulation Platform',
        university: 'ALMAAREEFA University',
        supervisor: 'DR. ISMAIL MOHAMMED KESHTA',
        user: user?.name,
        generated: new Date().toISOString(),
      },
      summary: {
        totalAttacks: this.history.length,
        blocked: this.history.filter(h => h.blocked).length,
        breached: this.history.filter(h => !h.blocked).length,
        xpEarned: user?.xp || 0,
      },
      history: this.history.map(h => ({
        id: h.id, type: h.type, severity: h.sev,
        target: h.target, defenseUsed: h.def,
        result: h.blocked ? 'Blocked' : 'Breached',
        timestamp: h.ts.toISOString(),
      }))
    };
    this.download(JSON.stringify(data, null, 2), `CyberLAB_Export_${Date.now()}.json`, 'application/json');
    Utils.toast('📦 Exported', 'JSON export saved', 'success', 2000);
  },

  /* ── Full Report (print-ready) ── */
  generateFull() {
    const user    = Auth.getUser();
    const blocked = this.history.filter(h => h.blocked).length;
    const rate    = Math.round((blocked / this.history.length) * 100);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CyberLAB Security Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
    .cover { text-align: center; padding: 60px 0 40px; border-bottom: 3px solid #1a1a2e; margin-bottom: 40px; }
    .cover h1 { font-size: 32px; font-weight: 900; color: #0d0d1a; margin-bottom: 8px; }
    .cover h2 { font-size: 18px; color: #444; font-weight: 400; margin-bottom: 24px; }
    .cover .meta { font-size: 13px; color: #666; line-height: 2; }
    .section { margin-bottom: 36px; }
    .section h3 { font-size: 16px; font-weight: 700; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; margin-bottom: 16px; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .kpi { flex: 1; background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-val { font-size: 28px; font-weight: 800; display: block; color: #0d0d1a; }
    .kpi-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1a1a2e; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; }
    td { padding: 9px 12px; border-bottom: 1px solid #eee; }
    tr:hover td { background: #f9f9f9; }
    .badge { padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
    .blocked { background: #e6fff4; color: #008a4b; }
    .breached { background: #fff0f3; color: #cc0033; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="cover">
    <div style="font-size:48px;margin-bottom:16px">🛡️</div>
    <h1>CyberLAB Security Report</h1>
    <h2>Cyber Attack Simulation Platform — Session Report</h2>
    <div class="meta">
      <div><strong>Student:</strong> ${user?.name || 'N/A'} &nbsp;|&nbsp; <strong>Email:</strong> ${user?.email || 'N/A'}</div>
      <div><strong>University:</strong> ALMAAREEFA University</div>
      <div><strong>Supervisor:</strong> DR. ISMAIL MOHAMMED KESHTA</div>
      <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
    </div>
  </div>

  <div class="section">
    <h3>Executive Summary</h3>
    <div class="kpi-row">
      <div class="kpi"><span class="kpi-val">${this.history.length}</span><span class="kpi-lbl">Total Attacks</span></div>
      <div class="kpi"><span class="kpi-val">${blocked}</span><span class="kpi-lbl">Blocked</span></div>
      <div class="kpi"><span class="kpi-val">${this.history.length - blocked}</span><span class="kpi-lbl">Breached</span></div>
      <div class="kpi"><span class="kpi-val">${rate}%</span><span class="kpi-lbl">Defense Rate</span></div>
      <div class="kpi"><span class="kpi-val">${user?.xp || 0}</span><span class="kpi-lbl">XP Earned</span></div>
    </div>
  </div>

  <div class="section">
    <h3>Attack Simulation Log</h3>
    <table>
      <thead><tr><th>#</th><th>Attack Type</th><th>Severity</th><th>Target</th><th>Defense</th><th>Result</th><th>Timestamp</th></tr></thead>
      <tbody>
        ${this.history.map(h => `
          <tr>
            <td>${h.id}</td>
            <td>${h.type}</td>
            <td>${h.sev.toUpperCase()}</td>
            <td>${h.target}</td>
            <td>${h.def}</td>
            <td><span class="badge ${h.blocked ? 'blocked' : 'breached'}">${h.blocked ? '✓ Blocked' : '✗ Breached'}</span></td>
            <td>${h.ts.toLocaleString('en-GB')}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    CyberLAB v2.4 · ALMAAREEFA University · Graduation Project 2024–2025 · Supervised by DR. ISMAIL MOHAMMED KESHTA
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  },

  /* ── Certificate Download ── */
  downloadCert(name) {
    const user = Auth.getUser();
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CyberLAB Certificate</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Georgia, serif; background: #0d0d1a; color: #fff; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .cert { width: 800px; background: linear-gradient(135deg, #0d0d1a, #1a1a2e); border: 3px solid #7c3aed; border-radius: 20px; padding: 60px; text-align: center; position: relative; }
    .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(124,58,237,0.3); border-radius: 16px; pointer-events: none; }
    .cert-icon { font-size: 64px; margin-bottom: 20px; }
    .cert-title { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #7c3aed; margin-bottom: 12px; }
    .cert-name  { font-size: 42px; font-weight: 900; background: linear-gradient(135deg, #e6edf3, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .cert-sub   { font-size: 16px; color: #8b949e; margin-bottom: 40px; }
    .cert-achievement { font-size: 22px; font-weight: 700; color: #00d4ff; margin-bottom: 8px; }
    .cert-desc  { font-size: 14px; color: #8b949e; margin-bottom: 40px; }
    .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(124,58,237,0.3); padding-top: 24px; }
    .cert-uni { text-align: left; }
    .cert-date { text-align: right; font-size: 12px; color: #484f58; }
    @media print { body { background: white; } .cert { background: white; color: black; border-color: #7c3aed; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-icon">🏅</div>
    <div class="cert-title">Certificate of Achievement</div>
    <div class="cert-name">${user?.name || 'Student'}</div>
    <div class="cert-sub">has successfully earned</div>
    <div class="cert-achievement">${name}</div>
    <div class="cert-desc">Awarded for outstanding performance in the CyberLAB<br>Cyber Attack Simulation & Defense Training Platform</div>
    <div class="cert-footer">
      <div class="cert-uni">
        <div style="font-weight:700;font-size:14px">🛡️ CyberLAB Platform</div>
        <div style="font-size:12px;color:#484f58">ALMAAREEFA University</div>
        <div style="font-size:11px;color:#484f58">Supervisor: DR. ISMAIL MOHAMMED KESHTA</div>
      </div>
      <div class="cert-date">
        <div>Issued: ${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}</div>
        <div style="font-family:monospace;margin-top:4px">ID: CL-${Math.random().toString(36).substring(2,10).toUpperCase()}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
    Utils.toast('🏅 Certificate', `Printing "${name}"`, 'success', 3000);
  },

  printReport() {
    this.generateFull();
  },

  download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
};

document.addEventListener('DOMContentLoaded', () => Reports.init());
