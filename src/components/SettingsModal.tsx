import React from 'react';
import { X, Volume2, Palette, Sparkles, Smile } from 'lucide-react';
import { ColorPalette } from '../types';
import { sound } from '../utils/audio';

export const RETRO_PALETTES: ColorPalette[] = [
  {
    id: 'classic',
    name: '🔴 CLASSIC SLATE',
    bgBgClass: 'bg-slate-950',
    bgMenuClass: 'bg-slate-950',
    cardClass: 'bg-slate-900 border-slate-800',
    borderClass: 'border-slate-800',
    textClass: 'text-slate-100',
    btnClass: 'bg-red-600 border-red-700 text-white hover:bg-red-500',
    hudTextClass: 'text-yellow-400',
    roadColor: '#111827',
    badgeColor: 'bg-red-950/40 border-red-800 text-red-400'
  },
  {
    id: 'gameboy',
    name: '🟢 DMG GREEN',
    bgBgClass: 'bg-[#182312]',
    bgMenuClass: 'bg-[#1a2b16]',
    cardClass: 'bg-[#2a3f24] border-[#446638]',
    borderClass: 'border-[#446638]',
    textClass: 'text-[#9cff33]',
    btnClass: 'bg-[#3d602b] border-[#55883d] text-[#aaff55] hover:bg-[#4d7338]',
    hudTextClass: 'text-[#9cff33]',
    roadColor: '#20321a',
    badgeColor: 'bg-[#121c0e] border-[#446638] text-[#8aff44]'
  },
  {
    id: 'synthwave',
    name: '💗 VAPOR ROYAL',
    bgBgClass: 'bg-[#0b0114]',
    bgMenuClass: 'bg-[#160226]',
    cardClass: 'bg-[#29033f] border-[#ff007f]',
    borderClass: 'border-[#ff007f]',
    textClass: 'text-[#00ffff]',
    btnClass: 'bg-[#ff007f] border-[#ff55aa] text-white hover:bg-[#e60072]',
    hudTextClass: 'text-[#ff007f]',
    roadColor: '#100122',
    badgeColor: 'bg-[#12001e] border-[#ff007f] text-[#ff007f]'
  },
  {
    id: 'virtualboy',
    name: '🔴 COBALT RED',
    bgBgClass: 'bg-black',
    bgMenuClass: 'bg-neutral-950',
    cardClass: 'bg-zinc-950 border-red-700',
    borderClass: 'border-red-700',
    textClass: 'text-red-500',
    btnClass: 'bg-red-700 border-red-800 text-white hover:bg-red-650',
    hudTextClass: 'text-red-400',
    roadColor: '#050000',
    badgeColor: 'bg-red-950/30 border-red-850 text-red-500'
  },
  {
    id: 'amber',
    name: '🟡 AMBER CORE',
    bgBgClass: 'bg-[#0e0a00]',
    bgMenuClass: 'bg-[#1a1200]',
    cardClass: 'bg-[#2a1d00] border-[#f5a623]',
    borderClass: 'border-[#f5a623]',
    textClass: 'text-[#f5a623]',
    btnClass: 'bg-[#f5a623] border-[#ffa100] text-black hover:bg-[#ffb544]',
    hudTextClass: 'text-[#ffdd80]',
    roadColor: '#160d00',
    badgeColor: 'bg-[#2a1d00] border-[#f5a623] text-[#f5a623]'
  }
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  volume: number;
  setVolume: (v: number) => void;
  selectedPalette: string;
  setSelectedPalette: (id: string) => void;
  is3DMode: boolean;
  setIs3DMode: (v: boolean) => void;
  is256BitGraphics: boolean;
  setIs256BitGraphics: (v: boolean) => void;
  isMusicEnabled: boolean;
  setIsMusicEnabled: (v: boolean) => void;
  isSFXEnabled: boolean;
  setIsSFXEnabled: (v: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  volume,
  setVolume,
  selectedPalette,
  setSelectedPalette,
  is3DMode,
  setIs3DMode,
  is256BitGraphics,
  setIs256BitGraphics,
  isMusicEnabled,
  setIsMusicEnabled,
  isSFXEnabled,
  setIsSFXEnabled,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const currentPal = RETRO_PALETTES.find(p => p.id === selectedPalette) || RETRO_PALETTES[0];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
    sound.playCoin();
  };

  const handleSelectPalette = (id: string) => {
    setSelectedPalette(id);
    sound.playCoin();
  };

  return (
    <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      {/* Settings Container Panel wrapped in the designated theme palette class structure! */}
      <div className={`w-full max-w-sm rounded-3xl border-2 p-5 text-left flex flex-col gap-4 shadow-2xl relative ${currentPal.bgMenuClass} ${currentPal.borderClass}`}>
        
        {/* Glow Element */}
        <div className="absolute inset-0 bg-radial-at-t from-yellow-500/[0.04] to-transparent pointer-events-none" />

        {/* Header bar */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Palette className={`w-4 h-4 ${currentPal.hudTextClass}`} />
            <h3 className={`font-mono text-xs font-black uppercase tracking-wider ${currentPal.textClass}`}>
              HQ CALIBRATIONS
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border cursor-pointer hover:scale-105 transition ${currentPal.cardClass}`}
          >
            <X size={12} className={currentPal.textClass} />
          </button>
        </div>

        {/* VOLUME MASTER */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Volume2 size={11} className={currentPal.hudTextClass} /> AUDIO MASTER GAIN
            </span>
            <span className={currentPal.hudTextClass}>{Math.round(volume * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-[7.5px] font-mono text-slate-500">
            <span>MUTED</span>
            <span>STANDARD (80%)</span>
            <span>OVERDRIVE (100%)</span>
          </div>
        </div>

        {/* AUDIO SUBCHANNELS */}
        <div className="flex flex-col gap-2 border-t border-slate-900 pt-1.5">
          <label className="font-mono text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Volume2 size={11} className={currentPal.hudTextClass} /> AUDIO SUBCHANNELS
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Music Toggle */}
            <button
              onClick={() => {
                const newVal = !isMusicEnabled;
                setIsMusicEnabled(newVal);
                sound.setMusicEnabled(newVal);
                sound.playCoin();
              }}
              className={`p-2 rounded-xl border flex flex-col justify-between items-start transition cursor-pointer text-left ${currentPal.cardClass} ${isMusicEnabled ? 'border-indigo-500' : 'opacity-60'}`}
            >
              <span className={`text-[8.2px] font-mono font-black ${isMusicEnabled ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                {isMusicEnabled ? '● MUSIC ON' : '○ MUSIC OFF'}
              </span>
              <span className="text-[7.2px] text-slate-500 font-mono mt-0.5 leading-tight uppercase">
                Synth bgm melodies
              </span>
            </button>

            {/* SFX Toggle */}
            <button
              onClick={() => {
                const newVal = !isSFXEnabled;
                setIsSFXEnabled(newVal);
                sound.setSFXEnabled(newVal);
                if (newVal) {
                  sound.playCoin();
                }
              }}
              className={`p-2 rounded-xl border flex flex-col justify-between items-start transition cursor-pointer text-left ${currentPal.cardClass} ${isSFXEnabled ? 'border-pink-500' : 'opacity-60'}`}
            >
              <span className={`text-[8.2px] font-mono font-black ${isSFXEnabled ? 'text-pink-400 font-bold' : 'text-slate-400'}`}>
                {isSFXEnabled ? '● SFX ON' : '○ SFX OFF'}
              </span>
              <span className="text-[7.2px] text-slate-500 font-mono mt-0.5 leading-tight uppercase">
                Tactical action sounds
              </span>
            </button>
          </div>
        </div>

        {/* GRAPHICS ENGINE CALIBRATIONS */}
        <div className="flex flex-col gap-2 border-y border-slate-805 border-slate-900 py-2.5">
          <label className="font-mono text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles size={11} className={currentPal.hudTextClass} /> GRAPHICS ENGINE CALIBRATIONS
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* 3D Animation toggle */}
            <button
              onClick={() => {
                setIs3DMode(!is3DMode);
                sound.playCoin();
              }}
              className={`p-2 rounded-xl border flex flex-col justify-between items-start transition cursor-pointer text-left ${currentPal.cardClass} ${is3DMode ? 'border-green-500' : 'opacity-60'}`}
            >
              <span className={`text-[8.2px] font-mono font-black ${is3DMode ? 'text-green-400' : 'text-slate-450 text-slate-400'}`}>
                {is3DMode ? '● 3D TILT ON' : '○ 3D TILT OFF'}
              </span>
              <span className="text-[7.2px] text-slate-500 font-mono mt-0.5 leading-tight uppercase">
                Enables realistic tilting & sways
              </span>
            </button>

            {/* 256-Bit graphics toggle */}
            <button
              onClick={() => {
                setIs256BitGraphics(!is256BitGraphics);
                sound.playCoin();
              }}
              className={`p-2 rounded-xl border flex flex-col justify-between items-start transition cursor-pointer text-left ${currentPal.cardClass} ${is256BitGraphics ? 'border-yellow-400' : 'opacity-60'}`}
            >
              <span className={`text-[8.2px] font-mono font-black ${is256BitGraphics ? 'text-yellow-405 text-yellow-500 text-yellow-400' : 'text-slate-450 text-slate-400'}`}>
                {is256BitGraphics ? '● 256-BIT HIGH-FI' : '○ 256-BIT CORES'}
              </span>
              <span className="text-[7.2px] text-slate-500 font-mono mt-0.5 leading-tight uppercase">
                Adds high-fi shader gradients
              </span>
            </button>
          </div>
        </div>

        {/* PALETTE SELECTOR GRID */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles size={11} className={currentPal.hudTextClass} /> RETRO COLOR EMULATION
          </label>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {RETRO_PALETTES.map((pal) => {
              const matches = pal.id === selectedPalette;
              return (
                <button
                  key={pal.id}
                  onClick={() => handleSelectPalette(pal.id)}
                  className={`p-2 rounded-xl border flex justify-between items-center transition cursor-pointer select-none text-left ${pal.bgMenuClass} ${
                    matches ? `border-yellow-405 ring-2 ring-yellow-400/40` : 'border-slate-850 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-[9.5px] font-black uppercase font-mono ${pal.textClass}`}>
                      {pal.name}
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-500 lowercase">
                      restyles entire layout matrix
                    </span>
                  </div>
                  {/* Swatch Previews */}
                  <div className="flex items-center space-x-1 border border-black p-0.5 rounded bg-slate-900 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pal.roadColor }} />
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-600" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-yellow-450 bg-yellow-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MATH FACT LAW TRIVIA */}
        <div className={`p-3 rounded-xl border flex gap-2 items-start ${currentPal.cardClass}`}>
          <Smile className={`w-4 h-4 shrink-0 mt-0.5 ${currentPal.hudTextClass}`} />
          <div className="flex-1 min-w-0">
            <span className={`text-[8.5px] font-black uppercase font-mono tracking-wider ${currentPal.hudTextClass}`}>
              RETRO EMULATION NOTICE
            </span>
            <p className="text-[8px] text-slate-400 leading-normal mt-0.5">
              These systems adjust global rendering tokens. Change at any time during execution to match comfortable room lighting.
            </p>
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={onClose}
          className={`py-2 text-[10px] font-mono font-black uppercase tracking-widest rounded-xl transition cursor-pointer text-center ${currentPal.btnClass}`}
        >
          APPLY CALIBRATIONS
        </button>
      </div>
    </div>
  );
}
