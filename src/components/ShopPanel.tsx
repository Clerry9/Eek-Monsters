import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { ArrowLeft, Coins, Sparkles, Shield, User, Zap, CreditCard, Check, ShieldCheck, Loader2 } from 'lucide-react';

interface ShopPanelProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  unlockedAura: boolean;
  setUnlockedAura: (unlocked: boolean) => void;
  isDoubleCoins: boolean;
  setIsDoubleCoins: (enabled: boolean) => void;
  hasPremiumMagnet: boolean;
  setHasPremiumMagnet: (enabled: boolean) => void;
  onBack: () => void;
}

interface ShopItem {
  id: string;
  title: string;
  tag: string;
  price: string;
  rawPrice: number;
  desc: string;
  icon: string;
  color: string;
  perk: string;
  purchased: boolean;
}

export default function ShopPanel({
  coins,
  setCoins,
  unlockedAura,
  setUnlockedAura,
  isDoubleCoins,
  setIsDoubleCoins,
  hasPremiumMagnet,
  setHasPremiumMagnet,
  onBack,
}: ShopPanelProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [checkoutPhase, setCheckoutPhase] = useState<'IDLE' | 'PAYING' | 'SUCCESS'>('IDLE');
  const [paymentOption, setPaymentOption] = useState<'CARD' | 'GPAY'>('CARD');

  const shopItems: ShopItem[] = [
    {
      id: 'coin_pack',
      title: 'Mega Tribute Pack',
      tag: '🪙 BEST VALUE',
      price: '$1.99',
      rawPrice: 1.99,
      desc: 'Instantly deposits 🪙 5,000 Gold Coins directly into your military barracks for infinite squad upgrades.',
      icon: '🪙',
      color: 'from-yellow-500 to-amber-600 text-yellow-400 border-yellow-500/45',
      perk: '+5,000 gold coins instantly (can buy multiple times!)',
      purchased: false,
    },
    {
      id: 'armory_cache',
      title: 'Armory Golden Cache',
      tag: '🔥 EPIC COIN VAULT',
      price: '$2.99',
      rawPrice: 2.99,
      desc: 'Instantly grants 🪙 10,000 Gold Coins to your platoon reserves. Spend them on Titanium Cases, Quantum Reactors, or Supreme Omega vaults inside the Soldier Armory!',
      icon: '🛡️',
      color: 'from-amber-500 via-amber-450 to-yellow-605 text-yellow-350 border-amber-500/50',
      perk: '+10,000 gold coins immediately for armory chest openings!',
      purchased: false,
    },
    {
      id: 'unlock_aura',
      title: 'Aura the Archmage',
      tag: '✨ LORE VIP HERO',
      price: '$4.99',
      rawPrice: 4.99,
      desc: 'Unlocks the celestial sorceress who uses quantum magic to change bad gates (subtraction/division) into neutral or positive buffs!.',
      icon: '✨',
      color: 'from-purple-500 via-pink-500 to-indigo-600 text-pink-400 border-pink-500/40',
      perk: 'Unlocks VIP Aura + Celestial Void gate-flip spell',
      purchased: unlockedAura,
    },
    {
      id: 'double_gold',
      title: 'Double Tribute Pass',
      tag: '💸 PERMANENT MULTIPLIER',
      price: '$3.99',
      rawPrice: 3.99,
      desc: 'Double all normal zombie resource tappings and level victory gold tappings forever. Stacks with equipped midas armor.',
      icon: '💸',
      color: 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/40',
      perk: 'Double zombie and level gold rewards forever',
      purchased: isDoubleCoins,
    },
    {
      id: 'mega_magnet',
      title: 'Singularity Magnet Ring',
      tag: '🧲 SWEEP PULL',
      price: '$2.99',
      rawPrice: 2.99,
      desc: 'Permanently boost starting clone magnetism by 300%. Pull whole roads of solid gold coins straight into your group.',
      icon: '🧲',
      color: 'from-cyan-500 to-blue-600 text-cyan-400 border-cyan-500/40',
      perk: 'Permanently increases starting magnet pull radius 3x',
      purchased: hasPremiumMagnet,
    },
  ];

  const handleOpenCheckout = (item: ShopItem) => {
    if (item.purchased) return;
    sound.playCoin();
    setSelectedItem(item);
    setCheckoutPhase('IDLE');
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;
    
    // Simulate App Store Loading state
    sound.playCoin();
    setCheckoutPhase('PAYING');

    setTimeout(() => {
      // Apply the purchase effect
      if (selectedItem.id === 'coin_pack') {
        setCoins(prev => prev + 5000);
      } else if (selectedItem.id === 'armory_cache') {
        setCoins(prev => prev + 10000);
      } else if (selectedItem.id === 'unlock_aura') {
        setUnlockedAura(true);
      } else if (selectedItem.id === 'double_gold') {
        setIsDoubleCoins(true);
      } else if (selectedItem.id === 'mega_magnet') {
        setHasPremiumMagnet(true);
      }

      setCheckoutPhase('SUCCESS');
      sound.playLevelUp(); // Play positive level up sound on completion
    }, 1800);
  };

  const handleCloseCheckout = () => {
    sound.playCoin();
    setSelectedItem(null);
    setCheckoutPhase('IDLE');
  };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-lg mx-auto bg-slate-950 px-6 py-6 relative scanlines overflow-y-auto touch-pan-y">
      {/* 1. Header Row */}
      <div className="w-full flex items-center justify-between z-10 mb-6">
        <button
          onClick={() => {
            sound.playCoin();
            onBack();
          }}
          className="p-2.5 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow"
          id="btn_back_shop"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center space-x-1 border border-pink-700 bg-pink-950/20 px-3 py-1 rounded-full animate-pulse">
          <Sparkles className="text-pink-400" size={12} />
          <span className="text-[9px] font-mono tracking-widest font-extrabold text-pink-400">SUPPORTER SHOP</span>
        </div>

        {/* Currency Tracker */}
        <div className="flex items-center space-x-1.5 bg-yellow-950/40 border border-yellow-800 px-3 py-1.5 rounded-full shadow shadow-yellow-950/20">
          <span className="text-yellow-400 text-sm">🪙</span>
          <span className="font-mono text-xs font-bold text-yellow-400">{coins}</span>
        </div>
      </div>

      {/* Main Pitch Description */}
      <div className="text-center max-w-sm mb-6 z-10">
        <h1 className="text-xl font-black font-display text-white uppercase tracking-tight">PREMIUM REWARDS</h1>
        <p className="text-slate-400 text-[10.5px] leading-relaxed font-sans mt-1.5">
          Support the game developer and unlock extreme statistical cheats! Purchases instantly sync to your device storage.
        </p>
      </div>

      {/* Shop Grid List */}
      <div className="w-full flex flex-col gap-4 z-10 mb-8 flex-1 min-h-0 overflow-y-auto">
        {shopItems.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 bg-slate-900/60 border rounded-2xl flex flex-col justify-between transition-all relative ${
                item.purchased 
                  ? 'border-emerald-500/30 opacity-75' 
                  : 'border-slate-800 hover:border-slate-700/80 shadow-md'
              }`}
            >
              {/* Overlay active */}
              {item.purchased && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full text-emerald-400 text-[8px] font-mono leading-none">
                  <Check size={8} />
                  <span>ACTIVE OWNED</span>
                </div>
              )}

              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl select-none">
                  {item.icon}
                </div>

                <div className="flex-1 text-left min-w-0 pr-12">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 block">
                    {item.tag}
                  </span>
                  <h3 className="text-xs font-black text-white uppercase tracking-wide truncate">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Perk Description Info */}
              <div className="my-3 bg-slate-950/50 rounded-xl p-2.5 border border-slate-900 font-mono text-[9px] text-slate-300 text-left">
                <span className="text-pink-400 font-bold block mb-0.5">🔥 SUPPORTER BENEFIT:</span>
                <span>{item.perk}</span>
              </div>

              {/* Purchase action row */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/40 mt-1">
                <span className="text-md font-mono font-black text-white">
                  {item.price}
                </span>

                {item.purchased ? (
                  <span className="text-[9px] font-mono font-extrabold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 uppercase">
                    ACTIVE Perks
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(item)}
                    className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-red-505 bg-pink-600 hover:bg-pink-500 font-mono text-xs font-extrabold text-white cursor-pointer select-none active:scale-95 transition-all"
                  >
                    BUY NOW
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Secure Checkout Bottom Modal Sheet */}
      {selectedItem && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl p-6 relative animate-slide-up flex flex-col text-center">
            
            {/* Safe Seal Header */}
            <div className="flex justify-center items-center gap-1.5 text-emerald-400 font-mono text-[9px] font-extrabold uppercase bg-emerald-950/50 border border-emerald-500/20 py-1.5 px-4 rounded-full mx-auto mb-4 tracking-wider">
              <ShieldCheck size={12} />
              <span>Secure App-Store Sandbox Gateway</span>
            </div>

            {checkoutPhase === 'IDLE' && (
              <>
                <h2 className="text-sm font-black font-display text-white tracking-wide uppercase mb-1">
                  Authorize Sandbox Purchase
                </h2>
                <p className="text-[10px] text-slate-400 font-sans px-8 leading-normal">
                  You are evaluating game monetization. No actual bank funds will be transferred in this sandbox view.
                </p>

                {/* Receipt Preview Card */}
                <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 my-5 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl bg-slate-900 border border-slate-800 p-2 rounded-xl block">{selectedItem.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{selectedItem.title}</h4>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">DELIVERY: INSTANT STORAGE UPDATE</p>
                    </div>
                  </div>
                  <span className="text-md font-mono font-black text-pink-400">{selectedItem.price}</span>
                </div>

                {/* Subheading Payment Options mimicking real iOS Sheet */}
                <div className="flex flex-col gap-2.5 text-left mb-6 font-mono text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-tight text-[9px]">PAYMENT OPTION:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPaymentOption('CARD')}
                      className={`p-3 rounded-xl border flex items-center space-x-2 transition ${
                        paymentOption === 'CARD' 
                          ? 'border-pink-500 bg-pink-950/10 text-white font-bold' 
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <CreditCard size={14} />
                      <span>Visa •••• 9214</span>
                    </button>
                    <button 
                      onClick={() => setPaymentOption('GPAY')}
                      className={`p-3 rounded-xl border flex items-center space-x-2 transition ${
                        paymentOption === 'GPAY' 
                          ? 'border-pink-500 bg-pink-950/10 text-white font-bold' 
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <span className="font-sans font-extrabold text-xs">GPay</span>
                      <span>Express Pay</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action bar */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleCloseCheckout}
                    className="flex-1 py-3 px-4 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80 rounded-xl font-mono text-[11px] font-bold"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    className="flex-[1.5] py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 hover:from-emerald-500 hover:to-teal-400 rounded-xl font-mono text-[11px] font-black uppercase text-center cursor-pointer select-none"
                  >
                    CONFIRM PAYMENT
                  </button>
                </div>
              </>
            )}

            {checkoutPhase === 'PAYING' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 size={36} className="text-pink-500 animate-spin mb-4" />
                <h3 className="text-xs font-mono tracking-widest text-white uppercase font-bold animate-pulse">
                  TRANSMITTING SECURE ORDER HASH...
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Please keep the active build sandboxed...</p>
              </div>
            )}

            {checkoutPhase === 'SUCCESS' && (
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                  <Check size={26} strokeWidth={3} className="animate-bounce" />
                </div>
                <h3 className="text-sm font-black font-display text-emerald-400 uppercase tracking-wide">
                  PURCHASE COMPLETED!
                </h3>
                <p className="text-[10px] text-slate-300 font-sans my-2.5 px-6 leading-relaxed">
                  Excellent choice! The supporter bonus and codes has been flashed to your local storage. Boost remains active on all consecutive game instances. Thank you for your support!
                </p>

                <button
                  onClick={handleCloseCheckout}
                  className="mt-4 w-full py-3 bg-emerald-500 text-slate-950 font-mono text-xs font-black rounded-xl uppercase hover:bg-emerald-400 cursor-pointer active:scale-95 transition"
                >
                  RETURN TO BASE
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
