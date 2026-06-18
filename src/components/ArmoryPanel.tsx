import React, { useState } from 'react';
import { GearItem } from '../types';
import { sound } from '../utils/audio';
import { generateRandomGear } from '../data';
import { 
  ArrowLeft, 
  Trash2, 
  ShieldAlert, 
  Zap, 
  Compass, 
  Disc, 
  Award, 
  Sparkles, 
  Package, 
  Lock, 
  Unlock, 
  Loader2, 
  Coins, 
  Check,
  PackageOpen
} from 'lucide-react';

interface ArmoryPanelProps {
  inventory: GearItem[];
  setInventory: React.Dispatch<React.SetStateAction<GearItem[]>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  onBack: () => void;
}

interface CrateType {
  id: 'silver' | 'quantum' | 'omega';
  name: string;
  cost: number;
  desc: string;
  rarities: string;
  color: string;
  badge: string;
  icon: string;
}

export default function ArmoryPanel({
  inventory,
  setInventory,
  coins,
  setCoins,
  onBack,
}: ArmoryPanelProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop' | 'cardsets'>('inventory');
  
  // Unboxing states
  const [isOpening, setIsOpening] = useState(false);
  const [currentCrateName, setCurrentCrateName] = useState('');
  const [openedItem, setOpenedItem] = useState<GearItem | null>(null);

  const handleEquip = (item: GearItem) => {
    setInventory(prev => {
      return prev.map(invItem => {
        // If it's a gear item in the same slot, we should unequip it first!
        if (invItem.slot === item.slot && invItem.equipped && invItem.id !== item.id) {
          return { ...invItem, equipped: false };
        }
        // Toggle equipped status for current item
        if (invItem.id === item.id) {
          const nextEquipState = !invItem.equipped;
          sound.playGatePass(nextEquipState); // play appropriate sound
          return { ...invItem, equipped: nextEquipState };
        }
        return invItem;
      });
    });
  };

  const handleDismantle = (item: GearItem) => {
    // Scrap/recycle item for gold coins based on rarity
    const scrapValues = {
      common: 15,
      rare: 40,
      epic: 100,
      legendary: 300,
    };
    const reward = scrapValues[item.rarity];
    setCoins(prev => prev + reward);
    setInventory(prev => prev.filter(invItem => invItem.id !== item.id));
    sound.playCoin();
  };

  // Find currently equipped item for each slot
  const equippedWeapon = inventory.find(i => i.slot === 'weapon' && i.equipped);
  const equippedArmor = inventory.find(i => i.slot === 'armor' && i.equipped);
  const equippedBoots = inventory.find(i => i.slot === 'boots' && i.equipped);
  const equippedRing = inventory.find(i => i.slot === 'ring' && i.equipped);

  // Compute stat totals
  const totalDmgBonus = inventory.filter(i => i.equipped && i.statName === 'Damage Bonus').reduce((sum, i) => sum + i.statValue, 0);
  const totalFireRateBonus = inventory.filter(i => i.equipped && i.statName === 'Fire Rate Bonus').reduce((sum, i) => sum + i.statValue, 0);
  const totalStartForce = inventory.filter(i => i.equipped && i.statName === 'Starting Force').reduce((sum, i) => sum + i.statValue, 0);
  const totalGoldBonus = inventory.filter(i => i.equipped && i.statName === 'Gold Multiplier').reduce((sum, i) => sum + i.statValue, 0);
  const totalMagnetBonus = inventory.filter(i => i.equipped && i.statName === 'Magnet Range').reduce((sum, i) => sum + i.statValue, 0);

  const getRarityStyle = (rarity: GearItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-slate-700 bg-slate-900/60 text-slate-400';
      case 'rare': return 'border-blue-600/85 bg-blue-950/30 text-blue-300';
      case 'epic': return 'border-purple-600/85 bg-purple-950/30 text-purple-300 animate-pulse';
      case 'legendary': return 'border-amber-500/85 bg-amber-950/40 text-amber-300 shadow-md shadow-amber-900/20';
    }
  };

  const getRarityBadgeStyle = (rarity: GearItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-slate-800 text-slate-400 border border-slate-705';
      case 'rare': return 'bg-blue-950 text-blue-400 border border-blue-900';
      case 'epic': return 'bg-purple-950 text-purple-400 border border-purple-900 animate-pulse';
      case 'legendary': return 'bg-amber-950 text-amber-400 border border-amber-900 shadow-sm shadow-amber-950';
    }
  };

  const cratesList: CrateType[] = [
    {
      id: 'silver',
      name: 'Titanium Munitions Case',
      cost: 350,
      desc: 'Forged from battlefield scrap metal. Calibrates standard and sturdy military armaments.',
      rarities: 'RARE (70%) OR EPIC (30%) GEAR',
      color: 'from-slate-700 via-slate-800 to-slate-900 border-slate-650',
      badge: '⚙️ SOLID SPECIALTY',
      icon: '⚙️',
    },
    {
      id: 'quantum',
      name: 'Quantum Reactor Core',
      cost: 850,
      desc: 'Infused with particle energy. Extremely high probability of tapping advanced nanotech or epic triggers.',
      rarities: 'EPIC (80%) OR LEGENDARY (20%) WEAPONRY',
      color: 'from-purple-950 via-indigo-950 to-slate-950 border-purple-800/80 shadow-purple-950/30',
      badge: '🔮 ULTRA TACTICAL',
      icon: '🔮',
    },
    {
      id: 'omega',
      name: 'Omega Chronos Vault',
      cost: 1800,
      desc: 'Classified relics extracted directly from elite end-boss wreckage coordinates. Ultimate military power.',
      rarities: '100% GUARANTEED LEGENDARY RELIC',
      color: 'from-yellow-950/80 via-amber-950 to-slate-950 border-amber-500 shadow-amber-950/50',
      badge: '👑 SUPREME GODROLL',
      icon: '👑',
    },
  ];

  const handleBuyCrate = (crate: CrateType) => {
    if (coins < crate.cost) {
      sound.playGatePass(false); // Play failure buzz
      return;
    }

    setCoins(prev => prev - crate.cost);
    setCurrentCrateName(crate.name);
    setIsOpening(true);
    sound.playBossSiren(); // Play sweep up siren sound!

    // Wait 2000ms, then roll the item randomly according to probabilities
    setTimeout(() => {
      let rolledRarity: GearItem['rarity'] = 'rare';
      if (crate.id === 'silver') {
        rolledRarity = Math.random() < 0.3 ? 'epic' : 'rare';
      } else if (crate.id === 'quantum') {
        rolledRarity = Math.random() < 0.2 ? 'legendary' : 'epic';
      } else if (crate.id === 'omega') {
        rolledRarity = 'legendary';
      }

      const newItem = generateRandomGear(rolledRarity);
      setOpenedItem(newItem);
      setIsOpening(false);
      sound.playVictory(); // play glorious win sound!
    }, 2000);
  };

  const collectRolledItem = () => {
    if (openedItem) {
      setInventory(prev => [...prev, openedItem]);
      setOpenedItem(null);
      sound.playGearDrop();
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-lg mx-auto bg-slate-950 px-6 py-6 relative scanlines overflow-y-auto touch-pan-y">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between z-10 mb-5">
        <button
          onClick={() => {
            sound.playCoin();
            onBack();
          }}
          className="p-2.5 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow"
          id="btn_back_armory"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-xl font-bold font-display text-white">SOLDIER ARMORY</h1>

        <div className="flex items-center space-x-1.5 bg-yellow-950/40 border border-yellow-800 px-3 py-1.5 rounded-full shadow shadow-yellow-950/20">
          <span className="text-yellow-400 text-sm">🪙</span>
          <span className="font-mono text-xs font-bold text-yellow-400">{coins}</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="w-full grid grid-cols-3 bg-slate-900/60 border border-slate-900 p-1 rounded-xl mb-5 z-10 font-mono text-[9px] gap-1 shrink-0">
        <button
          onClick={() => {
            sound.playCoin();
            setActiveTab('inventory');
          }}
          className={`py-1.5 rounded-lg font-extrabold text-center transition cursor-pointer flex items-center justify-center ${
            activeTab === 'inventory'
              ? 'bg-slate-950 text-white border border-slate-800 shadow shadow-slate-950/40 font-black text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>💼 DEPOT</span>
        </button>
        <button
          onClick={() => {
            sound.playCoin();
            setActiveTab('cardsets');
          }}
          className={`py-1.5 rounded-lg font-extrabold text-center transition cursor-pointer relative flex items-center justify-center ${
            activeTab === 'cardsets'
              ? 'bg-slate-950 text-white border border-slate-800 shadow shadow-slate-950/40 font-black text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⚡ SETS</span>
          <span className="absolute -top-1 right-1 bg-yellow-400 text-black font-sans font-black text-[6px] px-1 py-0.5 rounded-full animate-pulse scale-95 leading-none">
            BUFF
          </span>
        </button>
        <button
          onClick={() => {
            sound.playCoin();
            setActiveTab('shop');
          }}
          className={`py-1.5 rounded-lg font-extrabold text-center transition cursor-pointer relative flex items-center justify-center ${
            activeTab === 'shop'
              ? 'bg-slate-950 text-white border border-slate-800 shadow shadow-slate-950/40 font-black text-rose-455 text-rose-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🛍️ CRATES</span>
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Equipment Slots Block */}
          <div className="w-full bg-slate-900/40 border border-slate-900 px-4 py-4 rounded-2xl mb-5 z-10">
            <h2 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-3 text-center">
              EQUIPPED ACTIVE LOADOUT
            </h2>
            
            <div className="grid grid-cols-4 gap-3 text-center">
              {/* Weapon Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono font-bold text-slate-500 mb-1.5 block">WEAPON</span>
                <button
                  onClick={() => equippedWeapon && handleEquip(equippedWeapon)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl relative cursor-pointer group transition duration-200 ${
                    equippedWeapon ? getRarityStyle(equippedWeapon.rarity) : 'border-slate-800 bg-slate-950 border-dashed text-slate-700 hover:text-slate-500'
                  }`}
                >
                  {equippedWeapon ? (
                    <>
                      <span>{equippedWeapon.icon}</span>
                      <div className="absolute -bottom-1 -right-1 bg-teal-505 bg-teal-500 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </>
                  ) : '🔫'}
                </button>
                <span className="text-[9px] font-mono text-slate-450 text-slate-400 mt-2 truncate w-full text-center">
                  {equippedWeapon ? equippedWeapon.name.split(' ').slice(1).join(' ') : 'Empty'}
                </span>
              </div>

              {/* Armor Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono font-bold text-slate-500 mb-1.5 block">BODY ARMOR</span>
                <button
                  onClick={() => equippedArmor && handleEquip(equippedArmor)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl relative cursor-pointer transition duration-200 ${
                    equippedArmor ? getRarityStyle(equippedArmor.rarity) : 'border-slate-800 bg-slate-950 border-dashed text-slate-700 hover:text-slate-500'
                  }`}
                >
                  {equippedArmor ? (
                    <>
                      <span>{equippedArmor.icon}</span>
                      <div className="absolute -bottom-1 -right-1 bg-teal-505 bg-teal-500 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </>
                  ) : '🛡️'}
                </button>
                <span className="text-[9px] font-mono text-slate-450 text-slate-400 mt-2 truncate w-full text-center">
                  {equippedArmor ? equippedArmor.name.split(' ').slice(1).join(' ') : 'Empty'}
                </span>
              </div>

              {/* Boots Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono font-bold text-slate-500 mb-1.5 block">BOOTS</span>
                <button
                  onClick={() => equippedBoots && handleEquip(equippedBoots)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl relative cursor-pointer transition duration-200 ${
                    equippedBoots ? getRarityStyle(equippedBoots.rarity) : 'border-slate-800 bg-slate-950 border-dashed text-slate-700 hover:text-slate-500'
                  }`}
                >
                  {equippedBoots ? (
                    <>
                      <span>{equippedBoots.icon}</span>
                      <div className="absolute -bottom-1 -right-1 bg-teal-505 bg-teal-500 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </>
                  ) : '🥾'}
                </button>
                <span className="text-[9px] font-mono text-slate-450 text-slate-400 mt-2 truncate w-full text-center">
                  {equippedBoots ? equippedBoots.name.split(' ').slice(1).join(' ') : 'Empty'}
                </span>
              </div>

              {/* Ring Slot */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono font-bold text-slate-500 mb-1.5 block">RING</span>
                <button
                  onClick={() => equippedRing && handleEquip(equippedRing)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl relative cursor-pointer transition duration-200 ${
                    equippedRing ? getRarityStyle(equippedRing.rarity) : 'border-slate-800 bg-slate-950 border-dashed text-slate-700 hover:text-slate-500'
                  }`}
                >
                  {equippedRing ? (
                    <>
                      <span>{equippedRing.icon}</span>
                      <div className="absolute -bottom-1 -right-1 bg-teal-505 bg-teal-500 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    </>
                  ) : '💍'}
                </button>
                <span className="text-[9px] font-mono text-slate-455 text-slate-400 mt-2 truncate w-full text-center">
                  {equippedRing ? equippedRing.name.split(' ').slice(1).join(' ') : 'Empty'}
                </span>
              </div>
            </div>

            {/* Sum of Stats indicators */}
            <div className="mt-4 pt-3 border-t border-slate-900/80 flex flex-wrap gap-2.5 justify-center">
              {totalStartForce > 0 && (
                <div className="text-[9px] font-mono bg-blue-950/40 border border-blue-900 text-blue-400 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <span>🎯</span>
                  <span>Start Soldiers +{totalStartForce}</span>
                </div>
              )}
              {totalDmgBonus > 0 && (
                <div className="text-[9px] font-mono bg-red-950/40 border border-red-900 text-red-400 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <span>⚡</span>
                  <span>Bullet Damage +{totalDmgBonus}</span>
                </div>
              )}
              {totalFireRateBonus > 0 && (
                <div className="text-[9px] font-mono bg-yellow-950/40 border border-yellow-800 text-yellow-400 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <span>🌀</span>
                  <span>Gun Spin +{totalFireRateBonus}%</span>
                </div>
              )}
              {totalGoldBonus > 0 && (
                <div className="text-[9px] font-mono bg-amber-950/40 border border-amber-900 text-amber-400 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <span>🪙</span>
                  <span>Loot Gold +{totalGoldBonus}%</span>
                </div>
              )}
              {totalMagnetBonus > 0 && (
                <div className="text-[9px] font-mono bg-teal-950/40 border border-teal-900 text-teal-400 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <span>🧲</span>
                  <span>Sweep Pull +{totalMagnetBonus}%</span>
                </div>
              )}
              {(!totalStartForce && !totalDmgBonus && !totalFireRateBonus && !totalGoldBonus && !totalMagnetBonus) && (
                <div className="text-[9px] font-mono text-slate-500 italic">
                  No loadout bonuses active. Equip items from inventory below!
                </div>
              )}
            </div>
          </div>

          {/* Inventory section */}
          <div className="w-full flex-1 z-10 flex flex-col min-h-0 bg-slate-900/10 border border-slate-900 rounded-3xl p-4">
            <h2 className="text-xs font-bold font-display tracking-wide text-slate-300 mb-3 text-center uppercase">
              STORAGE DEPOT ({inventory.length} ITEMS)
            </h2>

            {inventory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-900 rounded-2xl">
                <ShieldAlert size={28} className="text-slate-700 mb-2 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-500 font-mono">DEPOT VACANT</h3>
                <p className="text-[10px] text-slate-600 mt-1 leading-normal max-w-xs font-sans">
                  Beat elite monster waves and final bosses to drop weaponry and defensive wear. Loot drops automatically populate this space. You can also roll high-tech loot caches using gold in the Crate shop tab!
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 gap-2.5 max-h-[300px]">
                {inventory.map((item) => {
                  let borderGlow = 'border-slate-850 hover:border-slate-700 bg-slate-900/40';
                  let itemBackground = 'from-slate-900 to-slate-950';
                  let sparkleBadge = '';
                  
                  if (item.equipped) {
                    borderGlow = 'border-emerald-500 bg-emerald-950/15 shadow-[0_0_12px_rgba(16,185,129,0.3)] duration-200';
                    itemBackground = 'from-slate-900 via-emerald-950/10 to-slate-900';
                  } else if (item.rarity === 'legendary') {
                    borderGlow = 'border-amber-500/80 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse';
                    itemBackground = 'from-slate-900 via-amber-955/10 via-amber-950/15 to-slate-900';
                    sparkleBadge = '✨ ';
                  } else if (item.rarity === 'epic') {
                    borderGlow = 'border-purple-600/70 bg-purple-950/15 shadow-[0_0_10px_rgba(168,85,247,0.15)]';
                    itemBackground = 'from-slate-900 via-purple-950/10 to-slate-900';
                  } else if (item.rarity === 'rare') {
                    borderGlow = 'border-blue-600/60 bg-blue-950/10';
                    itemBackground = 'from-slate-900 via-blue-950/10 to-slate-900';
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-3 relative overflow-hidden rounded-2xl border flex items-center justify-between transition-all bg-gradient-to-br ${borderGlow} ${itemBackground}`}
                    >
                      {/* Interactive card shine overlay line */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                      
                      <div className="flex items-center space-x-3 text-left z-10">
                        {/* Elegant high-contrast rounded element block */}
                        <div className={`w-12 h-12 border rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg relative ${getRarityStyle(item.rarity)}`}>
                          <span>{item.icon}</span>
                          {item.equipped && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full flex items-center justify-center border border-slate-950">
                              <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-[11px] font-black text-white tracking-wide uppercase truncate max-w-[125px]">
                              {sparkleBadge}{item.name.replace(/^(Common|Rare|Epic|Legendary)\s+/i, '')}
                            </h4>
                            <span className={`text-[7px] font-mono font-black px-1 rounded uppercase tracking-wider ${getRarityBadgeStyle(item.rarity)}`}>
                              {item.rarity}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-teal-400 font-mono font-bold mt-0.5 flex items-center space-x-1">
                            <span>🚀</span>
                            <span>+{item.statValue}{item.statName.includes('Bonus') || item.statName.includes('Multiplier') || item.statName.includes('Range') ? '%' : ''} {item.statName.replace('Bonus','')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 z-10">
                        {/* Equip button */}
                        <button
                          onClick={() => handleEquip(item)}
                          className={`py-1.5 px-3 rounded-xl text-[9px] tracking-widest font-black font-mono transition duration-150 cursor-pointer ${
                            item.equipped
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/50'
                              : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          {item.equipped ? 'UNEQUIP' : 'EQUIP'}
                        </button>

                        {/* Scrap / Dismantle button */}
                        {!item.equipped && (
                          <button
                            onClick={() => handleDismantle(item)}
                            className="p-1.5 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-950/40 active:scale-95 transition duration-150 cursor-pointer"
                            title="Recycle Card for gold"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'cardsets' ? (
        (() => {
          const hasItemWithWord = (word: string) => inventory.some(item => item.name.toLowerCase().includes(word.toLowerCase()));
          return (
            <div className="w-full flex-1 flex flex-col gap-4 z-10 mb-2 overflow-y-auto min-h-0">
              <div className="text-center max-w-sm mx-auto mb-2 bg-slate-900/35 border border-indigo-950 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-505/10 blur-xl pointer-events-none" />
                <h2 className="text-xs font-extrabold text-cyan-400 tracking-widest font-mono uppercase flex items-center justify-center space-x-1.5 z-10 relative">
                  <Zap className="text-cyan-400 animate-pulse" size={12} fill="currentColor" />
                  <span>MATH CARD SET ENERGY</span>
                </h2>
                <p className="text-slate-400 text-[10px] font-sans mt-1 leading-relaxed z-10 relative">
                  Collect weapon, defense, and relic cards of the same series. Completing active sets unlocks <span className="text-yellow-400 font-bold">Permanent Energy buffs</span> loaded instantly into gameplay patrol stats!
                </p>
              </div>

              {/* CARD SETS LIST */}
              <div className="flex flex-col gap-3.5 pb-4 max-h-[360px] overflow-y-auto pr-1">
                {[
                  {
                    id: 'set1',
                    name: '⚡ PLASMA COMMANDO RECHARGE',
                    desc: 'Tactical high-energy plasma assault loadout tier.',
                    bonus: '+15% Weapon Gun Spin Speed (Fire Rate)',
                    items: ['Plasma Repeater', 'Carbon Plating', 'Thrust Boosters'],
                    active: hasItemWithWord('Plasma Repeater') && hasItemWithWord('Carbon Plating') && hasItemWithWord('Thrust Boosters'),
                    color: 'from-emerald-950/60 to-slate-900 border-emerald-950/40',
                    accent: 'text-emerald-400',
                  },
                  {
                    id: 'set2',
                    name: '🔮 QUANTUM CYBERNET CRUCIBLE',
                    desc: 'Hyper-frequency quantum computing relic core tier.',
                    bonus: '+2 Permanent Particle Bullet Damage',
                    items: ['Quantum Railgun', 'Nanotech Weave', 'Matrix Loop'],
                    active: hasItemWithWord('Quantum Railgun') && hasItemWithWord('Nanotech Weave') && hasItemWithWord('Matrix Loop'),
                    color: 'from-purple-950/60 to-slate-900 border-purple-950/40',
                    accent: 'text-purple-400',
                  },
                  {
                    id: 'set3',
                    name: '🪙 MIDAS COINSWEEP SYNDICATE',
                    desc: 'Auric vortex magnetic resonance sweep collection tier.',
                    bonus: '+25% Extra Gold Scrap Earnings per wave',
                    items: ['Midas Band', 'Siren Band', 'Hover Soles'],
                    active: hasItemWithWord('Midas Band') && hasItemWithWord('Siren Band') && hasItemWithWord('Hover Soles'),
                    color: 'from-amber-955/65 from-amber-950/45 to-slate-900 border-amber-950/40',
                    accent: 'text-amber-400',
                  },
                  {
                    id: 'set4',
                    name: '🛡️ HEAVY TITAN DIVISION',
                    desc: 'Deflector heavy force field legion protection tier.',
                    bonus: '+5 Permanent Starting Patrol Troops',
                    items: ['Heavy Minigun', 'Titanium Shell', 'Deflector Jumpsuit'],
                    active: hasItemWithWord('Heavy Minigun') && hasItemWithWord('Titanium Shell') && hasItemWithWord('Deflector Jumpsuit'),
                    color: 'from-blue-955/65 from-blue-950/45 to-slate-900 border-blue-950/40',
                    accent: 'text-blue-400',
                  }
                ].map(set => {
                  return (
                    <div
                      key={set.id}
                      className={`p-3.5 border bg-gradient-to-br rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden ${
                        set.active 
                          ? `${set.color} border-slate-705 shadow-lg shadow-slate-950/30`
                          : 'border-slate-900 bg-slate-900/10 opacity-75'
                      }`}
                    >
                      {/* Stamp */}
                      <div className="absolute top-2.5 right-2.5 flex items-center space-x-1">
                        {set.active ? (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 font-black tracking-widest animate-pulse">
                            ✓ ACTIVE ENERGY RECHARGE
                          </span>
                        ) : (
                          <span className="bg-slate-950 text-slate-505 text-slate-500 text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-900 font-bold">
                            🔒 INCOMPLETE
                          </span>
                        )}
                      </div>

                      <div className="text-left">
                        <h3 className="text-[11px] font-mono font-black text-white tracking-wide uppercase flex items-center space-x-1.5">
                          <span>{set.name}</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-normal font-sans mt-0.5 mb-2.5">
                          {set.desc}
                        </p>

                        {/* Requirements list */}
                        <div className="grid grid-cols-3 gap-2 my-2">
                          {set.items.map(itemName => {
                            const hasThisItem = hasItemWithWord(itemName);
                            return (
                              <div
                                key={itemName}
                                className={`p-1.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                                  hasThisItem
                                    ? 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300 shadow-sm'
                                    : 'border-slate-900 bg-slate-950/40 text-slate-600'
                                }`}
                              >
                                <span className="text-xs leading-none mb-1">
                                  {itemName.includes('Plating') || itemName.includes('Shell') || itemName.includes('Weave') || itemName.includes('Jumpsuit') ? '🛡️' :
                                   itemName.includes('Boots') || itemName.includes('Treads') || itemName.includes('Soles') ? '🥾' :
                                   itemName.includes('Band') || itemName.includes('Loop') ? '💍' : '🔫'}
                                </span>
                                <span className="text-[7.5px] font-mono font-black leading-tight block truncate w-full uppercase">
                                  {itemName}
                                </span>
                                <span className="text-[6.5px] font-mono mt-0.5 font-bold">
                                  {hasThisItem ? 'OWNED' : 'MISSING'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Passive Reward */}
                        <div className={`mt-2 p-2 rounded-xl text-[9px] font-mono font-extrabold flex justify-between items-center ${
                          set.active
                            ? 'bg-emerald-950/35 border border-emerald-900 text-emerald-400 shadow-inner'
                            : 'bg-slate-950/50 border border-slate-900/60 text-slate-500'
                        }`}>
                          <span>RECHARGE GAIN:</span>
                          <span className="font-black uppercase tracking-wide text-right">
                            {set.bonus}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      ) : (
        /* Dynamic Crate Exchange Gacha Shop */
        <div className="w-full flex-1 flex flex-col gap-4 z-10 mb-2 overflow-y-auto min-h-0">
          <div className="text-center max-w-sm mx-auto mb-2 bg-slate-900/10 border border-slate-900/40 p-3 rounded-2xl">
            <h2 className="text-xs font-extrabold text-white tracking-widest font-mono uppercase flex items-center justify-center space-x-1">
              <Sparkles className="text-yellow-400" size={12} />
              <span>MILITARY SUPPLY MANIFEST</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-sans mt-1 leading-relaxed">
              Exchanging your combat division gold coins with high-quality prototype dropcrates. Gear gives permanent stat multi-pliers!
            </p>
          </div>

          <div className="flex flex-col gap-3 pb-4">
            {cratesList.map(crate => {
              const isLockedByCoins = coins < crate.cost;
              return (
                <div
                  key={crate.id}
                  className="p-4 bg-slate-900/45 border border-slate-900 rounded-2xl flex flex-col justify-between transition-all relative"
                >
                  {/* Badge */}
                  <div className="absolute top-2 right-2 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-slate-400 font-bold">
                    {crate.badge}
                  </div>

                  <div className="flex items-start space-x-3.5 mb-3.5">
                    <span className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-4xl select-none">
                      {crate.icon}
                    </span>
                    <div className="text-left min-w-0 flex-1">
                      <span className="text-[8px] tracking-wider font-mono font-bold text-teal-400 uppercase">
                        {crate.rarities}
                      </span>
                      <h3 className="text-xs font-mono font-extrabold text-white uppercase mt-0.5">
                        {crate.name}
                      </h3>
                      <p className="text-[10px] font-sans text-slate-400 leading-relaxed mt-1">
                        {crate.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-xl border border-slate-900/80">
                    <div className="flex items-center space-x-1 text-slate-350">
                      <span className="text-xs">🪙</span>
                      <span className="font-mono text-xs font-bold text-yellow-500">{crate.cost}</span>
                      <span className="text-[9px] text-slate-500 font-mono">coins</span>
                    </div>

                    <button
                      onClick={() => handleBuyCrate(crate)}
                      disabled={isLockedByCoins}
                      className={`py-1.5 px-4 rounded-xl text-[10px] font-mono tracking-widest font-extrabold flex items-center space-x-1 cursor-pointer transition ${
                        isLockedByCoins
                          ? 'bg-slate-900 border border-slate-850 text-slate-650 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-yellow-505 from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-950/20 active:scale-95'
                      }`}
                    >
                      <span>{isLockedByCoins ? 'RESERVES LACKING' : 'UNLOCK CRATE'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Cinematic Simulated "Opening Crate..." Modal Loader */}
      {isOpening && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-slate-900/60 border-2 border-dashed border-teal-500 rounded-full flex items-center justify-center mb-6 animate-spin duration-3000">
            <Package size={28} className="text-teal-400 rotate-12 animate-pulse" />
          </div>

          <h3 className="text-sm font-black font-display text-white uppercase tracking-widest animate-pulse">
            FABRICATING CLASSIFIED GEAR...
          </h3>
          <p className="text-[10.5px] font-mono text-teal-400 uppercase mt-2 tracking-wider">
            Decrypting {currentCrateName} Cache
          </p>
          <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden mt-4 border border-slate-800">
            <div className="bg-teal-500 h-full animate-progress-bar w-0" />
          </div>
          <p className="text-[9px] text-slate-500 font-mono mt-2 animate-bounce">
            Awaiting quantum assembly signals...
          </p>
        </div>
      )}

      {/* 2. Cinematic holographic reward showcase modal */}
      {openedItem && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
          {/* Glowing orbital backdrops depending on item rarity */}
          <div className={`absolute w-72 h-72 rounded-full filter blur-3xl opacity-20 pointer-events-none ${
            openedItem.rarity === 'common' ? 'bg-slate-500' :
            openedItem.rarity === 'rare' ? 'bg-blue-600' :
            openedItem.rarity === 'epic' ? 'bg-purple-600' : 'bg-amber-500'
          }`} />

          {/* Holographic Crate Open Visual header badge */}
          <div className="flex items-center space-x-1 bg-yellow-955/20 border border-yellow-900 px-3 py-1.5 rounded-full mb-6 z-10 text-yellow-400 animate-pulse">
            <Sparkles size={11} />
            <span className="text-[9px] font-mono tracking-widest font-extrabold uppercase">
              DECRYPTED SUCCESSFUL!
            </span>
          </div>

          <div className="z-10 bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            {/* Massive Gear Item Slot Ring */}
            <div className={`w-20 h-20 border-2 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 bg-slate-950 ${getRarityStyle(openedItem.rarity)}`}>
              {openedItem.icon}
            </div>

            <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest inline-block mb-2 ${getRarityBadgeStyle(openedItem.rarity)}`}>
              {openedItem.rarity}
            </span>

            <h3 className="text-md font-black font-display text-white uppercase mb-1">
              {openedItem.name}
            </h3>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
              SLOT: {openedItem.slot}
            </p>

            <div className="my-4 bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-center items-center text-center">
              <span className="text-[9px] font-mono text-slate-500 block mb-0.5">PERMANENT ATTRIBUTE GAIN:</span>
              <span className="text-xs font-mono font-black text-teal-400">
                +{openedItem.statValue}{openedItem.statName.includes('Bonus') || openedItem.statName.includes('Multiplier') || openedItem.statName.includes('Range') ? '%' : ''} {openedItem.statName}
              </span>
            </div>

            <p className="text-[9.5px] font-sans text-slate-500 leading-normal mb-1">
              This attribute will stack automatically onto your combat operations whenever this blueprint item is selected inside your equipped loadout slots.
            </p>
          </div>

          <button
            onClick={collectRolledItem}
            className="mt-6 w-full max-w-sm py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-mono text-xs font-black rounded-xl uppercase hover:from-teal-400 hover:to-emerald-400 transition cursor-pointer select-none active:scale-95 shadow-lg shadow-teal-950/20 duration-150 z-10"
          >
            COLLECT TO STORAGE DEPOT
          </button>
        </div>
      )}
    </div>
  );
}
