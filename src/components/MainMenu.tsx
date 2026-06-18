import React, { useState, useEffect } from 'react';
import { MathMode, MathDifficulty, ColorPalette, UserProfile } from '../types';
import { CHARACTERS } from '../data';
import { sound } from '../utils/audio';
import { Play, Shield, TrendingUp, HelpCircle, Volume2, VolumeX, Flame, Sparkles, HelpCircle as ShopIcon, ShoppingCart, Lock, Settings, LogOut, Music } from 'lucide-react';

interface MainMenuProps {
  mathMode: MathMode;
  setMathMode: (mode: MathMode) => void;
  mathDifficulty: MathDifficulty;
  setMathDifficulty: (diff: MathDifficulty) => void;
  characterId: string;
  setCharacterId: (id: string) => void;
  highScore: number;
  unlockedAura: boolean;
  extraTroopsExpiry?: number;
  onShowShop: () => void;
  onStart: () => void;
  onShowUpgrades: () => void;
  onShowArmory: () => void;
  onShowHelp: () => void;
  onOpenSettings: () => void;
  palette: ColorPalette;
  dailyMissionsComponent?: React.ReactNode;
  dailyStreakComponent?: React.ReactNode;
  currentUserProfile?: UserProfile | null;
  onSignOut?: () => void;
  onShowBestiary: () => void;
  onShowLeaderboard: () => void;
  onShowReports: () => void;
}

