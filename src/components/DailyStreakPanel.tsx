import React from 'react';
import { Award, Zap, Check, Lock, Gift, Coins, Sparkles, AlertCircle } from 'lucide-react';
import { ColorPalette } from '../types';

interface DailyStreakPanelProps {
  streakCount: number;
  streakClaimedToday: boolean;
  onClaim: () => void;
  palette: ColorPalette;
}

export const STREAK_REWARDS = [
  { day: 1, type: 'coins' as const, value: 150, label: '150 Coins', icon: '🪙', explanation: 'Credits +150 gold coins to your permanent player balance.' },
  { day: 2, type: 'coins' as const, value: 300, label: '300 Coins', icon: '🪙', explanation: 'Credits +300 gold coins to your permanent player balance.' },
  { day: 3, type: 'buff_starting' as const, value: 2, label: '+2 starting clones', icon: '➕', explanation: 'Adds +2 Commencing clone troopers to your next level run. (One-time use buff).' },
  { day: 4, type: 'coins' as const, value: 500, label: '500 Coins', icon: '🪙', explanation: 'Credits +500 gold coins to your permanent player balance.' },
  { day: 5, type: 'buff_damage' as const, value: 1, label: '+1 Bullet damage', icon: '⚡', explanation: 'Adds +1 Bullet Damage boost to your weapons on your next level run. (One-time use buff).' },
  { day: 6, type: 'coins' as const, value: 750, label: '750 Coins', icon: '🪙', explanation: 'Credits +750 gold coins to your permanent player balance.' },
  { day: 7, type: 'mega' as const, value: 1000, label: 'Mega pack', icon: '👑', explanation: 'Supreme bundle! Awards +1000 coins, +3 Starting Clones, and +2 Bullet Damage on your next level run.' }
];

export default function DailyStreakPanel({
  streakCount,
  streakClaimedToday,
  onClaim,
  palette,
}: DailyStreakPanelProps) {
  // Current active reward is streakCount + 1 (unless they claimed today, then it's streakCount)
  const activeDay = streakClaimedToday ? streakCount : (streakCount % 7) + 1;

  return (
    <div className={`p-4 rounded-3xl border-2 shadow-sm ${palette.cardClass} font-mono select-none`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${palette.textClass} flex items-center gap-1`}>
            <span>🔥 PATROL LOGIN STREAK</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[8px] font-bold text-rose-450 text-rose-400">
          <span>STREAK: {streakCount} DAYS</span>
        </div>
      </div>

      <p className="text-[8px] text-slate-400 leading-normal text-left mb-3 font-sans">
        Sign in daily to unlock strategic resource reinforcements. Missing a single day reset guards.
      </p>

      {/* 1D Grid of Days */}
      <div className="grid grid-cols-7 gap-1.5 mb-3.5">
        {STREAK_REWARDS.map((rew) => {
          // Status calculation
          const isClaimed = rew.day <= streakCount && (rew.day < activeDay || streakClaimedToday);
          const isAvailable = rew.day === activeDay && !streakClaimedToday;
          const isLocked = rew.day > activeDay || (rew.day === activeDay && streakClaimedToday && rew.day > streakCount);

          // Visual theme classes
          let bgClass = 'bg-slate-950/40 border-slate-900 text-slate-600';
          let borderGlow = '';

          if (isClaimed) {
            bgClass = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-500';
          } else if (isAvailable) {
            bgClass = 'bg-amber-950/25 border-amber-500 text-amber-300 animate-pulse-slow';
            borderGlow = 'ring-2 ring-amber-500/20';
          } else if (isLocked) {
            bgClass = 'bg-slate-950/60 border-slate-950 text-slate-700';
          }

          return (
            <div key={rew.day} className="relative group flex flex-col">
              <div 
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${bgClass} ${borderGlow} h-14 cursor-help relative overflow-hidden`}
                id={`streak_day_${rew.day}`}
              >
                {/* Day label */}
                <span className="text-[7px] font-bold block mb-1 opacity-80">
                  D{rew.day}
                </span>

                {/* Main Visual Icon / Emblem */}
                <span className="text-sm select-none block mb-0.5 mt-0.5">
                  {isClaimed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-slate-600 mx-auto" />
                  ) : (
                    rew.icon
                  )}
                </span>

                {/* Micro Sublabel */}
                <span className="text-[5.5px] font-extrabold font-mono uppercase block leading-none truncate max-w-full">
                  {rew.type === 'coins' ? `+${rew.value}` : rew.type === 'mega' ? 'MEGA' : 'BUFF'}
                </span>

                {/* Pulse ring for available claims */}
                {isAvailable && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                )}
              </div>

              {/* TOOLTIP ON HOVER DESCRIPTION */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-44 p-2 bg-slate-950 border border-slate-800 rounded-xl text-[8px] text-slate-200 leading-normal text-left shadow-2xl pointer-events-none">
                <div className="font-extrabold text-amber-400 border-b border-rose-900/20 pb-0.5 mb-1 flex justify-between uppercase">
                  <span>Day {rew.day}: {rew.label}</span>
                </div>
                <p className="font-mono text-slate-350">{rew.explanation}</p>
                <div className="mt-1 font-sans text-slate-500 font-bold text-[6.5px] uppercase">
                  {isClaimed ? '✓ ALREADY RECOVERED' : isAvailable ? '⚡ CLAIMABLE RIGHT NOW!' : '🔒 RETRACTED'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      {streakClaimedToday ? (
        <div className="w-full py-2 px-3 rounded-2xl bg-emerald-950/15 border-2 border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase text-center flex items-center justify-center gap-1.5">
          <Check className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
          <span>✓ DAY {streakCount} LOGIN STREAK REWARD SECURED</span>
        </div>
      ) : (
        <button
          onClick={onClaim}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-405 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase text-center flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer shadow-lg shadow-amber-500/10 animate-bounce-slow"
          id="btn_claim_streak_login"
        >
          <Gift className="w-4 h-4 animate-shake text-slate-950 fill-slate-950/20" />
          <span>RECOVER DAY {activeDay} STREAK CLAIM</span>
        </button>
      )}
    </div>
  );
}
