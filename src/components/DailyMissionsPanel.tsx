import React from 'react';
import { DailyMission, ColorPalette } from '../types';
import { Target, Award, Sparkles, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface DailyMissionsPanelProps {
  missions: DailyMission[];
  onClaim: (id: string) => void;
  palette: ColorPalette;
  activeBuffs: {
    damageBoost: number;
    extraStarting: number;
  };
}

export default function DailyMissionsPanel({
  missions,
  onClaim,
  palette,
  activeBuffs,
}: DailyMissionsPanelProps) {
  return (
    <div className={`p-4 rounded-3xl border-2 shadow-sm ${palette.cardClass}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className={`font-mono text-xs font-black uppercase tracking-wider ${palette.textClass}`}>
            DAILY MATH SCOPES
          </h3>
        </div>
        <span className="text-[7px] font-mono text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded uppercase">
          RESETS DAILY
        </span>
      </div>

      {/* Active Temporary Buff Indicator HUD */}
      {(activeBuffs.damageBoost > 0 || activeBuffs.extraStarting > 0) && (
        <div className="mb-3.5 p-2 bg-emerald-950/20 border-2 border-emerald-500/30 rounded-xl flex items-center space-x-2 animate-pulse">
          <Zap size={13} className="text-emerald-400 fill-emerald-500/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[8px] font-black font-mono text-emerald-400 block uppercase tracking-wide">
              ⚡ COMPLETED BUFF LAUNCHED
            </span>
            <span className="text-[7.5px] text-slate-400 block leading-tight font-sans">
              ACTIVE FOR NEXT DEPLOY: {activeBuffs.damageBoost > 0 ? `+${activeBuffs.damageBoost} Bullet Damage ` : ''}
              {activeBuffs.extraStarting > 0 ? `+${activeBuffs.extraStarting} Starting Soldiers ` : ''}
              (Consumed when deploying squad!)
            </span>
          </div>
        </div>
      )}

      {/* Missions Stack Grid */}
      <div className="flex flex-col gap-2.5">
        {missions.map((mission) => {
          const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));
          const canClaim = mission.completed && !mission.claimed;
          const isClaimed = mission.claimed;

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-2xl border flex flex-col gap-2 relative overflow-hidden transition-all duration-300 ${
                canClaim ? 'bg-[#152e1f]/35 border-emerald-500/50 shadow-md shadow-emerald-950/10' : 'bg-slate-950/30 border-slate-900'
              }`}
            >
              {/* Top Row content */}
              <div className="flex justify-between items-start gap-1">
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[10px] font-black uppercase tracking-normal leading-tight flex items-center gap-1 shrink-0 ${canClaim ? 'text-emerald-400' : palette.textClass}`}>
                    {mission.title}
                  </h4>
                  <p className="text-[8px] text-slate-400 leading-normal font-sans mt-0.5">
                    {mission.description}
                  </p>
                </div>

                {/* Claim state button */}
                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-[8px] font-bold text-slate-600 bg-slate-900 border border-slate-950 px-2 py-1 rounded-lg uppercase select-none">
                      ✓ CLAIMED
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => onClaim(mission.id)}
                      className="text-[8px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30 px-3 py-1 rounded-lg transition active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      CLAIM GIFT!
                    </button>
                  ) : (
                    <span className="text-[8.5px] font-mono text-slate-500">
                      {mission.current}/{mission.target}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar slider */}
              <div className="w-full flex items-center space-x-2">
                <div className="flex-grow bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      canClaim ? 'bg-emerald-500' : isClaimed ? 'bg-slate-700' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[7.5px] font-mono text-slate-500 font-bold w-6 text-right">
                  {progressPercent}%
                </span>
              </div>

              {/* Reward pill indicator with hover explanation tooltip */}
              <div className="relative group w-fit mt-0.5">
                <div className="flex items-center space-x-1 text-[7.5px] font-mono uppercase bg-slate-900/60 border border-slate-850 px-2 py-1 rounded-lg w-fit cursor-help">
                  <Award size={10} className="text-yellow-400" />
                  <span className="text-slate-400">Gift:</span>
                  <span className="text-yellow-400 font-bold">
                    {mission.rewardType === 'coins' ? `+🪙${mission.rewardValue} Coins` : ''}
                    {mission.rewardType === 'buff_damage' ? `⚡ +${mission.rewardValue} Damage Buff` : ''}
                    {mission.rewardType === 'buff_starting' ? `➕ +${mission.rewardValue} Starting Forces` : ''}
                  </span>
                </div>

                {/* VISUAL HOVER TOOLTIP CARD */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-52 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[8px] font-mono text-slate-300 leading-normal shadow-2xl pointer-events-none animate-fade-in">
                  <div className="font-extrabold text-yellow-400 border-b border-rose-950/40 pb-1 mb-1 flex items-center justify-between">
                    <span>🎁 REWARD MECHANICAL DETAILS</span>
                    <span className="text-[6.5px] text-slate-500">INFO</span>
                  </div>
                  {mission.rewardType === 'coins' && (
                    <p>Adds <span className="text-white font-bold">{mission.rewardValue} Coins</span> directly to your permanently saved player balance. Invest in powerful gear and upgrades in the operator store.</p>
                  )}
                  {mission.rewardType === 'buff_damage' && (
                    <p>Grants a temporary +<span className="text-white font-bold">{mission.rewardValue} Bullet Damage</span> booster to all weapons. Consumed upon loading up your next level patrol run (one-time use).</p>
                  )}
                  {mission.rewardType === 'buff_starting' && (
                    <p>Deploys +<span className="text-white font-bold">{mission.rewardValue} Commencing Soldiers</span> to reinforce you from the start. Buff is consumed when your next run commences (one-time use).</p>
                  )}
                  <div className="mt-1.5 border-t border-slate-900 pt-1 text-slate-500 text-[6.5px] font-bold uppercase">
                    HOVER TO REVEAL REINFORCEMENTS
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
