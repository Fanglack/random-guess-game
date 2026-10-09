/* ==========================================================================
   CYBER-GUESS // CLIENT CONTROLLER & AUDIO SYNTHESIZER
   ========================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // WEB AUDIO API SYNTHESIZER (Retro-futuristic sound effects)
  // ---------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && typeof AudioContext !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // audio muted or restricted
      }
    }

    playClick() {
      this.playTone(800, 'triangle', 0.04, 0.08);
    }

    playStep() {
      this.playTone(600, 'sine', 0.05, 0.06);
    }

    playLow() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    playHigh() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    playHint() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.08), idx * 70);
        });
      } catch (e) {}
    }

    playWin() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        chords.forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.15), idx * 110);
        });
      } catch (e) {}
    }

    playGameOver() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const chord = [300, 260, 220, 180];
        chord.forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'sawtooth', 0.22, 0.1), idx * 100);
        });
      } catch (e) {}
    }
  }

  // ---------------------------------------------------------------------------
  // CONFETTI SYSTEM
  // ---------------------------------------------------------------------------
  class ConfettiCannon {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.running = false;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst() {
      this.particles = [];
      const colors = ['#00f0ff', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];
      const count = 120;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.7) * 16,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }
      if (!this.running) {
        this.running = true;
        this.animate();
      }
    }

    animate() {
      if (!this.particles.length) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.running = false;
        return;
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // ---------------------------------------------------------------------------
  // GAME CONTROLLER
  // ---------------------------------------------------------------------------
  const sounds = new SoundEngine();
  const confetti = new ConfettiCannon('confetti-canvas');

  const state = {
    mode: 'medium',
    min: 1,
    max: 100,
    currentMinBound: 1,
    currentMaxBound: 100,
    maxAttempts: 7,
    attemptsLeft: 7,
    hintsLeft: 3,
    gameOver: false,
    history: [],
    startTime: Date.now(),
    stats: {
      played: 0,
      wins: 0,
      streak: 0,
      bestStreak: 0
    }
  };

  // DOM Elements
  const DOM = {
    // Mode
    modePills: document.querySelectorAll('.mode-pill'),
    customPanel: document.getElementById('custom-range-panel'),
    customMin: document.getElementById('custom-min'),
    customMax: document.getElementById('custom-max'),
    customAttempts: document.getElementById('custom-attempts'),
    btnApplyCustom: document.getElementById('btn-apply-custom'),

    // Vault
    vaultBox: document.getElementById('vault-box'),
    vaultDisplay: document.getElementById('vault-display'),
    vaultStatus: document.getElementById('vault-status'),

    // Attempts
    attemptsText: document.getElementById('attempts-text'),
    attemptsBar: document.getElementById('attempts-bar'),
    heartsContainer: document.getElementById('hearts-container'),

    // Range Tracker
    rangeText: document.getElementById('range-text'),
    boundMin: document.getElementById('bound-min'),
    boundMax: document.getElementById('bound-max'),
    rangeWindow: document.getElementById('range-window'),
    guessPin: document.getElementById('guess-pin'),

    // Feedback
    feedbackCard: document.getElementById('feedback-card'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackDetail: document.getElementById('feedback-detail'),

    // Input & Form
    guessForm: document.getElementById('guess-form'),
    guessInput: document.getElementById('guess-input'),
    btnStepDown: document.getElementById('btn-step-down'),
    btnStepUp: document.getElementById('btn-step-up'),
    btnSubmit: document.getElementById('btn-submit-guess'),
    guessInputWrapper: document.querySelector('.guess-input-wrapper'),

    // Hints
    btnHint: document.getElementById('btn-hint'),
    hintCount: document.getElementById('hint-count'),
    hintDisplay: document.getElementById('hint-display'),
    hintMessage: document.getElementById('hint-message'),

    // History
    historyList: document.getElementById('history-list'),
    historyEmpty: document.getElementById('history-empty'),
    historyCount: document.getElementById('history-count'),

    // Stats bar & Modal
    statStreak: document.getElementById('stat-streak'),
    statWins: document.getElementById('stat-wins'),
    statBest: document.getElementById('stat-best'),
    btnStatsToggle: document.getElementById('btn-stats-toggle'),
    statsModal: document.getElementById('stats-modal'),
    btnCloseStats: document.getElementById('btn-close-stats'),
    btnResetStats: document.getElementById('btn-reset-stats'),
    statModalPlayed: document.getElementById('stat-modal-played'),
    statModalWins: document.getElementById('stat-modal-wins'),
    statModalWinrate: document.getElementById('stat-modal-winrate'),
    statModalStreak: document.getElementById('stat-modal-streak'),

    // Endgame Modal
    endgameModal: document.getElementById('endgame-modal'),
    modalBadge: document.getElementById('modal-badge'),
    modalIcon: document.getElementById('modal-icon'),
    modalTitle: document.getElementById('modal-title'),
    modalDesc: document.getElementById('modal-desc'),
    modalSecretCode: document.getElementById('modal-secret-code'),
    modalAttemptsUsed: document.getElementById('modal-attempts-used'),
    modalScore: document.getElementById('modal-score'),
    btnModalRestart: document.getElementById('btn-modal-restart'),

    // Header buttons
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    btnNewGame: document.getElementById('btn-new-game')
  };

  // ---------------------------------------------------------------------------
  // LOCAL STORAGE & STATS
  // ---------------------------------------------------------------------------
  function loadStats() {
    try {
      const stored = localStorage.getItem('cyberguess_stats');
      if (stored) {
        state.stats = JSON.parse(stored);
      }
    } catch (e) {}
    updateStatsDisplay();
  }

  function saveStats() {
    try {
      localStorage.setItem('cyberguess_stats', JSON.stringify(state.stats));
    } catch (e) {}
    updateStatsDisplay();
  }

  function updateStatsDisplay() {
    DOM.statStreak.textContent = state.stats.streak;
    DOM.statWins.textContent = state.stats.wins;
    DOM.statBest.textContent = state.stats.bestStreak;

    DOM.statModalPlayed.textContent = state.stats.played;
    DOM.statModalWins.textContent = state.stats.wins;
    const rate = state.stats.played > 0 
      ? Math.round((state.stats.wins / state.stats.played) * 100) 
      : 0;
    DOM.statModalWinrate.textContent = `${rate}%`;
    DOM.statModalStreak.textContent = state.stats.streak;
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION & NEW GAME
  // ---------------------------------------------------------------------------
  async function startNewGame() {
    sounds.playClick();
    state.gameOver = false;
    state.history = [];
    state.startTime = Date.now();
    state.hintsLeft = 3;

    // Reset range bounds
    state.currentMinBound = state.min;
    state.currentMaxBound = state.max;

    // Call Python backend
    try {
      const res = await fetch('/api/new-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          min: state.min,
          max: state.max,
          max_attempts: state.maxAttempts
        })
      });
      const data = await res.json();
      state.maxAttempts = data.max_attempts;
      state.attemptsLeft = data.max_attempts;
    } catch (err) {
      console.warn('Backend unavailable, running client fallback:', err);
      // Fallback fallback if disconnected
    }

    // UI Reset
    DOM.vaultBox.className = 'vault-box';
    DOM.vaultDisplay.textContent = '?';
    DOM.vaultStatus.textContent = 'VAULT LOCKED';
    DOM.vaultStatus.style.color = '';

    DOM.guessInput.value = '';
    DOM.guessInput.disabled = false;
    DOM.guessInput.min = state.min;
    DOM.guessInput.max = state.max;
    DOM.guessInput.focus();

    DOM.btnSubmit.disabled = false;
    DOM.btnHint.disabled = false;
    DOM.hintCount.textContent = `${state.hintsLeft} left`;
    DOM.hintDisplay.classList.add('hidden');

    DOM.feedbackCard.className = 'feedback-card';
    DOM.feedbackIcon.textContent = '🎯';
    DOM.feedbackTitle.textContent = 'AWAITING INPUT';
    DOM.feedbackDetail.textContent = `Target is hidden between ${state.min} and ${state.max}. Make your move!`;

    DOM.historyList.innerHTML = '';
    DOM.historyList.appendChild(DOM.historyEmpty);
    DOM.historyCount.textContent = '0';
    DOM.historyEmpty.style.display = 'block';

    DOM.guessPin.style.display = 'none';
    DOM.endgameModal.classList.add('hidden');

    updateAttemptsUI();
    updateRangeMeter();
  }

  function updateAttemptsUI() {
    DOM.attemptsText.textContent = `${state.attemptsLeft} / ${state.maxAttempts}`;
    const pct = Math.max(0, (state.attemptsLeft / state.maxAttempts) * 100);
    DOM.attemptsBar.style.width = `${pct}%`;

    DOM.attemptsBar.className = 'attempts-bar-fill';
    if (pct <= 30) {
      DOM.attemptsBar.classList.add('danger');
    } else if (pct <= 60) {
      DOM.attemptsBar.classList.add('warning');
    }

    // Render Hearts
    DOM.heartsContainer.innerHTML = '';
    for (let i = 0; i < state.maxAttempts; i++) {
      const heart = document.createElement('span');
      heart.className = `heart-pip ${i >= state.attemptsLeft ? 'lost' : ''}`;
      heart.textContent = '❤️';
      DOM.heartsContainer.appendChild(heart);
    }
  }

  function updateRangeMeter() {
    DOM.boundMin.textContent = state.min;
    DOM.boundMax.textContent = state.max;
    DOM.rangeText.textContent = `${state.currentMinBound} ━━━━ ? ━━━━ ${state.currentMaxBound}`;

    const totalRange = state.max - state.min;
    const leftPct = ((state.currentMinBound - state.min) / totalRange) * 100;
    const rightPct = ((state.currentMaxBound - state.min) / totalRange) * 100;
    const widthPct = Math.max(2, rightPct - leftPct);

    DOM.rangeWindow.style.left = `${leftPct}%`;
    DOM.rangeWindow.style.width = `${widthPct}%`;
  }

  // ---------------------------------------------------------------------------
  // GUESS SUBMISSION & VERIFICATION
  // ---------------------------------------------------------------------------
  async function submitGuess() {
    if (state.gameOver) return;

    const guessVal = parseInt(DOM.guessInput.value, 10);
    if (isNaN(guessVal)) {
      DOM.guessInputWrapper.classList.add('shake');
      setTimeout(() => DOM.guessInputWrapper.classList.remove('shake'), 400);
      return;
    }

    if (guessVal < state.min || guessVal > state.max) {
      sounds.playLow();
      DOM.feedbackCard.className = 'feedback-card warm';
      DOM.feedbackIcon.textContent = '⚠️';
      DOM.feedbackTitle.textContent = 'OUT OF BOUNDS';
      DOM.feedbackDetail.textContent = `Number must be between ${state.min} and ${state.max}!`;
      DOM.guessInputWrapper.classList.add('shake');
      setTimeout(() => DOM.guessInputWrapper.classList.remove('shake'), 400);
      return;
    }

    // Call Python backend
    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: guessVal })
      });
      const data = await res.json();
      processGuessResult(data, guessVal);
    } catch (err) {
      console.error('Error submitting guess:', err);
    }
  }

  function processGuessResult(data, guess) {
    state.attemptsLeft = data.attempts_left;
    updateAttemptsUI();

    // Position guess pin on range meter
    const pinPct = Math.min(100, Math.max(0, ((guess - state.min) / (state.max - state.min)) * 100));
    DOM.guessPin.style.display = 'block';
    DOM.guessPin.style.left = `${pinPct}%`;

    // Add to telemetry history
    addHistoryItem(guess, data.direction, data.difference, data.result === 'win');

    if (data.result === 'win') {
      handleWin(data.secret, data.score);
    } else if (data.result === 'lose') {
      handleLoss(data.secret);
    } else {
      // Game continues: update search boundaries
      if (data.direction === 'higher') {
        sounds.playHigh();
        state.currentMinBound = Math.max(state.currentMinBound, guess + 1);
        DOM.feedbackCard.className = `feedback-card ${data.proximity || 'cold'}`;
        DOM.feedbackIcon.textContent = '⬆️';
        DOM.feedbackTitle.textContent = 'TOO LOW! AIM HIGHER';
        DOM.feedbackDetail.textContent = data.message || `The target is higher than ${guess}.`;
      } else {
        sounds.playLow();
        state.currentMaxBound = Math.min(state.currentMaxBound, guess - 1);
        DOM.feedbackCard.className = `feedback-card ${data.proximity || 'cold'}`;
        DOM.feedbackIcon.textContent = '⬇️';
        DOM.feedbackTitle.textContent = 'TOO HIGH! AIM LOWER';
        DOM.feedbackDetail.textContent = data.message || `The target is lower than ${guess}.`;
      }
      updateRangeMeter();

      // Shake animation on error
      DOM.guessInputWrapper.classList.add('shake');
      setTimeout(() => DOM.guessInputWrapper.classList.remove('shake'), 400);
    }

    DOM.guessInput.value = '';
    DOM.guessInput.focus();
  }

  function addHistoryItem(guess, direction, diff, isWin) {
    DOM.historyEmpty.style.display = 'none';
    const count = DOM.historyList.querySelectorAll('.history-item').length + 1;
    DOM.historyCount.textContent = count;

    const item = document.createElement('div');
    item.className = 'history-item';

    let badgeClass = 'badge-low';
    let badgeText = '⬆️ Higher';
    if (isWin) {
      item.classList.add('correct');
      badgeClass = 'badge-win';
      badgeText = '🎯 BINGO';
    } else if (direction === 'lower') {
      item.classList.add('too-high');
      badgeClass = 'badge-high';
      badgeText = '⬇️ Lower';
    } else {
      item.classList.add('too-low');
    }

    item.innerHTML = `
      <div class="hist-left">
        <span class="hist-index">#${count}</span>
        <span class="hist-guess">${guess}</span>
      </div>
      <div class="hist-badge ${badgeClass}">
        ${badgeText}
      </div>
    `;

    DOM.historyList.insertBefore(item, DOM.historyList.firstChild);
  }

  function handleWin(secret, score) {
    state.gameOver = true;
    sounds.playWin();
    confetti.burst();

    // Vault animation
    DOM.vaultBox.classList.add('unlocked');
    DOM.vaultDisplay.textContent = secret;
    DOM.vaultStatus.textContent = 'ACCESS GRANTED';

    DOM.feedbackCard.className = 'feedback-card win';
    DOM.feedbackIcon.textContent = '🎉';
    DOM.feedbackTitle.textContent = 'VAULT UNLOCKED!';
    DOM.feedbackDetail.textContent = `Sensational codebreaking! Secret was indeed ${secret}.`;

    DOM.guessInput.disabled = true;
    DOM.btnSubmit.disabled = true;

    // Update Stats
    state.stats.played++;
    state.stats.wins++;
    state.stats.streak++;
    if (state.stats.streak > state.stats.bestStreak) {
      state.stats.bestStreak = state.stats.streak;
    }
    saveStats();

    // Show Victory Modal
    setTimeout(() => {
      DOM.modalBadge.textContent = 'MISSION ACCOMPLISHED';
      DOM.modalBadge.style.color = 'var(--neon-emerald)';
      DOM.modalIcon.textContent = '🏆';
      DOM.modalTitle.textContent = 'VAULT BREACHED!';
      DOM.modalDesc.textContent = `You uncovered the code ${secret} with ${state.maxAttempts - state.attemptsLeft} attempts remaining!`;
      DOM.modalSecretCode.textContent = secret;
      DOM.modalAttemptsUsed.textContent = `${state.maxAttempts - state.attemptsLeft} / ${state.maxAttempts}`;
      DOM.modalScore.textContent = `${score || 950} pts`;
      DOM.endgameModal.classList.remove('hidden');
    }, 1100);
  }

  function handleLoss(secret) {
    state.gameOver = true;
    sounds.playGameOver();

    // Vault failure state
    DOM.vaultBox.classList.add('breached-fail');
    DOM.vaultDisplay.textContent = secret;
    DOM.vaultStatus.textContent = 'SYSTEM LOCKOUT';
    DOM.vaultStatus.style.color = 'var(--neon-rose)';

    DOM.feedbackCard.className = 'feedback-card hot';
    DOM.feedbackIcon.textContent = '💀';
    DOM.feedbackTitle.textContent = 'ENERGY DEPLETED!';
    DOM.feedbackDetail.textContent = `Security protocols engaged. The hidden code was ${secret}.`;

    DOM.guessInput.disabled = true;
    DOM.btnSubmit.disabled = true;

    // Update Stats
    state.stats.played++;
    state.stats.streak = 0;
    saveStats();

    // Show Defeat Modal
    setTimeout(() => {
      DOM.modalBadge.textContent = 'LOCKOUT FAILURE';
      DOM.modalBadge.style.color = 'var(--neon-rose)';
      DOM.modalIcon.textContent = '🔒';
      DOM.modalTitle.textContent = 'SYSTEM LOCKED!';
      DOM.modalDesc.textContent = `You ran out of attempts! The elusive code was ${secret}.`;
      DOM.modalSecretCode.textContent = secret;
      DOM.modalAttemptsUsed.textContent = `${state.maxAttempts} / ${state.maxAttempts}`;
      DOM.modalScore.textContent = `0 pts`;
      DOM.endgameModal.classList.remove('hidden');
    }, 1100);
  }

  // ---------------------------------------------------------------------------
  // INTEL HINTS SYSTEM
  // ---------------------------------------------------------------------------
  async function requestHint() {
    if (state.gameOver || state.hintsLeft <= 0) return;
    sounds.playHint();

    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      state.hintsLeft--;
      DOM.hintCount.textContent = `${state.hintsLeft} left`;
      if (state.hintsLeft <= 0) DOM.btnHint.disabled = true;

      DOM.hintMessage.textContent = data.hint || 'Target frequency encrypted.';
      DOM.hintDisplay.classList.remove('hidden');
    } catch (err) {
      console.error('Error fetching hint:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // DIFFICULTY / MODE SELECTION
  // ---------------------------------------------------------------------------
  function setMode(modeKey) {
    sounds.playClick();
    state.mode = modeKey;

    DOM.modePills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === modeKey);
    });

    if (modeKey === 'easy') {
      state.min = 1;
      state.max = 50;
      state.maxAttempts = 10;
      DOM.customPanel.classList.add('hidden');
      startNewGame();
    } else if (modeKey === 'medium') {
      state.min = 1;
      state.max = 100;
      state.maxAttempts = 7;
      DOM.customPanel.classList.add('hidden');
      startNewGame();
    } else if (modeKey === 'hard') {
      state.min = 1;
      state.max = 250;
      state.maxAttempts = 5;
      DOM.customPanel.classList.add('hidden');
      startNewGame();
    } else if (modeKey === 'custom') {
      DOM.customPanel.classList.remove('hidden');
    }
  }

  function applyCustomMode() {
    const minVal = parseInt(DOM.customMin.value, 10);
    const maxVal = parseInt(DOM.customMax.value, 10);
    const attemptsVal = parseInt(DOM.customAttempts.value, 10);

    if (isNaN(minVal) || isNaN(maxVal) || minVal >= maxVal) {
      alert('Please enter valid range where Min is less than Max.');
      return;
    }

    state.min = Math.max(1, minVal);
    state.max = maxVal;
    state.maxAttempts = Math.min(30, Math.max(2, attemptsVal || 8));
    DOM.customPanel.classList.add('hidden');
    startNewGame();
  }

  // ---------------------------------------------------------------------------
  // EVENT LISTENERS
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Mode switcher
    DOM.modePills.forEach(pill => {
      pill.addEventListener('click', () => setMode(pill.dataset.mode));
    });
    DOM.btnApplyCustom.addEventListener('click', applyCustomMode);

    // Form submission
    DOM.guessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitGuess();
    });

    // Step Buttons (+ / -)
    DOM.btnStepDown.addEventListener('click', () => {
      sounds.playStep();
      const current = parseInt(DOM.guessInput.value, 10) || Math.floor((state.currentMinBound + state.currentMaxBound) / 2);
      DOM.guessInput.value = Math.max(state.min, current - 1);
      DOM.guessInput.focus();
    });

    DOM.btnStepUp.addEventListener('click', () => {
      sounds.playStep();
      const current = parseInt(DOM.guessInput.value, 10) || Math.floor((state.currentMinBound + state.currentMaxBound) / 2);
      DOM.guessInput.value = Math.min(state.max, current + 1);
      DOM.guessInput.focus();
    });

    // Hints
    DOM.btnHint.addEventListener('click', requestHint);

    // Sound toggle
    DOM.btnSoundToggle.addEventListener('click', () => {
      const active = sounds.toggle();
      DOM.soundIcon.textContent = active ? '🔊' : '🔇';
    });

    // Reset & New Game
    DOM.btnNewGame.addEventListener('click', startNewGame);
    DOM.btnModalRestart.addEventListener('click', () => {
      DOM.endgameModal.classList.add('hidden');
      startNewGame();
    });

    // Stats modal
    DOM.btnStatsToggle.addEventListener('click', () => {
      sounds.playClick();
      DOM.statsModal.classList.remove('hidden');
    });
    DOM.btnCloseStats.addEventListener('click', () => {
      DOM.statsModal.classList.add('hidden');
    });
    DOM.btnResetStats.addEventListener('click', () => {
      if (confirm('Reset all saved game statistics?')) {
        state.stats = { played: 0, wins: 0, streak: 0, bestStreak: 0 };
        saveStats();
      }
    });

    // Close modals on escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        DOM.statsModal.classList.add('hidden');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // BOOTSTRAP
  // ---------------------------------------------------------------------------
  loadStats();
  setupEventListeners();
  startNewGame();

})();
