class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private masterVolLevel = 0.8;
  private musicEnabled = true;
  private sfxEnabled = true;
  private musicInterval: any = null;
  private musicStep = 0;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio API not supported', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.masterVolLevel = 0;
      this.stopMusic();
    } else {
      this.masterVolLevel = 0.8;
      this.startMusic();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  setVolume(level: number) {
    this.masterVolLevel = level;
    this.muted = level <= 0.01;
    if (this.muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  getVolume() {
    return this.masterVolLevel;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  setSFXEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  isSFXEnabled() {
    return this.sfxEnabled;
  }

  startMusic() {
    this.init();
    if (!this.musicEnabled || this.muted || !this.ctx) return;
    if (this.musicInterval) return;

    // A beautiful retro chiptune hypnotic arpeggio bassline:
    // G3 -> B3 -> D3 -> C3 -> G3 -> D3 -> E3 -> A3 (repeating)
    const bassline = [196.00, 246.94, 146.83, 130.81, 196.00, 146.83, 164.81, 220.00];
    this.musicStep = 0;

    this.musicInterval = setInterval(() => {
      this.init();
      if (!this.musicEnabled || this.muted || !this.ctx) return;
      if (this.ctx.state === 'suspended') return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Rhythmic tri-wave low-fi synth bass
        osc.type = 'triangle';
        const note = bassline[this.musicStep % bassline.length];
        osc.frequency.setValueAtTime(note, this.ctx.currentTime);

        const musicVol = 0.03 * this.masterVolLevel;
        gain.gain.setValueAtTime(musicVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001 * this.masterVolLevel, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.42);

        // Subtly inject retro hi-hat tick elements on off-beats
        if (this.musicStep % 2 === 1) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          hatOsc.type = 'sawtooth';
          hatOsc.frequency.setValueAtTime(7000, this.ctx.currentTime);
          
          hatGain.gain.setValueAtTime(0.004 * this.masterVolLevel, this.ctx.currentTime);
          hatGain.gain.exponentialRampToValueAtTime(0.0001 * this.masterVolLevel, this.ctx.currentTime + 0.04);
          
          hatOsc.connect(hatGain);
          hatGain.connect(this.ctx.destination);
          hatOsc.start();
          hatOsc.stop(this.ctx.currentTime + 0.05);
        }

        this.musicStep++;
      } catch (e) {
        console.warn('Synth music loop error', e);
      }
    }, 455);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playShoot() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08 * this.masterVolLevel, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.masterVolLevel, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playCoin() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Classic double-pitch arpeggio for coin pickup
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.07 * this.masterVolLevel, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005 * this.masterVolLevel, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playGatePass(isGood: boolean) {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isGood) {
      // Upward arpeggio chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, this.ctx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, this.ctx.currentTime + 0.06); // E4
      osc.frequency.setValueAtTime(392.00, this.ctx.currentTime + 0.12); // G4
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime + 0.18); // C5
      
      gain.gain.setValueAtTime(0.12 * this.masterVolLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * this.masterVolLevel, this.ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } else {
      // Sad buzz chord
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.12 * this.masterVolLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * this.masterVolLevel, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    }
  }

  playMonsterHit() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    // Direct noise representation or square pulse wave
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08 * this.masterVolLevel, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.masterVolLevel, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playMonsterKill() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(130, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1 * this.masterVolLevel, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005 * this.masterVolLevel, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  playBossSiren() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t + i * 0.4);
      osc.frequency.linearRampToValueAtTime(600, t + i * 0.4 + 0.2);
      osc.frequency.linearRampToValueAtTime(300, t + i * 0.4 + 0.4);

      gain.gain.setValueAtTime(0, t + i * 0.4);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolLevel, t + i * 0.4 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.masterVolLevel, t + i * 0.4 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.4);
      osc.stop(t + i * 0.4 + 0.45);
    }
  }

  playLevelUp() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const t = this.ctx.currentTime;
    // Heroic fanfarish chord: G4 -> C5 -> E5 -> G5
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolLevel, t + idx * 0.08 + 0.03);
      gain.gain.linearRampToValueAtTime(0.05 * this.masterVolLevel, t + idx * 0.08 + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.masterVolLevel, t + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.55);
    });
  }

  playDefeat() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const t = this.ctx.currentTime;
    const notes = [293.66, 277.18, 261.63, 220.00]; // D4, C#4, C4, A3
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);

      gain.gain.setValueAtTime(0.1 * this.masterVolLevel, t + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.05 * this.masterVolLevel, t + idx * 0.15 + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.masterVolLevel, t + idx * 0.15 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.45);
    });
  }

  playVictory() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const t = this.ctx.currentTime;
    
    // An 8-bit triumphant fanfare melody using a retro 'square' wave
    const melody = [
      { freq: 523.25, time: 0.0, dur: 0.12, type: 'square' },  // C5
      { freq: 659.25, time: 0.12, dur: 0.12, type: 'square' }, // E5
      { freq: 783.99, time: 0.24, dur: 0.12, type: 'square' }, // G5
      { freq: 1046.50, time: 0.36, dur: 0.24, type: 'square' },// C6
      { freq: 880.00, time: 0.60, dur: 0.12, type: 'square' }, // A5
      { freq: 1046.50, time: 0.72, dur: 0.48, type: 'square' } // C6
    ];

    const harmony = [
      { freq: 261.63, time: 0.0, dur: 0.12, type: 'triangle' }, // C4 bass
      { freq: 329.63, time: 0.12, dur: 0.12, type: 'triangle' },// E4
      { freq: 392.00, time: 0.24, dur: 0.12, type: 'triangle' },// G4
      { freq: 523.25, time: 0.36, dur: 0.24, type: 'triangle' },// C5
      { freq: 440.00, time: 0.60, dur: 0.12, type: 'triangle' },// A4
      { freq: 523.25, time: 0.72, dur: 0.48, type: 'triangle' } // C5
    ];

    const playNote = (n: { freq: number, time: number, dur: number, type: string }, isHarmony: boolean) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = n.type as OscillatorType;
      osc.frequency.setValueAtTime(n.freq, t + n.time);

      const baseVolume = (isHarmony ? 0.04 : 0.08) * this.masterVolLevel;
      gain.gain.setValueAtTime(0, t + n.time);
      gain.gain.linearRampToValueAtTime(baseVolume, t + n.time + 0.01);
      gain.gain.setValueAtTime(baseVolume, t + n.time + n.dur - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.masterVolLevel, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur);
    };

    melody.forEach(n => playNote(n, false));
    harmony.forEach(n => playNote(n, true));
  }

  playGearDrop() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.08 * this.masterVolLevel, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005 * this.masterVolLevel, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playBossCardRevealFanfare() {
    this.init();
    if (this.muted || !this.ctx || !this.sfxEnabled) return;

    const t = this.ctx.currentTime;
    
    // A rapid rising retro 8-bit fanfare arpeggio
    const notesAndTimes = [
      { freq: 440.00, delay: 0.0, dur: 0.08 },  // A4
      { freq: 554.37, delay: 0.08, dur: 0.08 }, // C#5
      { freq: 659.25, delay: 0.16, dur: 0.08 }, // E5
      { freq: 880.00, delay: 0.24, dur: 0.16 }, // A5
      { freq: 1108.73, delay: 0.40, dur: 0.16 },// C#6
      { freq: 1318.51, delay: 0.56, dur: 0.40 } // E6 (final held triumphant note)
    ];

    notesAndTimes.forEach(note => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.freq, t + note.delay);

      // Add a sub-octave triangle voice for rich fat retro sound!
      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(note.freq / 2, t + note.delay);

      gain.gain.setValueAtTime(0, t + note.delay);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterVolLevel, t + note.delay + 0.01);
      gain.gain.linearRampToValueAtTime(0.06 * this.masterVolLevel, t + note.delay + note.dur - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001 * this.masterVolLevel, t + note.delay + note.dur);

      osc.connect(gain);
      oscSub.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + note.delay);
      oscSub.start(t + note.delay);
      osc.stop(t + note.delay + note.dur);
      oscSub.stop(t + note.delay + note.dur);
    });
  }
}

export const sound = new SoundEngine();
