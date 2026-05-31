# Cyber Attack Simulation Lab

> **ALMAAREEFA University - Graduation Project 2024-2025**
> Department of Computer Science and Information Systems
> Supervisor: DR. ISMAIL MOHAMMED KESHTA

---

## About

Cyber Attack Simulation Lab is a professional **interactive cybersecurity simulation platform** designed for educational purposes. It allows students and researchers to learn about cyber attacks and defenses in a completely safe, isolated virtual environment.

## Live Demo

**[Open Cyber Attack Simulation Lab](https://talalf1.github.io/Cyber-attack-)**

### Demo Login
| Field | Value |
|-------|-------|
| Email | `admin@cyberlab.com` |
| Password | `password123` |

---

## Features

### Real-Time Dashboard
- Live attack feed with simulated global threats
- System status gauges (CPU, Memory, Network)
- Attack type distribution charts
- Threat intelligence panel

### Learning Center - 4 Difficulty Levels
| Level | Topics |
|-------|--------|
| Beginner | Cybersecurity basics, Malware, Social Engineering |
| Intermediate | Network Scanning, SQL Injection |
| Advanced | Metasploit Framework, Exploitation |
| Expert | APT Lifecycle, Nation-State Tactics |

Each module includes:
- **Theory** - Concept explanation
- **Demo** - Live terminal simulation
- **Defense** - How to protect against the attack
- **Quiz** - Test your knowledge (+XP)

### Interactive Lab
Type **real commands** and see live attack simulations:
```
nmap -sV 192.168.1.1          # Port scan
hping3 -S --flood 192.168.1.1 # DDoS
sqlmap -u http://target/login  # SQL Injection
hydra -l admin -P rockyou.txt  # Brute Force
msfconsole                     # Metasploit
arpspoof -i eth0               # MITM
python3 ransomware.py          # Ransomware
```

Toggle 6 defense systems to block attacks:
Firewall | IDS/IPS | WAF | MFA | Honeypot | DLP

### SIEM Live Monitor
- Real-time log stream from 3 simulated agents (Kali Linux, Windows Server, Ubuntu)
- 20 Wazuh-authentic rule IDs
- Event correlation and active alert management
- Timeline chart updated every second

### Analytics
- Weekly attack volume charts
- Attack vs Defense radar chart
- Severity distribution
- Attack frequency heatmap
- Top attack origins by country

### Reports & Certificates
- Download attack history as CSV / JSON / PDF
- Generate printable security certificates
- Track user progress and XP

---

## Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Custom design system, animations, glassmorphism
- **Vanilla JavaScript** - No frameworks, pure JS modules
- **Chart.js** - Data visualization
- **Canvas API** - Attack visualization animations
- **GitHub Pages** - Static hosting

---

## Project Structure

```
Cyber-attack-/
|-- index.html              # Login / Register
|-- dashboard.html          # Live threat dashboard
|-- learn.html              # Learning center
|-- lab.html                # Interactive attack lab
|-- siem.html               # SIEM live monitor
|-- analytics.html          # Analytics
|-- reports.html            # Reports & Certificates
|-- profile.html            # User profile & XP
|-- css/
|   |-- main.css            # Global design system
|   |-- auth.css            # Authentication styles
|   |-- siem.css            # SIEM styles
|-- js/
    |-- utils.js            # Shared utilities
    |-- app.js              # Core auth & navigation
    |-- dashboard.js        # Live simulation engine
    |-- learn.js            # Learning modules & quiz
    |-- interactive-lab.js  # Interactive terminal
    |-- siem.js             # SIEM engine
    |-- reports.js          # Reports & certificates
```

---

## How to Run Locally

```bash
# Using Node.js serve
npx serve . --listen 3000

# OR using Python
python -m http.server 3000
```

Then open: `http://localhost:3000`

---

## Disclaimer

This platform is for **educational purposes only**. All attack simulations are completely virtual and no real systems are affected. The tools demonstrated are shown for cybersecurity education and awareness.

---

*Cyber Attack Simulation Lab - ALMAAREEFA University 2025*
