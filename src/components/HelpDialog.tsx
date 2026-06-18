import React from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface HelpDialogProps {
  onBack: () => void;
}

export default function HelpDialog({ onBack }: HelpDialogProps) {
  return (
    <div className="flex flex-col items-center h-full w-full max-w-lg mx-auto bg-slate-950 px-6 py-6 relative scanlines overflow-y-auto touch-pan-y">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between z-10 mb-6">
        <button
          onClick={() => {
            sound.playCoin();
            onBack();
          }}
          className="p-2.5 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow"
          id="btn_back_help"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-xl font-bold font-display text-white">RECRUITMENT MANUAL</h1>

        <div className="p-2.5 rounded-full bg-slate-900 text-indigo-400 border border-indigo-950">
          <BookOpen size={16} />
        </div>
      </div>

      <div className="w-full flex-1 z-10 flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1">
        {/* Section 1: Intro */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase mb-2">
            WELCOME, CADET!
          </h2>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Monster hordes have broken the vector field. Your squad of soldiers moves forward on reactive energy roads. To keep them alive, you must guide them through the correct **Math Gates** placed along the route.
          </p>
        </div>

        {/* Section 2: Gate Mechanics */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase mb-3 flex items-center space-x-1.5">
            <span>MATH PORTAL PHYSICS</span>
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 mt-0.5 font-mono">
                +
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-200">Clone Surge & Quantum Weld (Force Buffs)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Passing your squad through a green gate like <span className="text-emerald-400 font-mono text-xs">+15</span> or <span className="text-emerald-400 font-mono text-xs">×3</span> swells your ranks by that amount. Pick these to increase bullet stream volume.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-red-500/11 border border-red-500/80 flex items-center justify-center text-red-400 font-bold text-xs shrink-0 mt-0.5 font-mono">
                -
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-200">Decay Purge & Fission Split (Force Decay)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  Red gates like <span className="text-red-400 font-mono text-xs">-10</span> or <span className="text-red-400 font-mono text-xs">÷2</span> decimate your numbers. If your squad shrinks to <span className="text-red-400 font-bold">0</span>, you will be overrun and defeated instantly!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: High Level Math Algebra */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold font-mono tracking-wider text-orange-400 uppercase mb-2">
            TACTICAL MATH COMPARISONS
          </h2>
          <p className="text-[10px] leading-relaxed text-slate-400 mb-3">
            Do not just rush for multiplication! Compare alternatives based on your current troop size:
          </p>
          <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>If you have 5 soldiers:</span>
              <span><span className="text-emerald-400">+10 gives 15</span> | ×2 gives 10</span>
            </div>
            <div className="h-px bg-slate-900" />
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>If you have 20 soldiers:</span>
              <span>+10 gives 30 | <span className="text-emerald-400">×2 gives 40</span></span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 tracking-tight leading-relaxed mt-2.5">
            Using your calculation skills enables optimal choices. Bad choices cause your troop numbers to suffer, preventing you from ever reaching the boss!
          </p>
        </div>

        {/* Section 4: Equations and Algebra */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold font-mono tracking-wider text-fuchsia-400 uppercase mb-2">
            ALGEBRAIC PROPORTIONS
          </h2>
          <p className="text-[10px] leading-relaxed text-slate-300">
            For advanced generals, selecting **Algebraic Equations** switches math portals to equation format:
          </p>
          <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1 mt-2.5 leading-relaxed">
            <li>
              <span className="font-bold text-fuchsia-400 font-mono">Solve Linear:</span> A gate pair shows <span className="text-fuchsia-300 font-mono">"x = 5"</span> and <span className="text-fuchsia-300 font-mono">"x = 7"</span>. You must select the variable matching the onscreen equation prompt in order to score massive reinforcements!
            </li>
            <li>
              <span className="font-bold text-sky-400 font-mono">Order of Operations:</span> Test expressions like <span className="text-sky-300 font-mono">a + b × c</span>. Remember: Quantum Weld is evaluated BEFORE Clone Surge! Choosing wrong drains your battalion.
            </li>
            <li>
              <span className="font-bold text-yellow-400 font-mono">Odd/Even & Multiples:</span> Dash through Prime Numbers, even coordinates, or multiple targets to double active shields!
            </li>
          </ul>
        </div>

        {/* Section 5: Progression and Gear */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-xs font-bold font-mono tracking-wider text-teal-400 uppercase mb-2">
            BOSS ENCOUNTERS & LEGENDARY LOOT
          </h2>
          <p className="text-[10px] leading-relaxed text-slate-300">
            Reach each level's distance milestone to summon the boss. Maintain high solder counts to spray enough firepower to collapse the giant boss's health.
          </p>
          <p className="text-[10px] leading-relaxed text-slate-300 mt-2">
            Bosses **guarantee a gear card drop** upon collapse (Common, Rare, Epic, or Legendary). Visit your **Soldier Armory** to equip railguns, shields, or warp treads!
          </p>
        </div>
      </div>
    </div>
  );
}
