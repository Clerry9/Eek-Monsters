import React from 'react';
import { ArrowLeft, Skull, Shield, Zap, Target } from 'lucide-react';
import { sound } from '../utils/audio';
import { ColorPalette } from '../types';

interface BestiaryPanelProps {
  onBack: () => void;
  palette: ColorPalette;
}

interface MonsterEntry {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  hpRating: string;
  primaryWeakness: string;
  weaknessIcon: string;
  tip: string;
  description: string;
  colorClass: string; // border/bg classes
  accentHex: string;
}

const MONSTERS: MonsterEntry[] = [
  {
    id: 'zombie',
    name: 'MUTATED CHRONO GHOUL',
    emoji: '🧟',
    theme: 'Zombie Outpost (Level 1)',
    hpRating: 'LOW (1x multiplier resilience)',
    primaryWeakness: 'MULTIPLICATION (×)',
    weaknessIcon: '×',
    tip: 'Unleash rapid multiplication gates immediately! Because Chrono Ghouls move in dense clusters, a quick ×2 or ×3 operation creates a bullet stream thick enough to blast them raw.',
    description: 'Slow-moving bio-hacks that rely on visual clutter. Extremely weak to sudden, aggressive troop multiplier leaps.',
    colorClass: 'border-emerald-900 bg-emerald-950/15 text-emerald-400',
    accentHex: '#22c55e'
  },
  {
    id: 'skeleton',
    name: 'SAND CRUSTED DUCHESS',
    emoji: '💀',
    theme: 'Mummy Dunes (Level 2)',
    hpRating: 'MEDIUM (Fast lane layout)',
    primaryWeakness: 'STEADY ADDITION (+)',
    weaknessIcon: '+',
    tip: 'Vulnerable to reliable static addition gates! Use positive sum lanes. When they try to split your paths, addition gates keep your numbers stable and solid.',
    description: 'An ancient animated legion of desiccated bones. They are tactical maneuvers designed to divide your focus.',
    colorClass: 'border-amber-700 bg-amber-950/15 text-amber-500',
    accentHex: '#eab308'
  },
  {
    id: 'fire_elemental',
    name: 'MAGMA SHIELD CRUST',
    emoji: '🔥',
    theme: 'Volcanic Forge (Level 3)',
    hpRating: 'HIGH (Absorbs basic beams)',
    primaryWeakness: 'EXPONENT BLASTS (^)',
    weaknessIcon: '^',
    tip: 'Standard fire waves absorb flat damage. Deploy high-tier exponential formulas or algebraic gates to raise your cohort strength into the hundreds before impact.',
    description: 'Spitfires generated in deep volcanic cracks. They soak up weak scatter shots; only high-volume mathematical explosions breach their density.',
    colorClass: 'border-red-900 bg-red-950/15 text-red-500',
    accentHex: '#ef4444'
  },
  {
    id: 'frost_wolf',
    name: 'POLAR TUNDRA GLADIATOR',
    emoji: '🐺',
    theme: 'Frozen Tundra (Level 4)',
    hpRating: 'VERY HIGH (Slow freeze aura)',
    primaryWeakness: 'TACTICAL DIVISION (÷)',
    weaknessIcon: '÷',
    tip: 'Frozen lanes require lean velocity! Utilize positive split divisions or optimized fraction variables to keep your groups streamlined so they slip past absolute traps.',
    description: 'Predators that emit freezing pulses. They attempt to slow down your army; keeping a responsive and divided line bypasses their frost breath.',
    colorClass: 'border-sky-900 bg-sky-950/15 text-sky-400',
    accentHex: '#38bdf8'
  },
  {
    id: 'glitch_bot',
    name: 'BINARY CORE REAPER',
    emoji: '🤖',
    theme: 'Cyber Grid (Level 5)',
    hpRating: 'EXTREME (Multi-threaded shields)',
    primaryWeakness: 'EQUATION SOLVERS (X)',
    weaknessIcon: 'X',
    tip: 'Glitch bots shield their processors with parity bits! Seek algebraic variable gates (like x + 12 = 20 solving gates) to trigger binary overloads.',
    description: 'Corrupted AI nodes that patrol the neon cyber grids. Require absolute precision math values to dismantle code protection.',
    colorClass: 'border-pink-900 bg-pink-950/15 text-pink-500',
    accentHex: '#ec4899'
  },
  {
    id: 'demon',
    name: 'ABYSSAL DEEP BEHEMOTH',
    emoji: '😈',
    theme: 'Demonic Rift (Level 6)',
    hpRating: 'APOCALYPTIC',
    primaryWeakness: 'EXPONENT MULTIREAP',
    weaknessIcon: '^×',
    tip: 'Behemoths have massive boss hp pools. Stack multiple high-yield multiplication ratios to command over 500+ soldiers to fire bullet bursts that freeze the frame rates.',
    description: 'The final, highest defense tier creatures summoned from hellfire. Absolute maximum mathematically generated firepower is recommended.',
    colorClass: 'border-orange-850 bg-orange-950/15 text-orange-500',
    accentHex: '#f97316'
  }
];

