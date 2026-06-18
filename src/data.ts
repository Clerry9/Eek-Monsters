import { LevelTheme, GearItem } from './types';

export const LEVEL_THEMES: LevelTheme[] = [
  {
    id: 1,
    name: 'Zombie Outpost',
    theme: 'Graveyard',
    milestoneDistance: 300,
    colors: {
      bg: '#090d16',     // Cool midnight
      road: '#111827',   // Dark Charcoal Slate (high contrast)
      side: '#1f2937',   // Slate gray side path
      accent: '#22c55e', // Emerald lasers/particle glow
      accentText: '#f0fdf4',
    },
    monsterType: 'zombie',
    bossName: 'Undead Overlord',
    bossHealth: 60,
  },
  {
    id: 2,
    name: 'Mummy Dunes',
    theme: 'Desert',
    milestoneDistance: 600,
    colors: {
      bg: '#1c1917',     // Stone dark
      road: '#292524',   // Dark clay sand road
      side: '#44403c',   // Warm sepia borders
      accent: '#eab308', // Amber loot drops
      accentText: '#fffbeb',
    },
    monsterType: 'skeleton',
    bossName: 'Pharaoh Cryptlord',
    bossHealth: 200,
  },
  {
    id: 3,
    name: 'Volcanic Forge',
    theme: 'Lava Rock',
    milestoneDistance: 1000,
    colors: {
      bg: '#180404',     // Ash dark
      road: '#0a0202',   // Obsidian charcoal pavement
      side: '#7f1d1d',   // Crimson lava walls
      accent: '#ef4444', // Fiery orange-red lasers
      accentText: '#fef2f2',
    },
    monsterType: 'fire_elemental',
    bossName: 'Magma Colossus',
    bossHealth: 650,
  },
  {
    id: 4,
    name: 'Frozen Tundra',
    theme: 'Arctic Frost',
    milestoneDistance: 1500,
    colors: {
      bg: '#080c14',     // Polar night black
      road: '#0f172a',   // Dark blue frost pavement
      side: '#1e293b',   // Ice steel banks
      accent: '#38bdf8', // Neon glacier blue
      accentText: '#f0f9ff',
    },
    monsterType: 'frost_wolf',
    bossName: 'Goliath Frost Wyrm',
    bossHealth: 2000,
  },
  {
    id: 5,
    name: 'Cyber Grid',
    theme: 'Retro Vaporwave',
    milestoneDistance: 2100,
    colors: {
      bg: '#0b0114',     // Synthwave void
      road: '#030008',   // Electronic pitch-black track
      side: '#1e0134',   // Cyber punk deep violet
      accent: '#ec4899', // Vapor neon pink
      accentText: '#fdf2f8',
    },
    monsterType: 'glitch_bot',
    bossName: 'Binary Core Overlord',
    bossHealth: 5500,
  },
  {
    id: 6,
    name: 'Demonic Rift',
    theme: 'Abyssal Void',
    milestoneDistance: 2800,
    colors: {
      bg: '#000000',     // Eternal black hole
      road: '#0c0714',   // Midnight violet pavement
      side: '#3f0712',   // Blood red borders
      accent: '#f97316', // Hellfire orange
      accentText: '#fff7ed',
    },
    monsterType: 'demon',
    bossName: 'Lord Diablo Archimonde',
    bossHealth: 13000,
  },
];

// Programmatic level length adjustment based on user request:
// - Reduce the level length by 50 percent (starts Level 1 at 150m)
// - Increase each level after by 10%
// - Max level length is 1500m
LEVEL_THEMES.forEach((lvl, idx) => {
  if (idx === 0) {
    lvl.milestoneDistance = 150; // Reduced by 50% from 300m
  } else {
    lvl.milestoneDistance = Math.min(1500, Math.round(LEVEL_THEMES[idx - 1].milestoneDistance * 1.1));
  }
});


export const GEAR_TEMPLATES = {
  weapon: [
    { name: 'Plasma Repeater', icon: '🔫', statName: 'Damage Bonus' },
    { name: 'Laser Carbine', icon: '⚡', statName: 'Damage Bonus' },
    { name: 'Heavy Minigun', icon: '💣', statName: 'Fire Rate Bonus' },
    { name: 'Quantum Railgun', icon: '🌠', statName: 'Damage Bonus' },
  ],
  armor: [
    { name: 'Carbon Plating', icon: '🛡️', statName: 'Starting Force' },
    { name: 'Titanium Shell', icon: '🔩', statName: 'Starting Force' },
    { name: 'Nanotech Weave', icon: '💠', statName: 'Starting Force' },
    { name: 'Deflector Jumpsuit', icon: '🥋', statName: 'Magnet Range' },
  ],
  boots: [
    { name: 'Thrust Boosters', icon: '🥾', statName: 'Fire Rate Bonus' },
    { name: 'Warp Treads', icon: '👟', statName: 'Fire Rate Bonus' },
    { name: 'Hover Soles', icon: '🛹', statName: 'Magnet Range' },
  ],
  ring: [
    { name: 'Midas Band', icon: '💍', statName: 'Gold Multiplier' },
    { name: 'Siren Band', icon: '⭕', statName: 'Magnet Range' },
    { name: 'Matrix Loop', icon: '🌀', statName: 'Fire Rate Bonus' },
  ],
};

