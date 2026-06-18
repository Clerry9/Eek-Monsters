export type GameStage = 'MENU' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' | 'UPGRADES' | 'ARMORY' | 'HELP' | 'SHOP' | 'BESTIARY' | 'LEADERBOARD' | 'REPORTS';

export type MathMode = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed' | 'algebraic' | 'fractions' | 'percentages' | 'exponents';

export type MathDifficulty = 'easy' | 'medium' | 'hard';

export interface GameCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  advantage: string;
  advantageDesc: string;
  color: string;
  isPremium?: boolean;
}

export interface LevelTheme {
  id: number;
  name: string;
  theme: string; // e.g. 'Slime Forest'
  milestoneDistance: number; // e.g. 1000m
  colors: {
    bg: string;
    road: string;
    side: string;
    accent: string;
    accentText: string;
  };
  monsterType: string;
  bossName: string;
  bossHealth: number;
}

export interface Soldier {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  shootCooldown: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  dmg: number;
  vx: number;
  vy: number;
  type?: 'normal' | 'missile' | 'plasma';
}

export type EnemyType = 'slime' | 'skeleton' | 'fire_elemental' | 'glitch_bot' | 'frost_wolf' | 'demon' | 'zombie' | 'boss';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
  angle: number;
  wobbleSeed: number;
  isBoss: boolean;
  armorBroken?: boolean;
}

export interface MathGate {
  id: string;
  y: number; // Distance down the road
  leftGate: {
    text: string;
    op: string; // '+', '-', '*', '/', or equation text
    val: number;
    calcValue: (current: number) => number; // Evaluates result
  };
  rightGate: {
    text: string;
    op: string;
    val: number;
    calcValue: (current: number) => number;
  };
  triggered: boolean;
  mode?: MathMode;
}

export interface MathGateReview {
  id: string;
  distance: number;
  initialSoldiers: number;
  leftText: string;
  rightText: string;
  choice: 'left' | 'right';
  outcomeValue: number;
  alternateValue: number;
  isBetterChoice: boolean;
  explanation: string;
  mode?: MathMode;
  opLeft?: string;
  opRight?: string;
}

export type LootType = 'coin' | 'gem' | 'magnet' | 'firerate' | 'shield' | 'gear' | 'machinegun' | 'missile' | 'plasma';

export interface GearItem {
  id: string;
  slot: 'weapon' | 'armor' | 'boots' | 'ring';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  statName: string;
  statValue: number; // percentage or flat
  icon: string;
  equipped: boolean;
}

export interface Loot {
  id: string;
  x: number;
  y: number;
  type: LootType;
  value: number; // gold count or time/gear details
  gearData?: GearItem;
  size: number;
  magnetVelocityX?: number;
  magnetVelocityY?: number;
}

export interface ActivePowerup {
  type: LootType;
  durationLeft: number; // in frames or ms
  maxDuration: number;
}

export interface UpgradeState {
  startingSoldiers: number; // base soldiers
  fireRateLevel: number;    // reduction in bullet cooldown
  damageLevel: number;       // +damage per bullet
  magnetLevel: number;       // magnet pull radius
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardType: 'coins' | 'buff_damage' | 'buff_starting';
  rewardValue: number;
  completed: boolean;
  claimed: boolean;
}

export interface ColorPalette {
  id: string;
  name: string;
  bgBgClass: string;       // main screen wrapper bg
  bgMenuClass: string;     // container menu bg
  cardClass: string;       // inner cards background
  borderClass: string;     // border styling
  textClass: string;       // primary text color
  btnClass: string;        // primary cta button color
  hudTextClass: string;    // specific game indicators
  roadColor: string;       // override road color on canvas
  badgeColor: string;      // mini tags badges
}

export interface UserProfile {
  id: string;
  username: string;
  isGuest: boolean;
  avatar: string; // emote icon
  pin?: string;   // 4-digit numeric pin, optional
  createdAt: number;
  streakCount?: number;
  lastLoginDate?: string;
  streakClaimedToday?: boolean;
}


