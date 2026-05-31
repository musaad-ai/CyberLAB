/* ============================================================
   INTERACTIVE-LAB.JS — Real Interactive Terminal
   User types commands → sees live attack/defense results
   ============================================================ */
'use strict';

const LabInteractive = {

  /* ── State ── */
  defenses: { firewall: false, ids: false, waf: false, mfa: false, honeypot: false, dlp: false },
  history:  [],
  histIdx:  -1,
  attacksLaunched: 0,
  attacksBlocked:  0,
  attacksSucceeded: 0,
  xpEarned: 0,
  isRunning: false,
  canvas: null, ctx: null,
  particles: [], animFrame: null,
  targetIP: '192.168.1.100',

  /* ── Command Database ── */
  COMMANDS: {
    'help': { fn: 'cmdHelp',       desc: 'Show all available commands' },
    'clear': { fn: 'cmdClear',     desc: 'Clear the terminal' },
    'status': { fn: 'cmdStatus',   desc: 'Show defense system status' },
    'whoami': { fn: 'cmdWhoami',   desc: 'Current user info' },
    'ifconfig': { fn: 'cmdIfconfig',desc: 'Network interface info' },
    'ping': { fn: 'cmdPing',       desc: 'Ping target host' },
    'whois': { fn: 'cmdWhois',     desc: 'Domain WHOIS lookup' },
    'nmap': { fn: 'cmdNmap',       desc: 'Network port scanner' },
    'hping3': { fn: 'cmdDdos',     desc: 'DDoS SYN flood attack' },
    'sqlmap': { fn: 'cmdSqlmap',   desc: 'SQL injection tool' },
    'hydra': { fn: 'cmdHydra',     desc: 'Brute force cracker' },
    'msfconsole': { fn: 'cmdMetasploit', desc: 'Metasploit framework' },
    'arpspoof': { fn: 'cmdMitm',   desc: 'ARP poisoning / MITM' },
    'sendEmail': { fn: 'cmdPhishing', desc: 'Phishing email sender' },
    'python3': { fn: 'cmdPython',  desc: 'Run Python script' },
    'ls': { fn: 'cmdLs',           desc: 'List directory' },
    'cat': { fn: 'cmdCat',         desc: 'Read a file' },
    'uname': { fn: 'cmdUname',     desc: 'System info' },
    'netstat': { fn: 'cmdNetstat', desc: 'Network connections' },
  },

  /* ── Hints for commands ── */
  HINTS: {
    'nmap':       'Usage: nmap -sV <IP>  |  nmap -sS --script vuln <IP>',
    'hping3':     'Usage: hping3 -S --flood -V <IP>  — DDoS SYN flood',
    'sqlmap':     'Usage: sqlmap -u http://target/login --dbs  — Auto SQL injection',
    'hydra':      'Usage: hydra -l admin -P rockyou.txt ssh://<IP>  — Brute force',
    'msfconsole': 'Usage: msfconsole -q -x "use exploit/ms17_010; set RHOSTS <IP>; run"',
    'arpspoof':   'Usage: arpspoof -i eth0 -t <target> <gateway>  — MITM',
    'sendEmail':  'Usage: sendEmail -t victim@company.com -f ceo@fake.com ...',
    'python3':    'Usage: python3 ransomware.py --target /var/www --key ENCRYPT',
    'help':       'Show all available commands and their descriptions',
    'status':     'Show which defenses are currently active',
    'clear':      'Clear the terminal screen',
  },

  /* ── Init ── */
  init() {
    const user = Nav.init();
    if (!user) return;
    this.initCanvas();
    this.initInput();
    this.boot();
  },

  /* ── Boot Message ── */
  boot() {
    const lines = [
      { type: 'system', text: '╔══════════════════════════════════════════════════════════╗' },
      { type: 'system', text: '║     CYBER ATTACK SIMULATION LAB — Interactive Terminal     ║' },
      { type: 'system', text: '║          ALMAAREEFA University · Graduation Project         ║' },
      { type: 'system', text: '╚══════════════════════════════════════════════════════════╝' },
      { type: 'blank' },
      { type: 'info',   text: '  [✓] Isolated network environment initialized' },
      { type: 'info',   text: `  [✓] Target system: ${this.targetIP} (Ubuntu 20.04 LTS)` },
      { type: 'info',   text: '  [✓] All attacks are simulated — no real systems harmed' },
      { type: 'blank' },
      { type: 'warn',   text: '  ⚠  Toggle defenses on the RIGHT PANEL before attacking!' },
      { type: 'blank' },
      { type: 'success', text: '  Type "help" for available commands. Good luck! 🎯' },
      { type: 'blank' },
    ];
    lines.forEach((l, i) => setTimeout(() => this.printLine(l.type, l.text), i * 60));
    setTimeout(() => this.focusInput(), lines.length * 60 + 100);
  },

  /* ── Canvas ── */
  initCanvas() {
    this.canvas = document.getElementById('viz-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    const resize = () => {
      this.canvas.width  = this.canvas.offsetWidth;
      this.canvas.height = 160;
    };
    resize();
    window.addEventListener('resize', resize);
    this.drawIdleCanvas();
  },

  drawIdleCanvas() {
    if (!this.ctx) return;
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Nodes
    this.drawNode(ctx, W*0.12, H*0.5, '💻', '#7c3aed', 'ATTACKER\n(You)');
    this.drawNode(ctx, W*0.5,  H*0.5, '🛡️', '#00d4ff',  'FIREWALL');
    this.drawNode(ctx, W*0.88, H*0.5, '🖥️', '#ff3366', 'TARGET\n192.168.1.100');

    // Dashed line
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W*0.16, H*0.5); ctx.lineTo(W*0.84, H*0.5); ctx.stroke();
    ctx.setLineDash([]);
  },

  drawNode(ctx, x, y, emoji, color, label) {
    // Glow
    ctx.shadowColor = color; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI*2);
    ctx.fillStyle = color + '18'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.shadowBlur = 0;
    // Emoji
    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
    // Label
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = color + 'bb';
    const parts = label.split('\n');
    parts.forEach((p, i) => ctx.fillText(p, x, y + 32 + i * 13));
  },

  /* ── Particle Animation ── */
  startAttackAnimation(color = '#ff3366', blocked = false) {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.particles = [];

    const W = this.canvas.width, H = this.canvas.height;
    const sx = W * 0.16, sy = H * 0.5;
    const ex = blocked ? W * 0.5 : W * 0.84, ey = H * 0.5;

    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: sx, y: sy + Utils.randFloat(-10, 10),
        progress: Math.random() * 0.3,
        speed: Utils.randFloat(0.015, 0.04),
        ex, ey,
        color,
        size: Utils.randFloat(2, 5),
        alive: true
      });
    }

    let tick = 0;
    const animate = () => {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(0,212,255,0.04)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Draw nodes
      this.drawNode(ctx, W*0.12, H*0.5, '💻', '#7c3aed', 'ATTACKER\n(You)');
      if (blocked) {
        this.drawNode(ctx, W*0.5, H*0.5, '🛡️', '#00ff88', 'DEFENSE\nACTIVE');
      } else {
        this.drawNode(ctx, W*0.5, H*0.5, '🛡️', '#00d4ff', 'FIREWALL');
      }
      this.drawNode(ctx, W*0.88, H*0.5, blocked ? '🖥️' : '💀', blocked ? '#00ff88' : '#ff3366',
        blocked ? 'TARGET\nPROTECTED' : 'TARGET\nCOMPROMISED');

      // Particles
      this.particles.forEach(p => {
        if (!p.alive) return;
        p.progress += p.speed;

        if (p.progress >= 1) {
          if (blocked) {
            // Bounce back
            p.color = '#00ff88';
            p.ex = sx; p.ey = sy;
            p.progress = 0;
            p.speed *= 0.7;
            if (p.speed < 0.005) p.alive = false;
          } else {
            p.alive = false;
          }
          return;
        }

        const x = p.x + (p.ex - p.x) * p.progress;
        const y = p.y + (p.ey - p.y) * p.progress + Math.sin(p.progress * Math.PI) * Utils.randFloat(-15, 15);
        const alpha = Math.sin(p.progress * Math.PI);

        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.globalAlpha = 1;
      });

      tick++;
      if (this.particles.some(p => p.alive) && tick < 180) {
        this.animFrame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => this.drawIdleCanvas(), 1000);
      }
    };
    animate();
  },

  /* ── Input System ── */
  initInput() {
    const input = document.getElementById('terminal-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          this.history.unshift(cmd);
          this.histIdx = -1;
          this.executeCommand(cmd);
        }
        input.value = '';
        document.getElementById('t-hint').textContent = '';
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.histIdx = Math.min(this.histIdx + 1, this.history.length - 1);
        input.value = this.history[this.histIdx] || '';
      }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.histIdx = Math.max(this.histIdx - 1, -1);
        input.value = this.histIdx >= 0 ? this.history[this.histIdx] : '';
      }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const partial = input.value.trim().split(' ')[0];
        const match = Object.keys(this.COMMANDS).find(c => c.startsWith(partial) && c !== partial);
        if (match) input.value = match;
      }
    });

    input.addEventListener('input', () => {
      const val = input.value.trim().split(' ')[0];
      const hint = this.HINTS[val];
      document.getElementById('t-hint').textContent = hint || '';
    });

    // Click anywhere in terminal to focus input
    document.getElementById('terminal-output')?.addEventListener('click', () => this.focusInput());
  },

  focusInput() {
    document.getElementById('terminal-input')?.focus();
  },

  insertCmd(cmd) {
    const input = document.getElementById('terminal-input');
    if (input) { input.value = cmd; input.focus(); }
  },

  /* ── Print to terminal ── */
  printLine(type, text, delay = 0) {
    const out = document.getElementById('terminal-output');
    if (!out) return;

    const fn = () => {
      if (type === 'blank') {
        const div = document.createElement('div');
        div.className = 't-blank';
        out.appendChild(div);
      } else if (type === 'cmd') {
        const div = document.createElement('div');
        div.className = 't-line';
        div.innerHTML = `<span class="t-prompt">┌──(root㉿kali)-[~]<br>└─$</span><span class="t-cmd">&nbsp;${this.escapeHtml(text)}</span>`;
        out.appendChild(div);
      } else {
        const div = document.createElement('div');
        div.className = `t-out ${type}`;
        div.textContent = text;
        out.appendChild(div);
      }
      out.scrollTop = out.scrollHeight;
    };

    if (delay) setTimeout(fn, delay);
    else fn();
  },

  async typewriteLine(type, text, speed = 25) {
    const out = document.getElementById('terminal-output');
    if (!out) return;
    const div = document.createElement('div');
    div.className = `t-out ${type}`;
    out.appendChild(div);

    return new Promise(resolve => {
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          div.textContent += text[i++];
          out.scrollTop = out.scrollHeight;
          setTimeout(tick, speed);
        } else resolve();
      };
      tick();
    });
  },

  escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  setStatus(label, type = 'idle') {
    const badge = document.getElementById('t-status-badge');
    const statusText = document.getElementById('lab-status-text');
    if (badge) { badge.className = `t-status ${type}`; badge.textContent = label; }
    if (statusText) statusText.textContent = label;
  },

  /* ── Defense Toggle ── */
  toggleDefense(key) {
    this.defenses[key] = !this.defenses[key];
    const toggle = document.getElementById(`toggle-${key}`);
    const row    = toggle?.closest('.def-item');
    if (toggle) toggle.classList.toggle('on', this.defenses[key]);
    if (row)    row.classList.toggle('active-def', this.defenses[key]);

    const activeCount = Object.values(this.defenses).filter(Boolean).length;
    const onOff = this.defenses[key] ? 'ENABLED' : 'DISABLED';
    const color = this.defenses[key] ? 'success' : 'warn';

    this.printLine('blank');
    this.printLine(color, `  [SYS] ${key.toUpperCase()} ${onOff} — Active defenses: ${activeCount}/6`);

    if (this.defenses[key]) {
      Utils.toast(`🛡️ ${key.toUpperCase()} Active`, 'Defense system enabled successfully', 'success', 2000);
    }
  },

  /* ── Score Update ── */
  updateScore() {
    document.getElementById('score-attacks').textContent = this.attacksLaunched;
    document.getElementById('score-blocked').textContent = this.attacksBlocked;
    document.getElementById('score-success').textContent = this.attacksSucceeded;
    document.getElementById('score-xp').textContent     = this.xpEarned;
  },

  gainXP(amount) {
    this.xpEarned += amount;
    const user = Auth.getUser();
    if (user) {
      user.xp = (user.xp || 0) + amount;
      const users = Utils.storage.get('users', []);
      const idx   = users.findIndex(u => u.id === user.id);
      if (idx >= 0) { users[idx] = user; Utils.storage.set('users', users); Auth.login(user); }
    }
  },

  /* ── Check if blocked ── */
  isBlocked(attackerDefenses) {
    return attackerDefenses.some(d => this.defenses[d]);
  },

  /* ── Delay helper ── */
  wait(ms) { return new Promise(r => setTimeout(r, ms)); },

  /* ═══════════════════════════════════
     COMMAND IMPLEMENTATIONS
  ═══════════════════════════════════ */

  async executeCommand(rawCmd) {
    if (this.isRunning) {
      this.printLine('warn', '  [!] Wait for current command to finish...');
      return;
    }

    this.printLine('cmd', rawCmd);
    const parts = rawCmd.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    const handler = this.COMMANDS[cmd];
    if (handler) {
      this.isRunning = true;
      try { await this[handler.fn](args, rawCmd); }
      catch (e) { this.printLine('error', `  [ERR] ${e.message}`); }
      this.isRunning = false;
    } else {
      this.printLine('error', `  bash: ${cmd}: command not found`);
      this.printLine('',      '  Type "help" to see available commands');
    }
    this.printLine('blank');
    this.focusInput();
  },

  /* ── help ── */
  async cmdHelp() {
    this.printLine('info', '  ╔═══════════════════════════════════════╗');
    this.printLine('info', '  ║      CYBERLAB COMMAND REFERENCE       ║');
    this.printLine('info', '  ╚═══════════════════════════════════════╝');
    this.printLine('blank');
    this.printLine('system', '  🔍 RECON COMMANDS:');
    this.printLine('',       '    nmap -sV <IP>              — Port & service scan');
    this.printLine('',       '    nmap -sS --script vuln <IP>— Vulnerability scan');
    this.printLine('',       '    whois <domain>             — Domain info');
    this.printLine('',       '    ping <IP>                  — Ping host');
    this.printLine('',       '    netstat -an                — Active connections');
    this.printLine('blank');
    this.printLine('error',  '  ⚔️  ATTACK COMMANDS:');
    this.printLine('',       '    hping3 -S --flood -V <IP>  — DDoS SYN flood');
    this.printLine('',       '    sqlmap -u <URL> --dbs      — SQL injection');
    this.printLine('',       '    hydra -l admin -P <list> ssh://<IP>  — Brute force');
    this.printLine('',       '    msfconsole -q -x "..."     — Metasploit exploit');
    this.printLine('',       '    arpspoof -i eth0 -t <IP>   — MITM / ARP poison');
    this.printLine('',       '    sendEmail -t <victim> ...  — Phishing email');
    this.printLine('',       '    python3 ransomware.py ...  — Ransomware deploy');
    this.printLine('blank');
    this.printLine('success','  🛡️  DEFENSE: Use the RIGHT PANEL toggles!');
    this.printLine('blank');
    this.printLine('system', '  ℹ️  UTILS: clear, status, whoami, uname, ifconfig, ls');
  },

  /* ── clear ── */
  async cmdClear() {
    document.getElementById('terminal-output').innerHTML = '';
  },

  /* ── status ── */
  async cmdStatus() {
    const activeCount = Object.values(this.defenses).filter(Boolean).length;
    this.printLine('system', '  ╔══════════════════════════════╗');
    this.printLine('system', '  ║      DEFENSE SYSTEM STATUS   ║');
    this.printLine('system', '  ╚══════════════════════════════╝');
    Object.entries({
      firewall: '🔥 Firewall',
      ids:      '🕵️ IDS/IPS',
      waf:      '🧱 WAF',
      mfa:      '🔐 MFA',
      honeypot: '🍯 Honeypot',
      dlp:      '🔒 DLP'
    }).forEach(([key, label]) => {
      const on = this.defenses[key];
      this.printLine(on ? 'success' : 'error',
        `    ${label.padEnd(20)} [${on ? '● ACTIVE  ' : '○ INACTIVE'}]`);
    });
    this.printLine('blank');
    const lvl = activeCount <= 1 ? '🔴 CRITICAL' : activeCount <= 3 ? '🟡 MODERATE' : '🟢 STRONG';
    this.printLine('info', `  Overall defense level: ${lvl} (${activeCount}/6 active)`);
  },

  /* ── whoami ── */
  async cmdWhoami() {
    const user = Auth.getUser();
    this.printLine('success', `  root`);
    this.printLine('', `  User: ${user?.name || 'Unknown'} | Role: ${user?.role || 'student'}`);
    this.printLine('', `  XP: ${user?.xp || 0} | Clearance: RED TEAM`);
  },

  /* ── uname ── */
  async cmdUname() {
    this.printLine('', '  Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.1.27-1kali1 x86_64 GNU/Linux');
  },

  /* ── ifconfig ── */
  async cmdIfconfig() {
    this.printLine('', '  eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500');
    this.printLine('', `        inet 10.0.0.5  netmask 255.255.255.0  broadcast 10.0.0.255`);
    this.printLine('', '        ether 08:00:27:ab:cd:ef  txqueuelen 1000  (Ethernet)');
    this.printLine('blank');
    this.printLine('', '  lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536');
    this.printLine('', '        inet 127.0.0.1  netmask 255.0.0.0');
  },

  /* ── ls ── */
  async cmdLs() {
    this.printLine('info', '  total 48');
    this.printLine('', '  drwxr-xr-x  5 root root 4096 May 31 01:00 .');
    this.printLine('', '  drwxr-xr-x 18 root root 4096 May 31 00:30 ..');
    this.printLine('success', '  -rwxr-xr-x  1 root root 8192 May 30 23:10 ransomware.py');
    this.printLine('success', '  -rw-r--r--  1 root root 2048 May 30 22:50 rockyou.txt');
    this.printLine('',        '  drwxr-xr-x  2 root root 4096 May 30 22:00 exploits/');
    this.printLine('',        '  drwxr-xr-x  3 root root 4096 May 30 21:00 payloads/');
    this.printLine('warn',    '  -rw-------  1 root root  512 May 30 20:00 loot.txt');
  },

  /* ── cat ── */
  async cmdCat(args) {
    const file = args[0];
    if (!file) { this.printLine('error', '  cat: missing file operand'); return; }
    if (file === 'loot.txt') {
      this.printLine('warn', '  ═══════════════════════════════');
      this.printLine('warn', '  CAPTURED CREDENTIALS:');
      this.printLine('error', '  admin:$2b$12$x9kHDq... (bcrypt hash)');
      this.printLine('error', '  dbuser:plaintext123');
      this.printLine('warn', '  ═══════════════════════════════');
    } else {
      this.printLine('error', `  cat: ${file}: No such file or directory`);
    }
  },

  /* ── ping ── */
  async cmdPing(args) {
    const host = args[0] || this.targetIP;
    this.printLine('info', `  PING ${host} 56(84) bytes of data.`);
    for (let i = 1; i <= 4; i++) {
      await this.wait(300);
      const ms = Utils.randInt(1, 8);
      this.printLine('success', `  64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${ms}.${Utils.randInt(10,99)} ms`);
    }
    this.printLine('blank');
    this.printLine('', `  --- ${host} ping statistics ---`);
    this.printLine('success', `  4 packets transmitted, 4 received, 0% packet loss`);
  },

  /* ── whois ── */
  async cmdWhois(args) {
    const domain = args[0] || 'target.com';
    this.printLine('info', `  [*] WHOIS lookup for ${domain}...`);
    await this.wait(600);
    this.printLine('', `  Domain Name: ${domain.toUpperCase()}`);
    this.printLine('', `  Registrar: GoDaddy.com, LLC`);
    this.printLine('', `  Created: 2019-03-15`);
    this.printLine('warn', `  Admin Email: admin@${domain}`);
    this.printLine('warn', `  Name Servers: ns1.targetserver.com, ns2.targetserver.com`);
    this.printLine('', `  IP Address: ${this.targetIP}`);
    this.printLine('success', `  [✓] OSINT complete — target profiled`);
    this.gainXP(10); this.updateScore();
  },

  /* ── netstat ── */
  async cmdNetstat() {
    this.printLine('', '  Active Internet connections (servers and established)');
    this.printLine('', '  Proto Recv-Q Send-Q Local Address           Foreign Address         State');
    this.printLine('warn',    '  tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN');
    this.printLine('warn',    '  tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN');
    this.printLine('error',   '  tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN');
    this.printLine('success', '  tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN');
    this.printLine('error',   '  tcp        0      0 0.0.0.0:445             0.0.0.0:*               LISTEN');
    this.printLine('warn',    '  tcp6       0      0 :::8080                 :::*                    LISTEN');
    this.printLine('blank');
    this.printLine('warn', '  [!] Port 3306 (MySQL) exposed publicly — VULNERABLE!');
    this.printLine('warn', '  [!] Port 445 (SMB) open — possible EternalBlue target');
  },

  /* ── NMAP ── */
  async cmdNmap(args) {
    const blockedBy = this.isBlocked(['ids','firewall']);
    this.attacksLaunched++;

    this.setStatus('● SCANNING', 'attack');
    this.printLine('info', `  Starting Nmap 7.94 ( https://nmap.org )`);
    await this.wait(400);
    this.printLine('info', `  Scanning ${this.targetIP}...`);
    await this.wait(800);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#00d4ff', true);
      this.printLine('blocked', `  [BLOCKED] IDS detected port scan — source IP 10.0.0.5 blocked!`);
      this.printLine('success', `  [FIREWALL] Added 10.0.0.5 to blocklist for 24h`);
      this.gainXP(15);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#00d4ff', false);
      this.printLine('warn',    `  PORT     STATE  SERVICE   VERSION`);
      await this.wait(200);
      this.printLine('success', `  22/tcp   open   ssh       OpenSSH 8.2p1 Ubuntu`);
      this.printLine('success', `  80/tcp   open   http      Apache httpd 2.4.41`);
      this.printLine('error',   `  3306/tcp open   mysql     MySQL 8.0.26 ← VULNERABLE`);
      this.printLine('error',   `  445/tcp  open   smb       Samba 4.6.3  ← MS17-010?`);
      this.printLine('warn',    `  8080/tcp open   http      Tomcat 8.0   ← Outdated`);
      await this.wait(200);
      this.printLine('blank');
      this.printLine('warn',  `  [!] MySQL exposed publicly — SQL injection possible!`);
      this.printLine('warn',  `  [!] SMB port open — run: msfconsole for EternalBlue`);
      this.printLine('error', `  [✗] Scan complete — 5 open ports found`);
      this.gainXP(20);
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── DDOS ── */
  async cmdDdos(args) {
    const blockedBy = this.isBlocked(['firewall','ids']);
    this.attacksLaunched++;
    this.setStatus('● ATTACKING', 'attack');
    this.printLine('warn', `  [*] Starting SYN flood attack on ${this.targetIP}:80`);
    await this.wait(400);
    this.printLine('info', `  [*] Sending 100,000 SYN packets/second...`);
    await this.wait(600);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#ff3366', true);
      await this.wait(500);
      this.printLine('blocked', `  [FIREWALL] SYN flood detected! Rate: 100K/s → BLOCKED`);
      this.printLine('success', `  [FIREWALL] IP 10.0.0.5 banned. Attack neutralized!`);
      this.printLine('success', `  [IDS] Alert raised — logged to SIEM`);
      this.gainXP(20);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#ff3366', false);
      let pps = 0;
      for (let i = 0; i < 5; i++) {
        await this.wait(350);
        pps += 20000;
        this.printLine('error', `  [ATTACK] ${pps.toLocaleString()} packets sent — Server CPU: ${20 + i*16}%`);
      }
      await this.wait(400);
      this.printLine('critical', `  [✗] TARGET DOWN — Service unavailable (HTTP 503)`);
      this.printLine('error',    `  [✗] Downtime cost: $2,400/minute`);
      this.gainXP(25);
      this.showResult(false, 'DDoS Succeeded!', 'The target is DOWN. Enable Firewall/IDS to stop this attack.');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── SQL INJECTION ── */
  async cmdSqlmap(args) {
    const blockedBy = this.isBlocked(['waf','ids']);
    this.attacksLaunched++;
    this.setStatus('● ATTACKING', 'attack');

    const url = args.find(a => a.startsWith('http')) || 'http://192.168.1.100/login';
    this.printLine('warn', `  [*] SQLMap starting against: ${url}`);
    await this.wait(500);
    this.printLine('info', `  [*] Testing parameter 'username' for SQLi...`);
    await this.wait(600);
    this.printLine('info', `  [*] Payload: ' OR '1'='1`);
    await this.wait(500);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#ff3366', true);
      this.printLine('blocked', `  [WAF] SQL injection payload detected and blocked!`);
      this.printLine('success', `  [WAF] Malicious request filtered: ' OR '1'='1`);
      this.printLine('success', `  [IDS] Alert #7482 — SQL injection attempt from 10.0.0.5`);
      this.gainXP(25);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#ff3366', false);
      this.printLine('error', `  [+] Parameter 'username' is INJECTABLE!`);
      await this.wait(400);
      this.printLine('error', `  [+] Backend DBMS: MySQL 8.0.26`);
      this.printLine('error', `  [+] Databases: information_schema, users_db, products`);
      await this.wait(400);
      this.printLine('critical', `  [+] Dumping table 'users'...`);
      await this.wait(500);
      this.printLine('error', `  admin      | 5f4dcc3b5aa765d61d8327deb882cf99 (md5:password)`);
      this.printLine('error', `  john.doe   | e10adc3949ba59abbe56e057f20f883e`);
      this.printLine('error', `  sarah.k    | 25f9e794323b453885f5181f1b624d0b`);
      this.printLine('critical', `  [✗] 3 user credentials DUMPED! Database compromised.`);
      this.gainXP(30);
      this.showResult(false, 'SQL Injection Succeeded!', 'Database credentials stolen. Enable WAF to prevent this!');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── BRUTE FORCE ── */
  async cmdHydra(args) {
    const blockedBy = this.isBlocked(['mfa','firewall','ids']);
    this.attacksLaunched++;
    this.setStatus('● ATTACKING', 'attack');

    this.printLine('warn', `  Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak`);
    await this.wait(400);
    this.printLine('info', `  [DATA] Attacking ssh://${this.targetIP} with 14M passwords...`);
    await this.wait(500);

    const attempts = ['password','123456','admin123','letmein','qwerty'];
    for (let i = 0; i < 3; i++) {
      await this.wait(300);
      this.printLine('', `  [ATTEMPT] login: admin   password: ${attempts[i]}   → FAILED`);
    }
    await this.wait(400);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#ff3366', true);
      if (this.defenses.mfa) {
        this.printLine('blocked', `  [MFA] Multi-factor authentication required!`);
        this.printLine('success', `  [MFA] Even with correct password, login BLOCKED (no 2FA token)`);
      } else {
        this.printLine('blocked', `  [FIREWALL] Too many failed attempts — IP banned!`);
        this.printLine('success', `  [IDS] Brute force detected after 3 attempts. Locked out.`);
      }
      this.gainXP(20);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#ff3366', false);
      await this.wait(300);
      this.printLine('error', `  [ATTEMPT] login: admin   password: password123  → FAILED`);
      this.printLine('error', `  [ATTEMPT] login: admin   password: admin2024     → FAILED`);
      await this.wait(500);
      this.printLine('critical', `  [SUCCESS] login: admin   password: cyberlab123  → FOUND!`);
      this.printLine('critical', `  [✗] SSH session opened as admin@${this.targetIP}`);
      this.printLine('critical', `  [✗] Full system access granted!`);
      this.gainXP(30);
      this.showResult(false, 'Brute Force Succeeded!', 'SSH access gained! Enable MFA + Firewall to stop brute force attacks.');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── METASPLOIT ── */
  async cmdMetasploit(args) {
    const blockedBy = this.isBlocked(['ids','firewall']);
    this.attacksLaunched++;
    this.setStatus('● EXPLOITING', 'attack');

    this.printLine('info',  `        =[ metasploit v6.3.25-dev ]`);
    this.printLine('',      `  + --=[ 2375 exploits - 1232 auxiliary - 413 post ]`);
    this.printLine('blank');
    await this.wait(500);
    this.printLine('info', `  [*] Loading module: exploit/windows/smb/ms17_010_eternalblue`);
    this.printLine('info', `  [*] Setting RHOSTS: ${this.targetIP}`);
    await this.wait(600);
    this.printLine('warn', `  [*] Checking target for MS17-010 vulnerability...`);
    await this.wait(700);
    this.printLine('error', `  [+] ${this.targetIP} is VULNERABLE to MS17-010!`);
    await this.wait(500);
    this.printLine('info', `  [*] Sending exploit...`);
    await this.wait(800);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#7c3aed', true);
      this.printLine('blocked', `  [IDS] Exploit payload DETECTED — signature match MS17-010`);
      this.printLine('success', `  [IDS] Connection from 10.0.0.5 terminated`);
      this.printLine('success', `  [FIREWALL] Port 445 traffic blocked from attacker IP`);
      this.gainXP(35);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#7c3aed', false);
      await this.wait(400);
      this.printLine('critical', `  [*] Meterpreter session 1 opened`);
      this.printLine('critical', `      ${this.targetIP}:49158 → 10.0.0.5:4444`);
      await this.wait(300);
      this.printLine('error', `  meterpreter > getuid`);
      this.printLine('critical', `  Server username: NT AUTHORITY\\SYSTEM`);
      this.printLine('critical', `  [✗] FULL DOMAIN CONTROLLER ACCESS ACHIEVED!`);
      this.gainXP(50);
      this.showResult(false, '💀 EternalBlue Succeeded!', 'SYSTEM-level access gained on Domain Controller. Enable IDS immediately!');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── MITM ── */
  async cmdMitm(args) {
    const blockedBy = this.isBlocked(['ids','honeypot']);
    this.attacksLaunched++;
    this.setStatus('● ATTACKING', 'attack');

    this.printLine('warn', `  [*] Enabling IP forwarding...`);
    await this.wait(400);
    this.printLine('info', `  [*] ARP poisoning — telling ${this.targetIP} that gateway is at OUR MAC...`);
    await this.wait(600);
    this.printLine('info', `  [*] Intercepting all traffic between target and gateway...`);
    await this.wait(600);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#a78bfa', true);
      if (this.defenses.honeypot) {
        this.printLine('blocked', `  [HONEYPOT] Fake service lured attacker! IP captured.`);
        this.printLine('success', `  [HONEYPOT] Attacker 10.0.0.5 is now being monitored.`);
      } else {
        this.printLine('blocked', `  [IDS] ARP spoofing detected — anomalous ARP traffic!`);
        this.printLine('success', `  [IDS] Gratuitous ARP blocked. Network protected.`);
      }
      this.gainXP(25);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#a78bfa', false);
      await this.wait(500);
      this.printLine('error', `  [+] ARP table poisoned successfully!`);
      this.printLine('error', `  [+] Intercepting packets...`);
      await this.wait(400);
      this.printLine('critical', `  [CAPTURE] POST /login HTTP/1.1`);
      this.printLine('critical', `  [CAPTURE] username=admin&password=SecretPass2024`);
      this.printLine('critical', `  [✗] Credentials captured via Man-in-the-Middle!`);
      this.gainXP(30);
      this.showResult(false, 'MITM Attack Succeeded!', 'Credentials intercepted in plaintext. Enable IDS/Honeypot!');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── PHISHING ── */
  async cmdPhishing(args) {
    const blockedBy = this.isBlocked(['ids','mfa']);
    this.attacksLaunched++;
    this.setStatus('● ATTACKING', 'attack');

    this.printLine('warn', `  [*] Crafting phishing email...`);
    await this.wait(400);
    this.printLine('info', `  [*] Sender spoofed: ceo@company.com`);
    this.printLine('info', `  [*] Payload: http://secure-company-login.xyz/auth`);
    await this.wait(500);
    this.printLine('warn', `  [*] Sending to 500 employees...`);
    await this.wait(700);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#ffaa00', true);
      if (this.defenses.ids) {
        this.printLine('blocked', `  [EMAIL FILTER] Phishing domain detected — emails blocked!`);
        this.printLine('success', `  [IDS] Domain secure-company-login.xyz added to blocklist`);
      }
      if (this.defenses.mfa) {
        this.printLine('success', `  [MFA] Even if victim clicks, MFA protects their account!`);
      }
      this.gainXP(20);
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#ffaa00', false);
      await this.wait(300);
      this.printLine('error', `  [+] Email delivered to 500 inboxes!`);
      await this.wait(500);
      this.printLine('warn',  `  [+] 12% click rate — 60 employees clicked the link`);
      this.printLine('critical', `  [+] 23 credentials harvested:`);
      this.printLine('error', `      j.smith:Work2024! | m.jones:Summer#1 | ...`);
      this.printLine('critical', `  [✗] 23 accounts COMPROMISED via phishing!`);
      this.gainXP(25);
      this.showResult(false, 'Phishing Succeeded!', '23 accounts stolen! Enable IDS email filter + MFA to defend.');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── RANSOMWARE ── */
  async cmdPython(args) {
    const script = args[0] || '';
    if (!script.includes('ransomware')) {
      this.printLine('', `  Python 3.11.5`);
      this.printLine('', `  Type "help", "copyright", "credits" or "license" for more information.`);
      this.printLine('info', `  >>> _`);
      return;
    }

    const blockedBy = this.isBlocked(['dlp','ids']);
    this.attacksLaunched++;
    this.setStatus('● ATTACKING', 'attack');

    this.printLine('warn', `  [*] Ransomware initializing...`);
    await this.wait(400);
    this.printLine('info', `  [*] Generating AES-256 encryption key...`);
    await this.wait(500);
    this.printLine('warn', `  [*] Scanning target filesystem for files...`);
    await this.wait(600);
    this.printLine('info', `  [*] Found 847,293 files to encrypt`);
    await this.wait(400);
    this.printLine('warn', `  [*] Deleting shadow copies: vssadmin delete shadows /all`);
    await this.wait(500);

    if (blockedBy) {
      this.attacksBlocked++;
      this.startAttackAnimation('#ff6b35', true);
      if (this.defenses.dlp) {
        this.printLine('blocked', `  [DLP] Mass file encryption detected — process KILLED!`);
        this.printLine('success', `  [DLP] Ransomware process terminated (PID 9821)`);
        this.printLine('success', `  [DLP] 0 files encrypted. All data safe.`);
      } else {
        this.printLine('blocked', `  [IDS] Anomalous file system activity detected!`);
        this.printLine('success', `  [IDS] Ransomware quarantined. Shadow copies preserved.`);
      }
      this.gainXP(40);
      this.showResult(true, '🛡️ Ransomware Blocked!', 'Excellent! DLP stopped the ransomware before any files were encrypted.');
    } else {
      this.attacksSucceeded++;
      this.startAttackAnimation('#ff6b35', false);
      let count = 0;
      for (let i = 0; i < 5; i++) {
        await this.wait(300);
        count += Utils.randInt(50000, 120000);
        this.printLine('error', `  [ENCRYPTING] ${count.toLocaleString()} files encrypted...`);
      }
      await this.wait(400);
      this.printLine('critical', `  [✗] 847,293 FILES ENCRYPTED WITH AES-256!`);
      this.printLine('critical', `  [✗] Dropping ransom note: README_DECRYPT.txt`);
      this.printLine('critical', `  Send 2.5 BTC to: bc1qxy2kgdygjrsqtzq2n0yrf249...`);
      this.gainXP(50);
      this.showResult(false, '💀 Ransomware Deployed!', 'All files encrypted! You need DLP + IDS to stop ransomware.');
    }
    this.setStatus('● IDLE', 'idle');
    this.updateScore();
  },

  /* ── Show Result Banner ── */
  showResult(win, title, desc) {
    const banner = document.getElementById('result-banner');
    const emoji  = document.getElementById('result-emoji');
    const titleEl= document.getElementById('result-title');
    const descEl = document.getElementById('result-desc');
    if (!banner) return;

    banner.className  = `result-banner ${win ? 'win' : 'lose'}`;
    emoji.textContent  = win ? '🛡️' : '💀';
    titleEl.textContent= title;
    titleEl.style.color= win ? 'var(--defense-green)' : 'var(--attack-red)';
    descEl.textContent = desc;
    banner.style.display = 'block';

    if (win) Utils.toast('🏆 Defense Success!', title, 'success');
    else     Utils.toast('💀 Attack Succeeded', 'Enable defenses to block this!', 'danger');
  },

  closeBanner() {
    document.getElementById('result-banner').style.display = 'none';
    this.focusInput();
  },

  /* ── Reset ── */
  reset() {
    this.attacksLaunched = this.attacksBlocked = this.attacksSucceeded = this.xpEarned = 0;
    this.updateScore();
    this.closeBanner();
    document.getElementById('terminal-output').innerHTML = '';
    this.setStatus('● IDLE', 'idle');
    this.drawIdleCanvas();
    this.printLine('success', '  [SYS] Lab reset. All session data cleared.');
    this.printLine('info',    '  [SYS] Type "help" to see available commands.');
    this.focusInput();
  }
};

document.addEventListener('DOMContentLoaded', () => LabInteractive.init());
