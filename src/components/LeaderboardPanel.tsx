import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { ColorPalette } from '../types';

interface LeaderboardPanelProps {
  onBack: () => void;
  palette: ColorPalette;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  date: number;
}

// Preseeded authentic legends to populate scores on first load!
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'MATH_WIZARD', score: 2450, date: 1779934110000 },
  { name: 'CHIP_8', score: 1840, date: 1779934105000 },
  { name: 'ATARI_CHAMP', score: 1290, date: 1779934090000 },
  { name: 'SOLDIER_Y', score: 980, date: 1779934080000 },
  { name: 'RETRO_RACER', score: 650, date: 1779934050000 }
];

export default function LeaderboardPanel({ onBack, palette }: LeaderboardPanelProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    try {
      const stored = localStorage.getItem('eek_leaderboard');
      if (stored) {
        setBoard(JSON.parse(stored));
      } else {
        // Seed default legend profiles so the leaderboard looks spectacular immediately!
        localStorage.setItem('eek_leaderboard', JSON.stringify(DEFAULT_LEADERBOARD));
        setBoard(DEFAULT_LEADERBOARD);
      }
    } catch (_) {
      setBoard(DEFAULT_LEADERBOARD);
    }
  };

  const handleResetLeaderboard = () => {
    if (confirm('Clear all recorded high scores on this terminal? It resets to Default Legends.')) {
      try {
        localStorage.setItem('eek_leaderboard', JSON.stringify(DEFAULT_LEADERBOARD));
        setBoard(DEFAULT_LEADERBOARD);
        sound.playGatePass(false);
      } catch (e) {
        console.warn('Reset board failed', e);
      }
    }
  };

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0: return '🥇 FIRST';
      case 1: return '🥈 SECOND';
      case 2: return '🥉 THIRD';
      default: return `🎖️ RANK ${idx + 1}`;
    }
  };

  const getRankColor = (idx: number) => {
    switch (idx) {
      case 0: return 'text-yellow-400 font-extrabold scale-102 bg-yellow-950/25 border-yellow-800/60';
      case 1: return 'text-slate-300 font-bold bg-slate-900/40 border-slate-700/50';
      case 2: return 'text-amber-600 font-bold bg-amber-950/10 border-amber-900/40';
      default: return 'text-slate-450 text-slate-400 bg-transparent border-transparent';
    }
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-lg mx-auto p-5 relative scanlines overflow-y-auto ${palette.bgMenuClass} ${palette.textClass}`}>
      {/* Top Bar Header */}
      <div className="flex items-center justify-between mb-5 z-10 shrink-0 border-b pb-3 border-slate-900">
        <button
          onClick={() => {
            sound.playCoin();
            onBack();
          }}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition flex items-center justify-center shadow"
          id="btn_back_leaderboard"
        >
          <ArrowLeft size={14} />
        </button>

        <div className="text-center">
          <h1 className="text-base font-black font-mono tracking-widest text-slate-205 text-yellow-500 uppercase flex items-center justify-center gap-1.5">
            <Trophy size={14} className="text-yellow-400 text-yellow-500" /> SECTOR HEROES
          </h1>
          <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest block">Session High Score System</span>
        </div>

        <button
          onClick={handleResetLeaderboard}
          title="Reset back to legends"
          className="p-2 rounded-xl bg-slate-950 border border-slate-900 hover:border-red-900 text-slate-500 hover:text-red-400 transition cursor-pointer flex items-center justify-center"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Hero banner summary */}
      <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-900 rounded-2xl z-10 text-center relative overflow-hidden">
        <div className="absolute top-1 right-1 opacity-20"><Sparkles size={18} className="text-yellow-500 animate-pulse" /></div>
        <span className="text-[7.5px] font-mono text-yellow-500 block tracking-widest uppercase font-bold mb-1">HALL OF CHRONO COMMANDERS</span>
        <p className="text-[10px] text-slate-400 leading-normal">
          The top 5 operators recorded on this terminal core. Guided squads mathematically through the deepest level traps.
        </p>
      </div>

      {/* Leaderboard Entries List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 z-10 pb-6 max-h-[460px] touch-pan-y">
        {board.map((entry, idx) => {
          const rankColor = getRankColor(idx);
          const isUser = entry.name !== 'MATH_WIZARD' && entry.name !== 'CHIP_8' && entry.name !== 'ATARI_CHAMP' && entry.name !== 'SOLDIER_Y' && entry.name !== 'RETRO_RACER';
          
          return (
            <div 
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition duration-150 relative bg-slate-950/60 ${rankColor} ${
                isUser ? 'border-indigo-505 border-indigo-500 ring-2 ring-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.15)] bg-slate-900/40' : 'border-slate-900/80'
              }`}
            >
              {isUser && (
                <div className="absolute top-0 right-10 -translate-y-[50%] bg-indigo-600 text-white font-mono text-[6.5px] font-black tracking-widest py-0.5 px-2 rounded-full uppercase">
                  Active Operator
                </div>
              )}

              {/* Rank & Name */}
              <div className="flex items-center space-x-3.5">
                <span className="text-xs font-mono font-black tracking-widest shrink-0 uppercase min-w-[55px]">
                  {getRankBadge(idx)}
                </span>
                <div className="flex flex-col">
                  <span className={`text-xs font-black font-mono tracking-wider ${isUser ? 'text-indigo-400' : 'text-slate-100'}`}>
                    {entry.name}
                  </span>
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-tighter">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Score Value */}
              <div className="text-right flex flex-col justify-center">
                <span className="text-xs font-mono font-black text-slate-200">
                  {entry.score}m
                </span>
                <span className="text-[6.5px] font-mono text-slate-500 uppercase tracking-tight">Record Dist</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Footer Back */}
      <button
        onClick={() => {
          sound.playCoin();
          onBack();
        }}
        className={`w-full py-2.5 mt-2.5 text-[10px] font-mono font-black uppercase tracking-widest rounded-xl transition cursor-pointer text-center ${palette.btnClass}`}
      >
        DISMISS TERMINAL
      </button>
    </div>
  );
}
