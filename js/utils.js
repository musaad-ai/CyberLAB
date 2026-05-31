/* ============================================================
   UTILS.JS — Shared Utilities
   Cyber Attack Simulation LAB
   ============================================================ */

'use strict';

const Utils = {

  /* ── Random helpers ── */
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randFloat(min, max, decimals = 1) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  },

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /* ── IP generation ── */
  fakeIP() {
    const prefixes = ['192.168','10.0','172.16','45.33','104.21','185.220','194.165','198.98','23.105','103.230'];
    const prefix = this.pickRandom(prefixes);
    return `${prefix}.${this.randInt(1,254)}.${this.randInt(1,254)}`;
  },

  /* ── Time formatting ── */
  timeAgo(ms) {
    const seconds = Math.floor((Date.now() - ms) / 1000);
    if (seconds < 60)  return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
    return `${Math.floor(seconds/3600)}h ago`;
  },

  formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },

  formatDate(date = new Date()) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  },

  /* ── Number formatting ── */
  formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  },

  /* ── Counter animation ── */
  animateCounter(el, target, duration = 1200, prefix = '', suffix = '') {
    if (!el) return;
    const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
    const range = target - start;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * ease);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  /* ── DOM helpers ── */
  qs(selector, parent = document)  { return parent.querySelector(selector); },
  qsa(selector, parent = document) { return [...parent.querySelectorAll(selector)]; },

  el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    });
    children.forEach(c => typeof c === 'string' ? e.insertAdjacentHTML('beforeend', c) : e.appendChild(c));
    return e;
  },

  /* ── Toast notifications ── */
  toast(title, msg, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container') ||
      (() => {
        const c = document.createElement('div');
        c.id = 'toast-container';
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
      })();

    const icons = { danger: '🚨', success: '✅', warning: '⚠️', info: 'ℹ️' };
    const toast = this.el('div', { class: `toast ${type}` }, [
      this.el('span', { class: 'toast-icon', text: icons[type] || 'ℹ️' }),
      this.el('div', { class: 'toast-content' }, [
        this.el('div', { class: 'toast-title', text: title }),
        this.el('div', { class: 'toast-msg', text: msg })
      ])
    ]);

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /* ── Local storage helpers ── */
  storage: {
    get(key, defaultVal = null) {
      try {
        const v = localStorage.getItem(`cyberlab_${key}`);
        return v !== null ? JSON.parse(v) : defaultVal;
      } catch { return defaultVal; }
    },
    set(key, value) {
      try { localStorage.setItem(`cyberlab_${key}`, JSON.stringify(value)); } catch {}
    },
    remove(key) { localStorage.removeItem(`cyberlab_${key}`); },
    clear()     { Object.keys(localStorage).filter(k => k.startsWith('cyberlab_')).forEach(k => localStorage.removeItem(k)); }
  },

  /* ── Debounce ── */
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /* ── Typewriter effect ── */
  typewrite(el, text, speed = 40, onDone = null) {
    let i = 0;
    el.textContent = '';
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed);
      } else if (onDone) {
        onDone();
      }
    };
    tick();
  },

  /* ── Clamp ── */
  clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
};

/* ── Country / city data for fake attack origins ── */
const GEO_DATA = [
  { country: 'China',          city: 'Beijing',       x: 75, y: 32, flag: '🇨🇳' },
  { country: 'Russia',         city: 'Moscow',        x: 60, y: 20, flag: '🇷🇺' },
  { country: 'United States',  city: 'New York',      x: 20, y: 30, flag: '🇺🇸' },
  { country: 'North Korea',    city: 'Pyongyang',     x: 78, y: 28, flag: '🇰🇵' },
  { country: 'Iran',           city: 'Tehran',        x: 60, y: 32, flag: '🇮🇷' },
  { country: 'Brazil',         city: 'São Paulo',     x: 28, y: 58, flag: '🇧🇷' },
  { country: 'Germany',        city: 'Frankfurt',     x: 50, y: 22, flag: '🇩🇪' },
  { country: 'India',          city: 'Mumbai',        x: 67, y: 38, flag: '🇮🇳' },
  { country: 'Netherlands',    city: 'Amsterdam',     x: 49, y: 20, flag: '🇳🇱' },
  { country: 'Ukraine',        city: 'Kyiv',          x: 56, y: 22, flag: '🇺🇦' },
  { country: 'Nigeria',        city: 'Lagos',         x: 49, y: 47, flag: '🇳🇬' },
  { country: 'Romania',        city: 'Bucharest',     x: 54, y: 23, flag: '🇷🇴' },
  { country: 'Vietnam',        city: 'Hanoi',         x: 76, y: 39, flag: '🇻🇳' },
  { country: 'Indonesia',      city: 'Jakarta',       x: 78, y: 55, flag: '🇮🇩' },
  { country: 'Pakistan',       city: 'Karachi',       x: 64, y: 36, flag: '🇵🇰' },
];

/* ── Attack types database ── */
const ATTACK_TYPES = [
  { id: 'ddos',        name: 'DDoS Attack',           icon: '💥', color: 'red',    severity: 'critical', port: 80  },
  { id: 'sql',         name: 'SQL Injection',          icon: '🗄️', color: 'orange', severity: 'high',     port: 3306},
  { id: 'phishing',    name: 'Phishing',               icon: '🎣', color: 'orange', severity: 'high',     port: 443 },
  { id: 'brute',       name: 'Brute Force',            icon: '🔨', color: 'blue',   severity: 'medium',   port: 22  },
  { id: 'mitm',        name: 'Man-in-the-Middle',      icon: '👤', color: 'purple', severity: 'critical', port: 8080},
  { id: 'ransomware',  name: 'Ransomware',             icon: '🔐', color: 'red',    severity: 'critical', port: 445 },
  { id: 'xss',         name: 'Cross-Site Scripting',   icon: '📝', color: 'blue',   severity: 'medium',   port: 80  },
  { id: 'csrf',        name: 'CSRF Attack',            icon: '🔄', color: 'blue',   severity: 'medium',   port: 443 },
  { id: 'recon',       name: 'Network Recon',          icon: '🔍', color: 'green',  severity: 'low',      port: 21  },
  { id: 'priv_esc',    name: 'Privilege Escalation',   icon: '⬆️', color: 'red',    severity: 'critical', port: 135 },
  { id: 'zero_day',    name: 'Zero-Day Exploit',       icon: '💀', color: 'red',    severity: 'critical', port: 0   },
  { id: 'port_scan',   name: 'Port Scanning',          icon: '📡', color: 'green',  severity: 'low',      port: 0   },
];

const STATUSES = [
  { label: 'BLOCKED',   class: 'badge-green'  },
  { label: 'DETECTED',  class: 'badge-orange' },
  { label: 'ACTIVE',    class: 'badge-red'    },
  { label: 'MITIGATED', class: 'badge-blue'   },
  { label: 'ANALYZING', class: 'badge-purple' },
];

window.Utils      = Utils;
window.GEO_DATA   = GEO_DATA;
window.ATTACK_TYPES = ATTACK_TYPES;
window.STATUSES   = STATUSES;