export function generateRandomGear(rarityOverride?: 'common' | 'rare' | 'epic' | 'legendary'): GearItem {
  const slots: Array<'weapon' | 'armor' | 'boots' | 'ring'> = ['weapon', 'armor', 'boots', 'ring'];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  
  const templates = GEAR_TEMPLATES[slot];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Rarity determination
  let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  if (rarityOverride) {
    rarity = rarityOverride;
  } else {
    const roll = Math.random();
    if (roll > 0.97) rarity = 'legendary';
    else if (roll > 0.88) rarity = 'epic';
    else if (roll > 0.65) rarity = 'rare';
  }

  // Stat calculations based on rarity
  let statValue = 0;
  const multipliers = {
    common: 1,
    rare: 2,
    epic: 4,
    legendary: 8,
  };
  const mult = multipliers[rarity];

  if (template.statName === 'Damage Bonus') {
    // Stat is flat +Dmg (e.g. +1 to +8)
    statValue = Math.floor(1 + Math.random() * 2) * mult;
  } else if (template.statName === 'Fire Rate Bonus') {
    // Stat is percentage speed boost (e.g. +5% to +40%)
    statValue = (3 + Math.floor(Math.random() * 3)) * mult;
  } else if (template.statName === 'Starting Force') {
    // Extra starting soldiers (e.g. +1 to +8)
    statValue = Math.floor(1 + Math.random() * 2) * mult;
  } else if (template.statName === 'Gold Multiplier') {
    // E.g. +10% to +80% gold drop
    statValue = (5 + Math.floor(Math.random() * 5)) * mult;
  } else if (template.statName === 'Magnet Range') {
    // E.g. +15% to +120% magnet size
    statValue = (10 + Math.floor(Math.random() * 5)) * mult;
  }

  return {
    id: `gear_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    slot,
    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${template.name}`,
    rarity,
    statName: template.statName,
    statValue,
    icon: template.icon,
    equipped: false,
  };
}

export const CHARACTERS: GameCharacter[] = [
  {
    id: 'alex',
    name: 'Alex the Alchemist',
    role: 'Quantum Strategist',
    avatar: '🧪',
    advantage: 'MATH_HINTS',
    advantageDesc: 'Math Genius: Correct doors are highlighted automatically with an emerald ring!',
    color: 'from-emerald-500 to-green-600',
  },
  {
    id: 'max',
    name: 'Max the Marine',
    role: 'Tactical Commander',
    avatar: '💂',
    advantage: 'DOUBLE_STREAM',
    advantageDesc: 'Dual Barrel: Fires dual parallel projectile streams, doubling force output!',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'sam',
    name: 'Sam the Scavenger',
    role: 'Magnetized Outlaw',
    avatar: '🧑‍🔧',
    advantage: 'MAGNETIZER',
    advantageDesc: 'Vortex Aura: Pulls loot/coins from double the standard magnet range!',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'luna',
    name: 'Luna the Laser Cadet',
    role: 'Cosmic Pilot',
    avatar: '👩‍🚀',
    advantage: 'ORBITAL_PLASMA',
    advantageDesc: 'Force Satellite: Spawns laser satellite probes that zap nearby monsters!',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'kai',
    name: 'Kai the Knight',
    role: 'Aegis Guardian',
    avatar: '⚔️',
    advantage: 'IRON_SHIELD',
    advantageDesc: 'Aegis Barrier: Grants a 5-second invincibility barrier at spawn & after gates!',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    id: 'val',
    name: 'Val the Viper',
    role: 'Infiltration Assassin',
    avatar: '🥷',
    advantage: 'RAPID_FIRE',
    advantageDesc: 'Overclock: 45% faster baseline weapon firing rate out of the box!',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'aura',
    name: 'Aura the Archmage',
    role: 'VIP Void Shifter',
    avatar: '✨',
    advantage: 'PREMIUM_VOID',
    advantageDesc: 'Celestial Void: Converts all subtraction/division gates on the road automatically into positive addition or multiplication buffs! (Premium VIP Character)',
    color: 'from-purple-500 via-pink-500 to-indigo-600',
    isPremium: true,
  },
];

import { GameCharacter } from './types';
