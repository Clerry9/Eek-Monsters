import React from 'react';
import { UpgradeState } from '../types';
import { sound } from '../utils/audio';
import { ArrowLeft, Users, Zap, Award, Gauge } from 'lucide-react';

interface UpgradesPanelProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  upgrades: UpgradeState;
  setUpgrades: React.Dispatch<React.SetStateAction<UpgradeState>>;
  onBack: () => void;
}

const MAX_LEVEL = 10;

// Computes costs dynamically
const getUpgradeCost = (key: keyof UpgradeState, level: number): number => {
  const baseCosts = {
    startingSoldiers: 60,
    fireRateLevel: 50,
    damageLevel: 80,
    magnetLevel: 40,
  };
  const multiplier = {
    startingSoldiers: 1.8,
    fireRateLevel: 1.6,
    damageLevel: 2.0,
    magnetLevel: 1.5,
  };
  return Math.floor(baseCosts[key] * Math.pow(multiplier[key], level - 1));
};

export default function UpgradesPanel({
  coins,
  setCoins,
  upgrades,
  setUpgrades,
  onBack,
}: UpgradesPanelProps) {

  const handleUpgrade = (key: keyof UpgradeState) => {
    const currentVal = upgrades[key];
    if (currentVal >= MAX_LEVEL) return;

    const cost = getUpgradeCost(key, currentVal);
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setUpgrades(prev => {
        const next = { ...prev };
        next[key] = currentVal + 1;
        return next;
      });
      sound.playLevelUp();
    } else {
      sound.playGatePass(false); // bad indicator sound
    }
  };

  const currentSoldiersCost = getUpgradeCost('startingSoldiers', upgrades.startingSoldiers);
  const fireRateCost = getUpgradeCost('fireRateLevel', upgrades.fireRateLevel);
  const damageCost = getUpgradeCost('damageLevel', upgrades.damageLevel);
  const magnetCost = getUpgradeCost('magnetLevel', upgrades.magnetLevel);

  const upgradeCards = [
    {
      id: 'startingSoldiers' as keyof UpgradeState,
      title: 'Squad Recruiting',
      statName: 'Base Soldier Group',
      desc: 'Deploy with a larger starting army of math defenders.',
      currentVal: upgrades.startingSoldiers,
      statDisplay: `${upgrades.startingSoldiers} Starting Soldier${upgrades.startingSoldiers > 1 ? 's' : ''}`,
      cost: currentSoldiersCost,
      icon: <Users className="text-blue-400" size={18} />,
    },
    {
      id: 'fireRateLevel' as keyof UpgradeState,
      title: 'Overcharged Rifles',
      statName: 'Shooting Speed',
      desc: 'Reduces firing interval for rapid defense bursts.',
      currentVal: upgrades.fireRateLevel,
      statDisplay: `+${(upgrades.fireRateLevel - 1) * 10}% Firing Rate`,
      cost: fireRateCost,
      icon: <Gauge className="text-yellow-400" size={18} />,
    },
    {
      id: 'damageLevel' as keyof UpgradeState,
      title: 'Thermite Rounds',
      statName: 'Bullet Kinetic Strike',
      desc: 'Increases bullet fire damage to break high-tier shields.',
      currentVal: upgrades.damageLevel,
      statDisplay: `${upgrades.damageLevel} Base Damage`,
      cost: damageCost,
      icon: <Zap className="text-red-400" size={18} />,
    },
    {
      id: 'magnetLevel' as keyof UpgradeState,
      title: 'Loot Gravity Sinks',
      statName: 'Coin Pull Radius',
      desc: 'Expand magnetic field to lock onto and grab distant gold.',
      currentVal: upgrades.magnetLevel,
      statDisplay: `+${(upgrades.magnetLevel - 1) * 20}% Magnet Range`,
      cost: magnetCost,
      icon: <Award className="text-teal-400" size={18} />,
    },
  ];

  return (
    <div className="flex flex-col items-center h-full w-full max-w-lg mx-auto bg-slate-950 px-6 py-6 relative scanlines overflow-y-auto touch-pan-y">
      {/* Top Banner */}
      <div className="w-full flex items-center justify-between z-10 mb-6">
        <button
          onClick={() => {
            sound.playCoin();
            onBack();
          }}
          className="p-2.5 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow"
          id="btn_back_upgrades"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-xl font-bold font-display text-white">RECRUIT BARRACKS</h1>

        {/* Currency Tracker */}
        <div className="flex items-center space-x-1.5 bg-yellow-950/40 border border-yellow-800 px-3 py-1.5 rounded-full shadow shadow-yellow-950/20">
          <span className="text-yellow-400 text-sm">🪙</span>
          <span className="font-mono text-xs font-bold text-yellow-400">{coins}</span>
        </div>
      </div>

      <p className="text-slate-400 text-xs text-center max-w-sm mb-6 z-10 font-sans tracking-wide">
        Invest in research to permanently augment your military unit. Strengthen base statistics prior to venturing on high level monster routes.
      </p>

      {/* List of Upgrades */}
      <div className="w-full flex flex-col gap-3.5 z-10 mb-6 max-h-[460px] overflow-y-auto pr-1">
        {upgradeCards.map((upg) => {
          const isMax = upg.currentVal >= MAX_LEVEL;
          const canAfford = coins >= upg.cost && !isMax;

          return (
            <div
              key={upg.id}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg hover:border-slate-700/80 transition duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {upg.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide">
                      {upg.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] leading-relaxed">
                      {upg.desc}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-teal-400 block bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded">
                    Lv. {upg.currentVal} / {MAX_LEVEL}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                    {upg.statDisplay}
                  </span>
                </div>
              </div>

              {/* Progress Bar (slots representation) */}
              <div className="flex gap-1.5 w-full my-3">
                {Array.from({ length: MAX_LEVEL }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full ${
                      idx < upg.currentVal
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Purchase button */}
              <div className="flex justify-end pt-1">
                {isMax ? (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 py-2 px-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 select-none uppercase tracking-widest leading-none">
                    FULLY DEVELOPED
                  </span>
                ) : (
                  <button
                    onClick={() => handleUpgrade(upg.id)}
                    className={`py-2 px-4 rounded-xl font-mono text-xs font-bold leading-none select-none tracking-wider cursor-pointer border flex items-center space-x-1.5 transition-all ${
                      canAfford
                        ? 'bg-yellow-500 text-yellow-950 border-yellow-300 active:scale-95 shadow hover:bg-yellow-400 shadow-yellow-950/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 pointer-events-none'
                    }`}
                  >
                    <span>TRAIN UNIT</span>
                    <span>•</span>
                    <span>🪙 {upg.cost}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Warning */}
      <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-mono mt-auto z-10">
        LOOT POWERFUL WEAPONS DIRECTLY FROM BOSSES
      </p>
    </div>
  );
}