export default function MainMenu({
  mathMode,
  setMathMode,
  mathDifficulty,
  setMathDifficulty,
  characterId,
  setCharacterId,
  highScore,
  unlockedAura,
  extraTroopsExpiry,
  onShowShop,
  onStart,
  onShowUpgrades,
  onShowArmory,
  onShowHelp,
  onOpenSettings,
  palette,
  dailyMissionsComponent,
  dailyStreakComponent,
  currentUserProfile,
  onSignOut,
  onShowBestiary,
  onShowLeaderboard,
  onShowReports,
}: MainMenuProps) {
  const [muted, setMuted] = useState(sound.isMuted());
  const [musicOn, setMusicOn] = useState(sound.isMusicEnabled());
  const [sfxOn, setSfxOn] = useState(sound.isSFXEnabled());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!extraTroopsExpiry) {
      setTimeRemaining(0);
      return;
    }
    const update = () => {
      setTimeRemaining(Math.max(0, extraTroopsExpiry - Date.now()));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [extraTroopsExpiry]);

  const formatTime = (ms: number) => {
    const totSec = Math.ceil(ms / 1000);
    const min = Math.floor(totSec / 60);
    const sec = totSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const toggleMute = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    setMusicOn(!isMuted && sound.isMusicEnabled());
    setSfxOn(!isMuted && sound.isSFXEnabled());
    sound.playCoin();
  };

  const toggleMusic = () => {
    const nextVal = !sound.isMusicEnabled();
    sound.setMusicEnabled(nextVal);
    setMusicOn(nextVal);
    if (nextVal) {
      sound.playCoin();
    }
  };

  const toggleSFX = () => {
    const nextVal = !sound.isSFXEnabled();
    sound.setSFXEnabled(nextVal);
    setSfxOn(nextVal);
    if (nextVal) {
      sound.playCoin();
    }
  };

  const handleSelectMode = (mode: MathMode) => {
    setMathMode(mode);
    sound.playCoin();
  };

  const handleSelectDifficulty = (diff: MathDifficulty) => {
    setMathDifficulty(diff);
    sound.playCoin();
  };

  const handleSelectCharacter = (char: typeof CHARACTERS[0]) => {
    if (char.isPremium && !unlockedAura) {
      sound.playGatePass(false); // play alert chime
      onShowShop(); // Redirect straight to support shop
      return;
    }
    setCharacterId(char.id);
    sound.playCoin();
  };

  const modesList: { id: MathMode; label: string; desc: string; icon: string; difficulty: string; color: string }[] = [
    {
      id: 'addition',
      label: 'CLONE SURGE',
      desc: 'Replicate soldier cells and swell your platoon.',
      icon: '🧬',
      difficulty: 'Addition',
      color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-emerald-950/20',
    },
    {
      id: 'subtraction',
      label: 'DECAY PURGE',
      desc: 'Evade radioactivity forces depleting your squad.',
      icon: '☣️',
      difficulty: 'Subtraction',
      color: 'border-orange-500 bg-orange-950/40 text-orange-300 shadow-orange-950/20',
    },
    {
      id: 'multiplication',
      label: 'QUANTUM WELD',
      desc: 'Multiply clone troops exponentially to pierce waves.',
      icon: '💥',
      difficulty: 'Multiplication',
      color: 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-indigo-950/20',
    },
    {
      id: 'division',
      label: 'FISSION SPLIT',
      desc: 'Calculate safe divisions for core survival.',
      icon: '🌀',
      difficulty: 'Division',
      color: 'border-rose-500 bg-rose-950/40 text-rose-300 shadow-rose-950/20',
    },
    {
      id: 'mixed',
      label: 'CHAOS VECTOR',
      desc: 'Multi operations mixed into a chaotic blitz run!',
      icon: '⚡',
      difficulty: 'Mixed Combos',
      color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-cyan-950/20',
    },
    {
      id: 'algebraic',
      label: 'EQUATION CORE',
      desc: 'Solve simple algebraic x variable values to unlock gate buffs.',
      icon: '💻',
      difficulty: 'Equations',
      color: 'border-fuchsia-500 bg-fuchsia-950/40 text-fuchsia-300 shadow-fuchsia-950/20',
    },
    {
      id: 'fractions',
      label: 'FRACTION RECTOR',
      desc: 'Evaluate clean fractions and parts to multiply your soldier ranks.',
      icon: '📊',
      difficulty: 'Fractions',
      color: 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-amber-950/20',
    },
    {
      id: 'percentages',
      label: 'PERCENT MATRIX',
      desc: 'Calculate percentage modifiers to calibrate custom power grids.',
      icon: '📈',
      difficulty: 'Percentages',
      color: 'border-sky-500 bg-sky-950/40 text-sky-300 shadow-sky-950/20',
    },
    {
      id: 'exponents',
      label: 'EXPONENT PULSE',
      desc: 'Deploy power exponents and square roots for massive shockwaves.',
      icon: '🔺',
      difficulty: 'Powers & Roots',
      color: 'border-violet-500 bg-violet-950/40 text-violet-300 shadow-violet-950/20',
    },
  ];

  const selectedChar = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];

  return (
    <div className={`flex flex-col h-full w-full max-w-lg mx-auto relative select-none ${palette.bgBgClass}`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-at-t from-red-950/10 via-transparent to-transparent pointer-events-none" />

      {/* 1. FIXED TOP BAR (Arcs score HUD & Audio controls) */}
      <div className={`w-full flex justify-between items-center px-4 py-3 border-b z-20 shrink-0 ${palette.bgMenuClass} ${palette.borderClass}`}>
        <div className="flex items-center space-x-1.5">
          <div className={`flex items-center space-x-1 border px-2 py-1.5 rounded-lg shadow ${palette.cardClass}`}>
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="font-mono text-[8px] font-bold text-slate-400 uppercase">HI:</span>
            <span className={`font-mono text-[9px] font-black ${palette.hudTextClass}`}>{highScore}M</span>
          </div>

          {currentUserProfile && (
            <button
              onClick={() => {
                sound.playGatePass(false);
                if (onSignOut) onSignOut();
              }}
              className={`flex items-center space-x-1 border px-2 py-1.5 rounded-lg shadow cursor-pointer hover:border-red-500 hover:bg-red-950/20 transition ${palette.cardClass}`}
              title="Click to switch/logout operator"
            >
              <span className="text-[10px] shrink-0">{currentUserProfile.avatar}</span>
              <span className="font-mono text-[8px] font-black uppercase text-slate-300 truncate max-w-[70px]">
                {currentUserProfile.username}
              </span>
              <LogOut size={9} className="text-red-500 shrink-0" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-1.5">
          {/* Settings gear trigger calibration button */}
          <button
            onClick={() => {
              sound.playCoin();
              onOpenSettings();
            }}
            className={`p-1.5 rounded-lg border hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1 font-mono text-[8px] font-bold ${palette.cardClass} ${palette.textClass}`}
            id="btn_settings"
            title="Configure calibrations and themes"
          >
            <Settings size={10} className="animate-spin-slow text-yellow-400" />
            SETTINGS
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-1.5 px-2 rounded-lg border hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1 font-mono text-[8px] font-black ${
              musicOn 
                ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' 
                : 'border-slate-800 bg-slate-950/40 text-slate-500'
            }`}
            id="btn_toggle_music"
            title="Toggle Retro Chiptune Music"
          >
            <Music size={10} className={`${musicOn ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>MUSIC: {musicOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* SFX Toggle */}
          <button
            onClick={toggleSFX}
            className={`p-1.5 px-2 rounded-lg border hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1 font-mono text-[8px] font-black ${
              sfxOn 
                ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400' 
                : 'border-slate-800 bg-slate-950/40 text-slate-500'
            }`}
            id="btn_toggle_sfx"
            title="Toggle Sound Effects"
          >
            {sfxOn ? <Volume2 size={10} /> : <VolumeX size={10} />}
            <span>SFX: {sfxOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. MIDDLE SCROLLABLE BODY (Math grids, configurations, and heroes list) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 z-15 min-h-0 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Title Logo banner */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded border border-red-800 bg-red-950/80 mb-1 animate-pulse">
            <Flame size={10} className="text-red-550 text-red-500" />
            <span className="text-[7.5px] font-mono tracking-wider font-extrabold text-red-400">MATH RETRO FORCE 64-BIT</span>
          </div>
          <h1 className={`text-2xl font-black drop-shadow-[2px_2px_0px_#000] uppercase tracking-tighter ${palette.hudTextClass}`}>
            EEK <span className="text-yellow-400">MONSTERS</span>
          </h1>
          <p className="text-slate-400 text-[9.5px] max-w-xs leading-normal font-mono">
            Calculate gates, collect rapid fire loot, and repel zombie hordes!
          </p>
        </div>

        {/* TIME-BASED POWER-UP LIVE HUD DISPLAY */}
        {timeRemaining > 0 && (
          <div className="p-3.5 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-505 border-indigo-500/40 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md animate-pulse text-center select-none font-mono">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-extrabold uppercase tracking-widest text-[10px]">
              <span>🎁</span>
              <span>EXTRA STARTING TROOPS ACTIVE</span>
              <span>🎁</span>
            </div>
            <p className="text-[9px] text-slate-400">
              Active level reward grants you <span className="text-white font-black">+2 Extra Heroes</span> on starting next patrols!
            </p>
            <div className="px-2.5 py-1 bg-slate-950 border border-indigo-500/30 text-[9.5px] font-bold text-yellow-405 rounded-xl flex items-center gap-1.5 mt-1">
              <span>⌛ BUFF TIME REMAINING:</span>
              <span className="text-yellow-400 text-xs font-black">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        )}

        {/* DAILY LOGIN STREAK SYSTEM */}
        {dailyStreakComponent}

        {/* DAILY MISSIONS HUD PANEL AT TOP OF MENUS */}
        {dailyMissionsComponent}

        {/* CHOOSE MATH AREA */}
        <div className="flex flex-col">
          <h2 className={`font-mono text-[10px] font-bold tracking-tight mb-2 text-left uppercase flex items-center gap-1 ${palette.textClass}`}>
            <span className="text-yellow-500">▶</span> CHOOSE MATH AREA
          </h2>
          
          <div className="grid grid-cols-2 gap-2">
            {modesList.map((mode) => {
              const isSelected = mathMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className={`flex flex-col p-2.5 rounded-xl border select-none text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-yellow-400 bg-slate-900 text-yellow-300 ring-1 ring-yellow-400/20 scale-[1.01] shadow-[2px_2px_0px_#ca8a04]'
                      : 'border-slate-900 bg-slate-900/40 text-slate-400 hover:border-slate-800 hover:bg-slate-900'
                  }`}
                  id={`mode_${mode.id}`}
                >
                  <div className="flex items-center space-x-1.5 w-full">
                    <span className="text-sm shrink-0" role="img" aria-label={mode.label}>
                      {mode.icon}
                    </span>
                    <span className={`text-[10px] uppercase font-black truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {mode.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full mt-1.5">
                    <span className="text-[8px] font-mono text-slate-500 truncate leading-none">
                      {mode.difficulty}
                    </span>
                    <span className={`text-[8px] font-mono font-bold ${
                      isSelected ? 'text-yellow-400 animate-pulse' : 'text-slate-600'
                    }`}>
                      {isSelected ? "● ACTIVE" : "SELECT"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHALLENGE DIFFICULTY */}
        <div className="flex flex-col bg-slate-900/20 p-3 rounded-2xl border border-slate-900/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
              <Sparkles size={10} className="text-amber-400 animate-pulse" /> CHALLENGE DIFFICULTY
            </span>
            <span className="text-[8px] font-mono text-slate-505">Affects size coefficient</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as MathDifficulty[]).map((diff) => {
              const isActive = mathDifficulty === diff;
              let themeColor = 'border-slate-900 bg-slate-950/40 text-slate-400';
              if (isActive) {
                if (diff === 'easy') themeColor = 'border-emerald-500 bg-emerald-950/35 text-emerald-400 ring-1 ring-emerald-500/20 font-bold';
                else if (diff === 'medium') themeColor = 'border-amber-500 bg-amber-950/35 text-amber-400 ring-1 ring-amber-500/20 font-bold';
                else themeColor = 'border-red-500 bg-red-950/35 text-red-500 ring-1 ring-red-500/20 font-bold';
              }
              return (
                <button
                  key={diff}
                  onClick={() => handleSelectDifficulty(diff)}
                  className={`py-1.5 px-3 rounded-lg border text-center font-mono text-[9px] tracking-wide uppercase transition cursor-pointer select-none ${themeColor}`}
                  id={`diff_${diff}`}
                >
                  {diff === 'easy' ? '🟢 EASY' : diff === 'medium' ? '🟡 MEDIUM' : '🔴 HARD'}
                </button>
              );
            })}
          </div>
        </div>

        {/* MATH DIAGNOSTICS & PROGRESS REPORT */}
        <button
          onClick={() => {
            sound.playCoin();
            if (onShowReports) onShowReports();
          }}
          className="w-full p-3.5 rounded-2xl border border-rose-900 bg-rose-950/10 hover:bg-rose-950/25 hover:border-rose-800 flex items-center justify-between text-left cursor-pointer transition select-none"
          id="btn_menu_reports"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-tight flex items-center gap-1">
              <span>📈 AFTER ACTION REPORT & DIAGNOSTICS</span>
            </span>
            <span className="text-[7.5px] font-mono mt-0.5 leading-none uppercase text-slate-400">MATH SKILLS REPORT CARD FOR STUDENTS & PARENTS</span>
          </div>
          <span className="text-sm shrink-0">📊</span>
        </button>

        {/* TACTICAL INTELLIGENCE / LEADERBOARD */}
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <button
            onClick={() => {
              sound.playCoin();
              onShowBestiary();
            }}
            className="p-3.5 rounded-2xl border border-indigo-950 bg-indigo-950/20 hover:bg-indigo-950/40 hover:border-indigo-850 flex items-center justify-between text-left cursor-pointer transition select-none"
            id="btn_menu_bestiary"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-tight">📖 BESTIARY</span>
              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5 leading-none uppercase">TACTICAL MATH TIPS</span>
            </div>
            <span className="text-sm shrink-0">🧟</span>
          </button>

          <button
            onClick={() => {
              sound.playCoin();
              onShowLeaderboard();
            }}
            className="p-3.5 rounded-2xl border border-yellow-950 bg-yellow-950/10 hover:bg-yellow-950/25 hover:border-yellow-850 flex items-center justify-between text-left cursor-pointer transition select-none"
            id="btn_menu_leaderboard"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-black text-yellow-500 uppercase tracking-tight">🏆 LEADERBOARD</span>
              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5 leading-none uppercase">TERMS TOP HEROES</span>
            </div>
            <span className="text-sm shrink-0">👑</span>
          </button>
        </div>

        {/* DEPLOY TEAM HERO */}
        <div className="flex flex-col">
          <h2 className="font-mono text-[10px] text-slate-400 font-bold tracking-tight mb-2.5 text-left uppercase flex justify-between items-center">
            <span>👥 DEPLOY A CHAR TEAM HERO - ({CHARACTERS.length} TOTAL)</span>
          </h2>
          
          <div className="grid grid-cols-7 gap-1.5">
            {CHARACTERS.map((char) => {
              const isSelected = characterId === char.id;
              const isLocked = char.isPremium && !unlockedAura;
              
              return (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`py-1.5 aspect-square flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? `border-yellow-400 bg-gradient-to-b ${char.color}/20 ring-1 ring-yellow-405`
                      : 'border-slate-900 bg-slate-900/30 hover:bg-slate-900 hover:border-slate-800'
                  }`}
                  title={char.isPremium ? `${char.name} (Premium Supporter Hero)` : char.name}
                >
                  <span className="text-xl mb-1 relative flex items-center justify-center">
                    {char.avatar}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center border border-pink-700/60 max-w-sm">
                        <Lock size={10} className="text-pink-400" />
                      </div>
                    )}
                  </span>
                  
                  <span className="text-[7px] font-mono leading-none font-black tracking-tighter truncate w-full text-center px-0.5 uppercase">
                    {char.name.split(' ')[0]}
                  </span>

                  {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 w-2.5 h-2.5 rounded-full border border-slate-950 flex items-center justify-center text-[5.5px] text-black font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected character details card block */}
          <div className="mt-2.5 p-3 bg-slate-900/60 border border-slate-850/80 rounded-2xl flex items-start space-x-3 text-left">
            <div className="text-2xl p-2 bg-slate-955/80 border border-slate-800 rounded-xl relative">
              {selectedChar.avatar}
              {selectedChar.isPremium && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[5px] font-bold px-0.5 rounded uppercase">VIP</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black font-display text-white uppercase truncate flex justify-between items-center">
                <span>{selectedChar.name}</span>
                <span className="text-[8px] text-slate-500 font-mono tracking-tight font-normal lowercase font-sans">({selectedChar.role})</span>
              </h4>
              <p className="text-[9px] text-cyan-400 mt-1 font-mono leading-normal">
                {selectedChar.advantageDesc}
              </p>
              {selectedChar.isPremium && !unlockedAura && (
                <div className="mt-1.5 text-[8.5px] text-pink-400 font-bold font-mono animate-pulse flex items-center space-x-1">
                  <span>🔒 locked: Unlock this premium game changer in the Supporter Shop!</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. FIXED BOTTOM FOOTER (Core Deploy triggers and navigation tabs) */}
      <div className="w-full bg-slate-950 border-t border-slate-900 p-4 z-20 shrink-0 flex flex-col gap-3">
        {/* Core CTA */}
        <div>
          <button
            onClick={onStart}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 font-mono text-[10.5px] tracking-widest text-white rounded-xl border-b-4 border-black hover:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase select-none shadow-md shadow-black"
            id="btn_start_game"
          >
            <Play size={12} fill="currentColor" className="text-yellow-300" />
            <span className="text-yellow-300 font-black">DEPLOY TROOPS</span>
          </button>
        </div>

        {/* 4 Column Tab Actions */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onShowUpgrades}
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900/40 hover:bg-slate-800/85 border border-slate-900 rounded-xl text-slate-400 hover:text-yellow-400 transition cursor-pointer select-none"
            id="btn_menu_upgrades"
          >
            <TrendingUp size={14} className="text-yellow-400 mb-0.5" />
            <span className="text-[8px] font-mono tracking-wide leading-none font-extrabold text-slate-300">RECRUITS</span>
          </button>

          <button
            onClick={onShowArmory}
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900/40 hover:bg-slate-800/85 border border-slate-900 rounded-xl text-slate-400 hover:text-teal-400 transition cursor-pointer select-none"
            id="btn_menu_armory"
          >
            <Shield size={14} className="text-teal-400 mb-0.5" />
            <span className="text-[8px] font-mono tracking-wide leading-none font-extrabold text-slate-300">ARMORY</span>
          </button>

          {/* Monetized Support Shop Tab Button */}
          <button
            onClick={onShowShop}
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-pink-955/20 hover:bg-pink-900/30 border border-pink-900/40 rounded-xl text-slate-400 hover:text-pink-400 transition cursor-pointer select-none animate-pulse"
            id="btn_menu_shop"
          >
            <ShoppingCart size={14} className="text-pink-400 mb-0.5" />
            <span className="text-[8px] font-mono tracking-wide leading-none font-extrabold text-pink-300">🪙 PRO SHOP</span>
          </button>

          <button
            onClick={onShowHelp}
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900/40 hover:bg-slate-800/85 border border-slate-900 rounded-xl text-slate-400 hover:text-indigo-400 transition cursor-pointer select-none"
            id="btn_menu_help"
          >
            <HelpCircle size={14} className="text-indigo-400 mb-0.5" />
            <span className="text-[8px] font-mono tracking-wide leading-none font-extrabold text-slate-300">MANUAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