export default function BestiaryPanel({ onBack, palette }: BestiaryPanelProps) {
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
          id="btn_back_bestiary"
        >
          <ArrowLeft size={14} />
        </button>

        <div className="text-center">
          <h1 className="text-base font-black font-mono tracking-widest text-slate-205">TACTICAL BESTIARY</h1>
          <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest">Operator Xenobiology Manual</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-indigo-400">
          <Skull size={14} className="animate-pulse" />
        </div>
      </div>

      {/* Manual Intro */}
      <div className="mb-4 p-3.5 bg-slate-950/70 border border-slate-900 rounded-2xl z-10 text-center">
        <span className="text-[7.5px] font-mono text-indigo-400 block tracking-widest uppercase font-bold mb-1">TACTICAL ADVANTAGE GUIDELINES</span>
        <p className="text-[10px] text-slate-400 leading-normal">
          Defensive matrices of outer sector anomalies respond directly to arithmetic operations. Targeting weak logical triggers guarantees flawless, swift eliminations.
        </p>
      </div>

      {/* Monsters List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 z-10 pb-6 max-h-[460px] touch-pan-y">
        {MONSTERS.map((monster) => {
          return (
            <div 
              key={monster.id}
              className={`p-4 rounded-2xl border-2 hover:border-slate-700 transition duration-200 flex flex-col gap-2 relative bg-slate-950/40`}
              style={{ borderColor: monster.accentHex + '2A' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl p-2 bg-slate-900/90 rounded-xl border border-slate-800 shadow shadow-black">{monster.emoji}</span>
                  <div className="flex flex-col">
                    <h2 className="text-xs font-black font-mono tracking-wider text-slate-100">{monster.name}</h2>
                    <span className="text-[7.5px] font-mono text-slate-400 font-bold uppercase tracking-tight">{monster.theme}</span>
                  </div>
                </div>

                <div className={`p-1 px-2.5 rounded-lg border text-[8px] font-mono font-black uppercase tracking-tight ${monster.colorClass}`}>
                  WEAKNESS: {monster.weaknessIcon}
                </div>
              </div>

              {/* Monster properties */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-slate-950/80 p-1.5 px-2.5 border border-slate-900 rounded-lg text-left">
                  <span className="text-[6.5px] font-mono text-slate-500 block">VITALITY POWER STAT</span>
                  <span className="text-[9px] font-mono font-black text-slate-300">{monster.hpRating}</span>
                </div>
                <div className="bg-slate-950/80 p-1.5 px-2.5 border border-slate-900 rounded-lg text-left">
                  <span className="text-[6.5px] font-mono text-slate-500 block">OPTIMAL COUNTER VALVE</span>
                  <span className="text-[9px] font-mono font-black text-rose-400">{monster.primaryWeakness}</span>
                </div>
              </div>

              {/* Backstory & Info */}
              <p className="text-[10px] text-slate-400 leading-normal italic bg-slate-950/30 p-2 rounded-xl border border-slate-900/60">
                "{monster.description}"
              </p>

              {/* Math guide core tip highlight */}
              <div className="p-2.5 rounded-xl border border-indigo-950/55 bg-indigo-955 bg-indigo-950/15 flex items-start space-x-2">
                <Zap size={10} className="text-yellow-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="flex-1 min-w-0">
                  <span className="text-[7.5px] font-mono font-black text-indigo-400 uppercase tracking-widest block">OPERATOR TACTICAL STRATEGY</span>
                  <p className="text-[9px] text-slate-300 leading-normal mt-0.5">{monster.tip}</p>
                </div>
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
        DISMISS DIRECTIVES
      </button>
    </div>
  );
}
