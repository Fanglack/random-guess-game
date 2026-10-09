# 🎮 Cyber-Guess // Random Number Guessing Game

A futuristic, cyber-themed number guessing game built using **Python**, **HTML**, and **CSS**.

---

## 🚀 Features

- **Python Standard Library Backend (`main.py`)**:
  - Zero external packages or dependencies required.
  - REST API endpoints for starting games (`/api/new-game`), evaluating guesses (`/api/guess`), and requesting mathematical hints (`/api/hint`).
  - Proximity calculation (Hot 🔥, Warm ⚡, Cold ❄️) based on target distance.
  - Smart intel hint generator (parity, prime check, divisibility, digit sum).

- **Modern Cyber UI & Design System (`static/style.css`)**:
  - Dark-mode glassmorphism with neon cyan, purple, and emerald glow highlights.
  - Animated mystery vault display with dynamic status indicators.
  - Live Search Window meter narrowing the valid range with every guess.
  - Energy/attempts health bar with visual heart indicators.
  - Real-time telemetry history log color-coded by direction (Too High / Too Low / Bingo).
  - Responsive layout optimized for desktop, tablet, and mobile.

- **Audio & Visual Effects (`static/app.js`)**:
  - Pure Web Audio API procedural sound synthesizer (no external MP3/WAV files needed).
  - Full Canvas Confetti particle explosion upon cracking the vault.
  - Local stats persistence (streak tracker, win rate, best record).

---

## 🕹️ How to Run

1. Open your terminal in the project directory:
   ```bash
   cd /Users/ashmar/Documents/demo
   ```

2. Start the server:
   ```bash
   python3 main.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
