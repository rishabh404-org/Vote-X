# 🗳️ VOTE-X — Next-Generation Cryptographic Online Voting System

[![Security: SHA-256](https://img.shields.io/badge/Security-256--Bit%20SHA-7c3aed?style=flat-square)](https://github.com/rishabh404-org/Vote-X)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Design: Secure-Flow](https://img.shields.io/badge/Design%20System-Secure--Flow-10b981?style=flat-square)](secure_flow_design_system/DESIGN.md)

**Vote-X** is an institutional-grade, zero-knowledge, and tamper-evident online voting platform designed to empower democratic elections with modern cryptographic integrity and seamless user experience.

---

## ✨ Features

- **🛡️ Multi-Factor Voter Authentication (MFA)**:
  - Voter ID registry validation with active roll checks.
  - 6-Digit SMS Two-Factor Authentication with auto-advancing input fields & countdown timers.
  - Biometric fingerprint scanner simulation with live laser sweep & Web Audio haptic feedback.
- **🔒 Zero-Knowledge Ballot Encryption**:
  - Client-side SHA-256 ballot sealing via Web Crypto API.
  - Voter identity decoupling to guarantee 100% ballot secrecy.
  - Permanent double-voting prevention locks.
- **📜 Immutable Audit Ledger & Block Explorer**:
  - Cryptographic block chain linking each encrypted vote with previous block hash, timestamp, and Merkle receipt.
  - Downloadable and printable official voting certificate with verified transaction token.
- **📊 Real-Time Admin Telemetry**:
  - Live turnout progress tracking.
  - Dynamic candidate leaderboards and vote distribution charts.
  - Full CRUD control for elections, candidates, and voter rolls.
  - One-click cryptographic JSON audit log export.
- **🎨 Modern Aesthetic**:
  - Built with the **Secure-Flow Design System** (Deep Navy `#0A0C1B`, Electric Purple `#7C3AED`, and glassmorphic cards).
  - Dynamic WebGL background shader and interactive 3D Three.js Torus Knot cryptographic vault.
  - Web Audio API synthesizer for tactile UI audio cues.
- **⚡ Automatic GitHub Synchronization**:
  - Continuous file watcher and automated safe Git sync tool (`scripts/auto-sync.js`).

---

## 🚀 Quick Start

### 1. Run Local Server
```bash
node server.js
```
Open your browser at **`http://localhost:3000`**

### 2. Auto-Sync with GitHub
To synchronize changes to your GitHub repository in one command:
```bash
node scripts/auto-sync.js --once
```

To run continuous background auto-sync whenever you save files:
```bash
node scripts/auto-sync.js --watch
```

---

## 🔑 Demo Credentials for Testing

| Voter Name | Voter ID | Status | Demo Phone |
|---|---|---|---|
| **Rahul Sharma** | `VTX-8921` | Eligible | `+91 98******42` |
| **Aarav Patel** | `VTX-5102` | Eligible | `+91 98******78` |
| **Sunita Roy** | `VTX-7744` | Eligible | `+91 97******90` |
| **Devraj Singh** | `VTX-1039` | Already Voted *(blocks duplicates)* | `+91 99******55` |

*For Step 2 (OTP), you can enter the code shown in the notification toast or simply type `123456`.*

---

## 📂 Project Structure

```
Vote-X/
├── index.html                   # Master SPA (Landing, Voting Wizard, Admin Dashboard)
├── server.js                    # Built-in lightweight Node.js HTTP server
├── package.json                 # Project configuration & npm scripts
├── .gitignore                   # Security exclusion rules
├── README.md                    # Project documentation
├── css/
│   └── styles.css               # Secure-Flow design tokens, glassmorphism, animations
├── js/
│   ├── app.js                   # Navigation router & global toast notification system
│   ├── voting-flow.js           # 5-Step transactional voting wizard controller
│   ├── admin.js                 # Admin dashboard, analytics, and blockchain explorer
│   ├── state.js                 # Reactive state store with persistent localStorage
│   ├── crypto.js                # Web Crypto SHA-256 ballot sealing and receipt generator
│   ├── shader-bg.js             # WebGL GLSL background energy wave shader
│   ├── three-bg.js              # Three.js 3D Torus knot vault simulation
│   └── audio.js                 # Web Audio API sound synthesizer
└── scripts/
    └── auto-sync.js             # Automatic Git synchronization engine
```

---

## 📄 License
MIT License © 2024 Vote-X.
