import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LevelTheme, MathMode, UpgradeState, GearItem, Soldier, Projectile, Enemy, MathGate, Loot, ActivePowerup, LootType, MathDifficulty, EnemyType, MathGateReview } from '../types';
import { generateMathGate } from '../utils/mathGenerator';
import { generateRandomGear, CHARACTERS } from '../data';
import { sound } from '../utils/audio';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, RotateCcw, Shield, Gift } from 'lucide-react';

interface GameCanvasProps {
  level: LevelTheme;
  mathMode: MathMode;
  mathDifficulty: MathDifficulty;
  characterId: string;
  upgrades: UpgradeState;
  inventory: GearItem[];
  setInventory: React.Dispatch<React.SetStateAction<GearItem[]>>;
  isDoubleCoins?: boolean;
  hasPremiumMagnet?: boolean;
  is3DMode?: boolean;
  is256BitGraphics?: boolean;
  extraTroopsActive?: boolean;
  onWin: (goldEarned: number, lootDropped: GearItem | null, newGateReviews: MathGateReview[], soldierProgressHistory: { distance: number; soldiers: number }[]) => void;
  onLose: (goldEarned: number, newGateReviews: MathGateReview[], soldierProgressHistory: { distance: number; soldiers: number }[]) => void;
  onBack: () => void;
  onAutoSave?: (isAuto?: boolean) => void;
}

const PIXEL_ART: Record<string, string[]> = {
  zombie: [
    "  ..KKKKK..  ",
    " .KGGGGGGGK. ",
    " KGRGGGGGGRK ",
    " KGGGGGGGGGK ",
    " .KGGgGGgGK. ",
    "  .KKKKKKK.  ",
    " .KssSSssSK. ",
    " KssSSSSssK  ",
    " .K.    .K.  ",
    "  K.    .K   "
  ],
  slime: [
    "  ...KKKK...  ",
    " .KLLLLLLLLK. ",
    "KLLLLCCLLLLLK",
    "KLLKKLLKKLLLK",
    "KLLLLLLLLLLLK",
    " .KLLLLLLLLK. ",
    "  .KLLLLLLK.  ",
    "   ..KKKK..   "
  ],
  skeleton: [
    "  ..KKKKK..  ",
    " .KWWWWWWWK. ",
    " KWKWWKWWKWK ",
    " .KWKKKKKW.  ",
    "  .KWWWWK.   ",
    "  .KKWKK.    ",
    " .KWWWWWWK.  ",
    " K.W.  .W.K  ",
    " K.    .K    "
  ],
  fire_elemental: [
    "    ..K..    ",
    "   .KOYOK.   ",
    "  .KOOOOOK.  ",
    " .KORXKXROK. ",
    " KOOXXXXXOOK ",
    " .KOOXXXOOK. ",
    "  .KOOOOK.   ",
    "   .KOK.     ",
    "    .K.      "
  ],
  frost_wolf: [
    "   ..KK..    ",
    "  .KCCCK.    ",
    " .KCCCCWCK.  ",
    " KCCCCCCWK.  ",
    " .KCCCCW.    ",
    "  .KCCC.     ",
    "  K.  .K     ",
    "  K.  .K     "
  ],
  glitch_bot: [
    " .KKKKKKKK. ",
    "KIIIIIIIIIIK",
    "KIGGGGGGGGIK",
    "KIGRKKKKRGIK",
    "KIGGGGGGGGIK",
    " KKKKKKKKKK ",
    " .KWWWWWWK. ",
    " K.  ..  .K "
  ],
  demon: [
    " K..KKK..K ",
    " .KRRRRRK. ",
    " KRYKRYKRK ",
    " .KRRRRRK. ",
    "  KXXXXK   ",
    " KXXXXXX   ",
    "  KX..XK   ",
    "  K.  .K   "
  ],
  soldier: [
    "  ..KKKKK..  ",
    " .KTTMTTK..  ",
    " KTMVVVMTK.  ",
    " .KTTMTTK..  ",
    "  .KKKKKK..  ",
    "  .KTMtMTK.  ",
    " .KTMvvMTK.  ",
    " KTd.  .dTK  ",
    " K.    .K..  "
  ],
  hero: [
    "  ..KKKKK..  ",
    " .KMMHMMK..  ",
    " KMVVVVVMK.  ",
    " .KMMHMMK..  ",
    "  .KKKKKK..  ",
    "  .KMHtHMK.  ",
    " .KMHvvHMK.  ",
    " KHd.  .dHK  ",
    " K.    .K..  "
  ],
  boss: [
    "   ...KKKKKKK...   ",
    "  .KKKWWWWWWWKKK.  ",
    " KWWWWWWWWWWWWWWK  ",
    " KWRWWRWWRWWRWWRK  ",
    "  KWWWWWWWWWWWWK   ",
    "   .KSSsssssSSK.   ",
    "  .KSSSSSSSSSssK.  ",
    "  KSSKKKKKKKKKSSK  ",
    "   .KPPPPPPPaaK.   ",
    "   K.         .K   "
  ]
};

const PIXEL_COLORS: Record<string, string> = {
  ".": "transparent",
  "G": "#10b981", // Bright classic toxic zombie green
  "g": "#047857", // Darker green shading
  "R": "#ef4444", // Glowing red blood/eyes
  "r": "#991b1b", // Dark crimson shading
  "Y": "#fbbf24", // Yellow sparkles / gold
  "y": "#d97706", // Gold/amber shading
  "W": "#f8fafc", // White bones or soldier helmet
  "w": "#cbd5e1", // Slate/grey shading for white
  "K": "#020617", // Outline thick dark ink
  "S": "#a855f7", // Violet tattered rags / demon body
  "s": "#701a75", // Darker purple shadows
  "P": "#3b82f6", // Blue tattered trousers
  "p": "#1d4ed8", // Darker shading blue
  "L": "#a3e635", // Lime neon slime
  "l": "#4d7c0f", // Dark lime shading
  "O": "#f97316", // Lava fire orange
  "o": "#c2410c", // Dark lava shading
  "X": "#dc2626", // Dark hell red
  "x": "#7f1d1d", // Shadow hell red
  "C": "#38bdf8", // Arctic ice cyan
  "c": "#0369a1", // Deep ice cyan shading
  "D": "#1e293b", // Soldier dark glass visor
  "d": "#0f172a", // Deep shadow black-blue
  "I": "#06b6d4", // Soldier tactical neon cyan armor suit
  "i": "#0891b2", // Dark cyber armor shading
  "a": "#f59e0b", // Gold glow accent
  "M": "#1e293b", // Slate carbon metal (Midnight body plating)
  "m": "#0f172a", // Shadow carbon
  "T": "#475569", // Tactical steel gray plates
  "t": "#334155", // Medium shadow steel
  "H": "#64748b", // Light titanium metal
  "V": "#22d3ee", // Glowing cyberpunk cyan visor light (looks amazing)
  "v": "#39ff14", // Glowing cyberpunk neon green panel lights
};

const drawPixelSprite = (ctx: CanvasRenderingContext2D, spriteKey: string, size: number, colorOverrides?: Record<string, string>) => {
  const grid = PIXEL_ART[spriteKey] || PIXEL_ART['zombie'];
  const rows = grid.length;
  const cols = grid[0].length;
  const pxSizeX = size / cols;
  const pxSizeY = size / rows;
  
  const startX = -size / 2;
  const startY = -size / 2;

  for (let r = 0; r < rows; r++) {
    const rowStr = grid[r];
    for (let c = 0; c < cols; c++) {
      const char = rowStr[c];
      if (char && char !== '.') {
        const color = (colorOverrides && colorOverrides[char]) || PIXEL_COLORS[char] || '#fff';
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(startX + c * pxSizeX),
          Math.floor(startY + r * pxSizeY),
          Math.ceil(pxSizeX),
          Math.ceil(pxSizeY)
        );
      }
    }
  }
};

const projectPerspective = (x: number, y: number, canvasHeight: number = 640): { x: number; y: number; scale: number } => {
  const horizonY = 135; 
  // Map y (ranges 0 to 640) into a normalized z progression from horizon (0.0) to foreground (1.0)
  const progress = (y - horizonY) / (canvasHeight - horizonY);
  const z = Math.max(0.01, Math.min(progress, 1.25));
  
  // Non-linear projection scale yields cinematic depth perception
  const scale = 0.22 + z * z * 0.78; 
  
  const roadCenter = 240;
  const px = roadCenter + (x - roadCenter) * scale;
  const py = horizonY + z * (canvasHeight - horizonY);
  return { x: px, y: py, scale };
};

const drawPalmTree = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, leanLeft: boolean) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Draw soft shadow under palm
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw natural curved palm trunk
  ctx.strokeStyle = '#78350f'; // wood-brown bark
  ctx.lineWidth = 7.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const lean = leanLeft ? -22 : 22;
  ctx.bezierCurveTo(lean * 0.3, -25, lean * 0.7, -50, lean, -80);
  ctx.stroke();
  
  // Ring-pattern bark segments
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(lean * 0.1, -10); ctx.lineTo(lean * 0.25, -11.5);
  ctx.moveTo(lean * 0.3, -25); ctx.lineTo(lean * 0.45, -26.5);
  ctx.moveTo(lean * 0.5, -45); ctx.lineTo(lean * 0.65, -46.5);
  ctx.moveTo(lean * 0.75, -62); ctx.lineTo(lean * 0.9, -63.5);
  ctx.stroke();

  // Position at top crown of leaves
  ctx.translate(lean, -80);
  
  // Draw green leaves/fronds spreading out and dropping down elegantly
  ctx.fillStyle = '#166534'; // rich emerald outer
  ctx.strokeStyle = '#14532d'; // dark forest border
  ctx.lineWidth = 1.5;
  
  const fronds = 6;
  for (let i = 0; i < fronds; i++) {
    const angle = (i / fronds) * Math.PI * 2 + (leanLeft ? 0.3 : -0.3);
    ctx.save();
    ctx.rotate(angle);
    
    // Feathered palm leaf path
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(24, -13, 44, -7);
    ctx.quadraticCurveTo(24, 7, 0, 0);
    ctx.fill();
    ctx.stroke();
    
    // Highlight centerline leaf rib
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(24, -13, 44, -7);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw 2 round brown coconuts at the crop of leaves
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(-2.5, 2, 4, 0, Math.PI * 2);
  ctx.arc(3, -1, 3.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

const GameCanvas = React.memo(function GameCanvas({
  level,
  mathMode,
  mathDifficulty,
  characterId,
  upgrades,
  inventory,
  setInventory,
  isDoubleCoins = false,
  hasPremiumMagnet = false,
  is3DMode = true,
  is256BitGraphics = true,
  extraTroopsActive = false,
  onWin,
  onLose,
  onBack,
  onAutoSave,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [hyperUpgradeChoicePending, setHyperUpgradeChoicePending] = useState(false);
  const [milestoneToast, setMilestoneToast] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soldierCount, setSoldierCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [distanceRun, setDistanceRun] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1.0);
  const [gatesAnswered, setGatesAnswered] = useState(0);
  const [runGold, setRunGold] = useState(0);
  const [bossHealthPercent, setBossHealthPercent] = useState<number | null>(null);
  const [isBossFight, setIsBossFight] = useState(false);
  const [bossBannerActive, setBossBannerActive] = useState(false);
  const [framerSplashes, setFramerSplashes] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [combatLogs, setCombatLogs] = useState<{ id: string; text: string; color: string; type: 'hit' | 'kill' | 'system' }[]>([]);

  const addCombatLog = (text: string, color: string, type: 'hit' | 'kill' | 'system' = 'hit') => {
    setCombatLogs(prev => {
      const next = [{ id: `log_${Date.now()}_${Math.random()}`, text, color, type }, ...prev];
      return next.slice(0, 10);
    });
  };

  const triggerFramerSplash = (x: number, y: number, color: string) => {
    const id = `splash_${Date.now()}_${Math.random()}`;
    setFramerSplashes(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setFramerSplashes(prev => prev.filter(s => s.id !== id));
    }, 1100);
  };

  // Game Engine Mutable Refs (to avoid React trigger latency during 60FPS tick)
  const stateRef = useRef({
    distance: 0,
    speed: 3.5, // forward speed of road
    lastAutoSaveMilestone: 0,
    virtualSoldierCount: 1,
    mouseX: 240, // target center
    mouseY: 530, // target vertical center
    soldiersList: [] as Soldier[],
    projectilesList: [] as Projectile[],
    enemiesList: [] as Enemy[],
    explosions: [] as { x: number; y: number; frame: number; maxFrames: number; size: number; color: string }[],
    gatesList: [] as MathGate[],
    lootList: [] as Loot[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number; life: number }[],
    floatingTexts: [] as { x: number; y: number; text: string; color: string; duration: number; isDamage?: boolean }[],
    activePowerupsMap: {} as Record<string, number>, // Powerup durations
    bossEnemy: null as Enemy | null,
    bossSpawned: false,
    goldThisRun: 0,
    nextEnemyId: 1,
    lootGearDropped: null as GearItem | null,
    roadOffset: 0,
    cameraShake: 0,
    isEnded: false,
    frameId: 0,
    activeKeys: new Set<string>(),
    screenFlashAlpha: 0,
    bossSpecialTimer: 0,
    gateReviewHistory: [] as MathGateReview[],
    soldierHistory: [] as { distance: number; soldiers: number }[],
    comboCount: 0,
    lastGateCrossedTime: 0,
    currentComboMultiplier: 1.0,
    prevMouseX: 240,
    tilt: 0,
    hasTriggeredHyperUpgradeChoice: false,
    selectedHyperUpgrade: null as 'laser' | 'missiles' | 'sentry' | null,
    sentryAngle: 0,
    sentryLaserCooldown: 0,
    consecutiveWrongAnswers: 0,
    gatesAnswered: 0,
  });

  const hasInitializedRef = useRef(false);

  // Calculate stats incorporating upgrades + active inventory items + completed card set bonuses
  const getGearStats = () => {
    const equipped = inventory.filter(i => i.equipped);
    let startForceBuff = equipped.filter(i => i.statName === 'Starting Force').reduce((sum, i) => sum + i.statValue, 0);
    let dmgBuff = equipped.filter(i => i.statName === 'Damage Bonus').reduce((sum, i) => sum + i.statValue, 0);
    let speedBuff = equipped.filter(i => i.statName === 'Fire Rate Bonus').reduce((sum, i) => sum + i.statValue, 0);
    let goldBuff = equipped.filter(i => i.statName === 'Gold Multiplier').reduce((sum, i) => sum + i.statValue, 0);
    let magBuff = equipped.filter(i => i.statName === 'Magnet Range').reduce((sum, i) => sum + i.statValue, 0);

    // Passive completed weapon/armor card set energy buffs
    const hasItemWithWord = (word: string) => inventory.some(item => item.name.toLowerCase().includes(word.toLowerCase()));
    
    if (hasItemWithWord('Plasma Repeater') && hasItemWithWord('Carbon Plating') && hasItemWithWord('Thrust Boosters')) {
      speedBuff += 15; // Set 1: Plasma Commando speed energy +15%
    }
    if (hasItemWithWord('Quantum Railgun') && hasItemWithWord('Nanotech Weave') && hasItemWithWord('Matrix Loop')) {
      dmgBuff += 2;    // Set 2: Quantum Cybernet damage energy +2
    }
    if (hasItemWithWord('Midas Band') && hasItemWithWord('Siren Band') && hasItemWithWord('Hover Soles')) {
      goldBuff += 25;  // Set 3: Midas Coinsweep gold energy +25%
    }
    if (hasItemWithWord('Heavy Minigun') && hasItemWithWord('Titanium Shell') && hasItemWithWord('Deflector Jumpsuit')) {
      startForceBuff += 5; // Set 4: Heavy Titan army energy +5
    }

    return {
      startForceBuff,
      dmgBuff,
      speedBuff,
      goldBuff,
      magBuff,
    };
  };

  const gear = getGearStats();

  // Final Stats Applied
  const totalStartingSoldiers = upgrades.startingSoldiers + gear.startForceBuff + (extraTroopsActive ? 2 : 0);
  const fireRateCooldown = Math.max(2, 11 - upgrades.fireRateLevel * 0.75 - Math.floor(gear.speedBuff * 0.12));
  const bulletDamage = upgrades.damageLevel + gear.dmgBuff;
  const magnetRadius = (60 + upgrades.magnetLevel * 15 + Math.floor(gear.magBuff * 1.2)) * (hasPremiumMagnet ? 4.0 : 1.0);
  const goldBonusCoeff = (1.0 + (gear.goldBuff / 100)) * (isDoubleCoins ? 2.0 : 1.0);

  // Initialize Game on Mount
  useEffect(() => {
    const state = stateRef.current;
    
    if (!hasInitializedRef.current) {
      // Reset state
      state.distance = 0;
      state.speed = (0.50 + level.id * 0.08) * 0.575 * 1.1; // Handled 15% + additional 10% speed increase
      state.lastAutoSaveMilestone = 0;
      state.isEnded = false;
      state.goldThisRun = 0;
      state.bossSpawned = false;
      state.bossEnemy = null;
      state.lootGearDropped = null;
      state.cameraShake = 0;
      state.activeKeys.clear();
      
      // Character-specific advantage: Kai starting barrier (5 seconds = 300 frames)
      state.activePowerupsMap = {};
      if (characterId === 'kai') {
        state.activePowerupsMap['shield'] = 300;
      }

      state.hasTriggeredHyperUpgradeChoice = false;
      state.selectedHyperUpgrade = null;
      state.sentryAngle = 0;
      state.sentryLaserCooldown = 0;

      // Reset history tracking and combos
      state.soldierHistory = [
        { distance: 0, soldiers: Math.max(1, totalStartingSoldiers) }
      ];
      state.comboCount = 0;
      state.gatesAnswered = 0;
      state.lastGateCrossedTime = 0;
      state.currentComboMultiplier = 1.0;
      setComboCount(0);
      setComboMultiplier(1.0);
      setGatesAnswered(0);
      
      // Spawn initial soldiers centered at the bottom of the lanes
      state.soldiersList = [];
      state.mouseX = 240;
      state.mouseY = 530;
      const initialNum = Math.max(1, totalStartingSoldiers);
      state.virtualSoldierCount = initialNum;
      for (let i = 0; i < Math.min(initialNum, 60); i++) {
          state.soldiersList.push({
            id: `s_${i}`,
            x: 240 + (Math.random() - 0.5) * 30,
            y: 530 + (Math.random() - 0.5) * 20,
            targetX: 240,
            targetY: 530,
            shootCooldown: Math.floor(Math.random() * fireRateCooldown),
          });
      }

      state.projectilesList = [];
      state.enemiesList = [];
      state.lootList = [];
      state.particles = [];
      state.floatingTexts = [];
      
      // Pre-generate exactly 15 math gates evenly spaced across the run length
      state.gatesList = [];
      const TOTAL_GATES_COUNT = 15;
      const startMeters = 55;
      const endMeters = level.milestoneDistance - 80; // 25 meters shorter to let players prepare for boss
      const stepMeters = (endMeters - startMeters) / (TOTAL_GATES_COUNT - 1);

      for (let i = 0; i < TOTAL_GATES_COUNT; i++) {
        const distM = startMeters + (i * stepMeters);
        // Convert distance-meters to physical vertical 'y' coordinate so that it triggers exactly at distM meters
        const gDist = distM * 8 + 80;

        const rawGate = generateMathGate(`gate_idx_${i}_${Math.floor(gDist)}`, gDist, level.id, initialNum, mathMode, mathDifficulty);
        if (characterId === 'aura') {
          // Celestial Void - Flip negative gates into buffs!
          if (rawGate.leftGate.op === '-') {
            rawGate.leftGate.op = '+';
            rawGate.leftGate.text = `+${rawGate.leftGate.val}`;
            rawGate.leftGate.calcValue = (current: number) => current + rawGate.leftGate.val;
          }
          if (rawGate.leftGate.op === '/') {
            rawGate.leftGate.op = '*';
            rawGate.leftGate.text = `x${rawGate.leftGate.val}`;
            rawGate.leftGate.calcValue = (current: number) => current * rawGate.leftGate.val;
          }
          if (rawGate.rightGate.op === '-') {
            rawGate.rightGate.op = '+';
            rawGate.rightGate.text = `+${rawGate.rightGate.val}`;
            rawGate.rightGate.calcValue = (current: number) => current + rawGate.rightGate.val;
          }
          if (rawGate.rightGate.op === '/') {
            rawGate.rightGate.op = '*';
            rawGate.rightGate.text = `x${rawGate.rightGate.val}`;
            rawGate.rightGate.calcValue = (current: number) => current * rawGate.rightGate.val;
          }
        }
        state.gatesList.push(rawGate);
      }

      setSoldierCount(initialNum);
      setDistanceRun(0);
      setRunGold(0);
      setIsBossFight(false);
      setBossHealthPercent(null);

      state.consecutiveWrongAnswers = 0;
      setConsecutiveWrong(0);

      hasInitializedRef.current = true;
    }

    // Register active WASD + Arrow keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isEnded || isPaused) return;
      const key = e.key.toLowerCase();

      // Quick-select lane hotkeys '1' and '2' (Select from two Math Gates)
      if (['1', '2', 'num1', 'num2'].includes(key)) {
        const isLeft = key === '1' || key === 'num1';
        const targetX = isLeft ? 150 : 330;

        // Spawn dash particle trailing trail at previous position
        const list = state.particles;
        for (let i = 0; i < 7; i++) {
          list.push({
            x: state.mouseX,
            y: state.mouseY + (Math.random() * 24 - 12),
            vx: (isLeft ? 5 : -5) + (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 1.5,
            color: '#38bdf8',
            size: 2.2 + Math.random() * 2,
            alpha: 0.9,
            life: 14 + Math.floor(Math.random() * 8),
          });
        }

        state.mouseX = targetX;
        sound.playCoin(); // small tactical beep
        addCombatLog(`📡 MANUAL STEER: ${isLeft ? 'LEFT CORRIDOR [1]' : 'RIGHT CORRIDOR [2]'}`, '#06b6d4', 'system');
      }

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        state.activeKeys.add(key);
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (state.activeKeys.has(key)) {
        state.activeKeys.delete(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main Engine Tick
    let lastTime = performance.now();
    
    const gameTick = () => {
      if (isPaused || state.isEnded || hyperUpgradeChoicePending) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      updatePhysics();
      renderFrame(ctx, canvas);

      state.frameId = requestAnimationFrame(gameTick);
    };

    state.frameId = requestAnimationFrame(gameTick);

    return () => {
      cancelAnimationFrame(state.frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [level, isPaused, upgrades, inventory, characterId, mathMode, mathDifficulty, hyperUpgradeChoicePending]);

  // Pointer position hooks for modern horizontal slider controls
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || stateRef.current.isEnded || hyperUpgradeChoicePending) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;
    
    // Constrain control target center inside road width (between x=60 and x=420) and vertical bounds
    stateRef.current.mouseX = Math.max(60, Math.min(clientX, 420));
    stateRef.current.mouseY = Math.max(280, Math.min(clientY, 530));
  };

  const damageEnemy = (e: Enemy, amount: number, isCrit: boolean = false) => {
    const s = stateRef.current;
    
    // deduct health
    e.health -= amount;
    
    // 1. Brief high-contrast white screen-flash effect (juicy visual feedback disabled to prevent flashing screen)
    s.screenFlashAlpha = 0; 
    
    // 2. Spawn floating combat text with Press Start 2P pixelated font
    let color = '#ffffff'; // default clean white
    let displayText = `${Math.round(amount)}`;
    if (isCrit) {
      color = '#eab308'; // prominent golden amber for critical hits
      displayText = `💥CRIT ${Math.round(amount)}`;
    } else if (e.isBoss) {
      color = '#f43f5e'; // vivid crimson for boss hits
    } else if (amount > 15) {
      color = '#f97316'; // orange/amber for high value hits
    } else {
      color = level.colors.accent; // match current corridor biome theme (green / cyan / purple)
    }

    s.floatingTexts.push({
      x: e.x + (Math.random() * 20 - 10),
      y: e.y - e.size - 6,
      text: displayText,
      color: color,
      duration: isCrit ? 35 : 25, // snappy combat numbers keep the screen neat and readable
      isDamage: true,
    });
    
    // 3. High-damage screen-shake on critical hits or heavy boss damage
    if (isCrit) {
      s.cameraShake = Math.max(s.cameraShake, 9.0);
    } else if (amount >= 16 || e.isBoss) {
      s.cameraShake = Math.max(s.cameraShake, e.isBoss ? 7.0 : 3.5);
    }

    // Real-time Battle Combat log hit feed
    const name = getEnemyName(e);
    const dmgVal = Math.round(amount);
    const logText = isCrit ? `💥 CRIT! ${name} -${dmgVal}HP` : `🎯 ${name} -${dmgVal}HP`;
    addCombatLog(logText, isCrit ? '#facc15' : color, 'hit');

    // Detect armor threshold crack
    if (e.health <= e.maxHealth * 0.5 && !e.armorBroken) {
      e.armorBroken = true;
      s.cameraShake = Math.max(s.cameraShake, 4.5);
      
      // Spawn cyan sparkles at break point
      spawnHitParticles(e.x, e.y, '#38bdf8');
      
      s.floatingTexts.push({
        x: e.x,
        y: e.y + 12,
        text: "⚡ARMOR BREACH",
        color: '#38bdf8',
        duration: 32,
        isDamage: true,
      });

      addCombatLog(`⚡ SHIELD RUPTURE: ${name} ARMOR CRACKED!`, '#38bdf8', 'system');
    }
  };

  // --- PHYSICS ENGINE ---
  const updatePhysics = () => {
    const state = stateRef.current;
    if (state.isEnded) return;

    // Camera rumble reduction
    if (state.cameraShake > 0) state.cameraShake -= 0.5;

    // Calculate dynamic 3D tilting animation value based on motion speed
    const diffX = state.mouseX - state.prevMouseX;
    const targetTilt = Math.max(-0.4, Math.min(0.4, diffX * 0.05));
    state.tilt = state.tilt * 0.85 + targetTilt * 0.15;
    state.prevMouseX = state.mouseX;

    // Screen flash reduction
    if (state.screenFlashAlpha > 0) state.screenFlashAlpha -= 0.04;

    // Keyboard controls movement adjustments
    const speedX = 6.0;
    const speedY = 4.5;
    if (state.activeKeys.has('a') || state.activeKeys.has('arrowleft')) {
      state.mouseX = Math.max(60, state.mouseX - speedX);
    }
    if (state.activeKeys.has('d') || state.activeKeys.has('arrowright')) {
      state.mouseX = Math.min(420, state.mouseX + speedX);
    }
    if (state.activeKeys.has('w') || state.activeKeys.has('arrowup')) {
      state.mouseY = Math.max(280, state.mouseY - speedY);
    }
    if (state.activeKeys.has('s') || state.activeKeys.has('arrowdown')) {
      state.mouseY = Math.min(530, state.mouseY + speedY);
    }

    // Active power-up duration drops
    Object.keys(state.activePowerupsMap).forEach(key => {
      if (state.activePowerupsMap[key] > 0) {
        state.activePowerupsMap[key] -= 1;
      }
    });

    const isSpeedy = state.activePowerupsMap['firerate'] > 0;
    const isShielded = state.activePowerupsMap['shield'] > 0;
    const isMachineGun = state.activePowerupsMap['machinegun'] > 0;
    const isMissile = state.activePowerupsMap['missile'] > 0;
    const isPlasma = state.activePowerupsMap['plasma'] > 0;

    // Luna's orbital satellite zapping advantage
    if (characterId === 'luna' && state.distance % 12 < 1) {
      const satAngle = state.distance / 10;
      const sat1X = state.mouseX + Math.cos(satAngle) * 55;
      const sat1Y = state.mouseY + Math.sin(satAngle) * 25;
      const sat2X = state.mouseX - Math.cos(satAngle) * 55;
      const sat2Y = state.mouseY - Math.sin(satAngle) * 25;

      [ {x: sat1X, y: sat1Y}, {x: sat2X, y: sat2Y} ].forEach(sat => {
        const target = state.enemiesList.find(e => e.health > 0 && e.y > 0 && e.y < 580 && Math.hypot(e.x - sat.x, e.y - sat.y) < 130);
        if (target) {
          damageEnemy(target, bulletDamage * 1.5);
          spawnHitParticles(target.x, target.y, '#f472b6');
          if (target.health <= 0) {
            target.y = 9999;
            handleMonsterKill(target);
          }
          // Laser beam segment particle
          state.particles.push({
            x: sat.x,
            y: sat.y,
            vx: (target.x - sat.x) / 8,
            vy: (target.y - sat.y) / 8,
            color: '#ec4899',
            size: 2,
            alpha: 1.0,
            life: 8,
          });
        }
      });
    }

    // Scroll road forward (if not boss fight or paused)
    if (!state.bossSpawned) {
      state.distance += state.speed / 8; // simulates distance run meters
      state.roadOffset = (state.roadOffset + state.speed) % 40;
      setDistanceRun(Math.floor(state.distance));

      // Auto-save every 50 meters
      const currentMilestone = Math.floor(state.distance / 50);
      if (currentMilestone > state.lastAutoSaveMilestone) {
        state.lastAutoSaveMilestone = currentMilestone;
        if (onAutoSave) {
          onAutoSave(true);
        }
      }

      // Track soldier count progression snap relative to meters
      const snapDist = Math.floor(state.distance);
      if (snapDist > 0 && snapDist % 20 === 0) {
        const lastSnap = state.soldierHistory[state.soldierHistory.length - 1];
        if (!lastSnap || Math.abs(lastSnap.distance - snapDist) >= 10) {
          state.soldierHistory.push({
            distance: snapDist,
            soldiers: state.virtualSoldierCount
          });
        }
      }

      // Move gates (decreases scroll coordinate)
      state.gatesList.forEach(gate => {
        gate.y -= state.speed;
      });

      // Progressive spawner difficulty challenge so some troops are lost naturally over run length!
      const currentSpawnProb = 0.045 + (state.distance / level.milestoneDistance) * 0.045;
      const maxMonsterCountLimit = 18 + Math.floor(level.id * 3.5);
      if (Math.random() < currentSpawnProb && state.enemiesList.length < maxMonsterCountLimit) {
        spawnRandomEnemies();
      }
    } else {
      // BOSS FIGHT LOOP
      if (state.bossEnemy) {
        // boss slowly floats down into view until y=260 (fully visible on lower track!)
        if (state.bossEnemy.y < 260) {
          state.bossEnemy.y += 0.55; 
        }
        // slight left-right oscillation on X axis
        state.bossEnemy.x = 240 + Math.sin(state.distance / 20) * 120;
        state.distance += 0.1; // slowly count distance up

        // --- BOSS SPECIAL ATTACK DECAY & TRIGGERS ---
        if (state.bossEnemy.y >= 200) {
          // Increase attack speed by 5% per math gate answered
          const difficultyMult = 1 + (state.gatesAnswered || 0) * 0.05;
          state.bossSpecialTimer += difficultyMult;

          if (state.bossSpecialTimer >= 220) { // perform special attack approx every 3.6 seconds!
            state.bossSpecialTimer = 0;
            
            // Trigger a dramatic screen-shake animation
            state.cameraShake = 18;
            
            // Play ominous feedback sound
            sound.playBossSiren();
            
            // Spawn floating text warning
            spawnFloatingText(`⚠️ BOSS COMBUSTION BURST!`, state.bossEnemy.x, state.bossEnemy.y - 45, '#f43f5e');
            
            // Unleash burning fireball waves sweeping down, in a fan pattern!
            for (let i = -2; i <= 2; i++) {
              const angle = Math.PI / 2 + (i * 0.22); // facing downwards with a fan spread
              const fx = state.bossEnemy.x;
              const fy = state.bossEnemy.y + 20;
              
              state.enemiesList.push({
                id: `boss_fireball_${Date.now()}_${Math.random()}`,
                x: fx,
                y: fy,
                type: 'fire_elemental', // gorgeous flaming sprite!
                health: 1, // dies in 1 hit normally
                maxHealth: 1,
                speed: 3.25 * difficultyMult, // Fireball speed scaled by Difficulty Multiplier
                size: 16,
                angle: angle,
                wobbleSeed: Math.random() * 5,
                isBoss: false,
              });
            }
          }
        }
      }
    }

    // Adjust soldier positions to smoothly follow modern pointer/WASD target X, anchored near bottom Y
    const troops = state.soldiersList;
    const troopCount = troops.length;

    if (troopCount === 0) {
      triggerGameOver();
      return;
    }

    // Position troops in a tight cluster surrounding mouse position (X and Y!)
    troops.forEach((s, idx) => {
      // Procedural layout spacing offset: flocking circle formulas (horizontal spread)
      let offset = { dx: 0, dy: 0 };
      if (troopCount > 1) {
        // "seperate the heros" spacing separation significantly to prevent overlap and let them shine
        const radius = Math.min(85, 20 + Math.floor(troopCount * 1.8));
        const angle = (idx / troopCount) * Math.PI * 2 + (state.distance / 25);
        offset.dx = Math.cos(angle) * radius;
        offset.dy = Math.sin(angle) * (radius * 0.5);
      }

      // Constrain horizontal flock to follow mouse target horizontally and vertically
      s.targetX = state.mouseX + offset.dx;
      s.targetY = state.mouseY + offset.dy;

      // Smooth lerp to destination point
      s.x += (s.targetX - s.x) * 0.12;
      s.y += (s.targetY - s.y) * 0.12;

      // Keep them fully on screen, above bottom border and within side margins
      s.y = Math.min(540, s.y);
      s.x = Math.max(30, Math.min(450, s.x));

      // Cannon bullet firing
      s.shootCooldown--;
      
      const overCrowded = troopCount >= 25;
      const indexDivider = 10;
      const canShootThisIndex = !overCrowded || (idx % indexDivider === 0);

      if (s.shootCooldown <= 0 && canShootThisIndex) {
        const valCD = characterId === 'val' ? Math.max(5, Math.floor(fireRateCooldown * 0.55)) : fireRateCooldown;
        let currentCD = valCD;
        if (isSpeedy) currentCD = Math.floor(currentCD * 0.5);
        if (isMachineGun) currentCD = Math.max(3, Math.floor(currentCD * 0.33));
        s.shootCooldown = currentCD;
        
        let projType: 'normal' | 'missile' | 'plasma' = isMissile ? 'missile' : isPlasma ? 'plasma' : 'normal';
        let pDmg = isMissile ? bulletDamage * 2.2 : isPlasma ? bulletDamage * 1.4 : bulletDamage;
        
        // "when screen becomes over crowded make 1 hero equal 10" (deal 10x bullet damage)
        if (overCrowded) {
          pDmg *= 10;
        }

        // --- EXCITING CHOSEN HYPER SPECIAL WEAPON SYSTEM ---
        if (state.selectedHyperUpgrade === 'laser') {
          // Continuous heavy lasers!
          projType = 'plasma';
          pDmg *= 1.45; // even more devastating!
          state.projectilesList.push({
            id: `p_laser_${Date.now()}_${Math.random()}`,
            x: s.x,
            y: s.y - 12,
            dmg: pDmg,
            vx: 0,
            vy: -18, // laser speed
            type: 'plasma',
          });
        } else if (state.selectedHyperUpgrade === 'missiles') {
          // 3-way vulcan seeker missiles!
          pDmg *= 0.85; // balanced spread
          for (let angleOff = -0.15; angleOff <= 0.15; angleOff += 0.15) {
            state.projectilesList.push({
              id: `p_missile_spread_${Date.now()}_${angleOff}_${Math.random()}`,
              x: s.x,
              y: s.y - 12,
              dmg: pDmg,
              vx: angleOff * 15, // horizontal fan out
              vy: -13,
              type: 'missile',
            });
          }
        } else if (characterId === 'max') {
          // Double stream parallel bullets
          state.projectilesList.push({
            id: `p_max_l_${Date.now()}_${Math.random()}`,
            x: s.x - 7,
            y: s.y - 12,
            dmg: pDmg,
            vx: 0,
            vy: -12,
            type: projType,
          });
          state.projectilesList.push({
            id: `p_max_r_${Date.now()}_${Math.random()}`,
            x: s.x + 7,
            y: s.y - 12,
            dmg: pDmg,
            vx: 0,
            vy: -12,
            type: projType,
          });
        } else {
          // Spawn single bullet shooting UPWARDS
          state.projectilesList.push({
            id: `p_${Date.now()}_${Math.random()}`,
            x: s.x,
            y: s.y - 12,
            dmg: pDmg,
            vx: 0,
            vy: -12,
            type: projType,
          });
        }
        sound.playShoot();
      }
    });

    // Support Sentries drone automatic helper logic (Power upgrade choice)
    if (state.selectedHyperUpgrade === 'sentry') {
      state.sentryAngle = (state.sentryAngle || 0) + 0.055;
      const sx = state.mouseX + Math.cos(state.sentryAngle) * 55;
      const sy = state.mouseY + Math.sin(state.sentryAngle) * 35;

      state.sentryLaserCooldown = (state.sentryLaserCooldown || 0) - 1;
      if (state.sentryLaserCooldown <= 0) {
        state.sentryLaserCooldown = 12; // Fast auto firing!
        // Target nearest active enemy
        let nearest: Enemy | null = null;
        let dMin = 99999;
        state.enemiesList.forEach(e => {
          const dy = Math.hypot(e.x - sx, e.y - sy);
          if (dy < dMin && e.y < 580 && e.y > -50) {
            dMin = dy;
            nearest = e;
          }
        });

        if (nearest) {
          const targ: Enemy = nearest;
          const dx = targ.x - sx;
          const dy = targ.y - sy;
          const dist = Math.hypot(dx, dy);
          state.projectilesList.push({
            id: `sentry_p_${Date.now()}_${Math.random()}`,
            x: sx,
            y: sy,
            dmg: bulletDamage * 2.8,
            vx: (dx / dist) * 12,
            vy: (dy / dist) * 12,
            type: 'plasma',
          });
          sound.playShoot();
        }
      }
    }

    // Verify hyper upgrade trigger criteria (army size >= 100)
    if (state.virtualSoldierCount >= 100 && !state.hasTriggeredHyperUpgradeChoice) {
      state.hasTriggeredHyperUpgradeChoice = true;
      setHyperUpgradeChoicePending(true);
      setMilestoneToast(true);
      sound.playBossSiren();
    }

    // Move Proj List (Plasma bolts fired upwards)
    state.projectilesList.forEach(p => {
      p.y += p.vy;
    });
    // filter bullet out-of-bounds (past top screen margin)
    state.projectilesList = state.projectilesList.filter(p => p.y > -20);

    // Collision check for projectiles hitting Enemies
    state.enemiesList.forEach(e => {
      state.projectilesList.forEach(p => {
        // Simple bounding circle overlap
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        const contactRadius = e.size + 4;
        if (dist < contactRadius) {
          // Roll a 15% critical hit chance
          const isCrit = Math.random() < 0.15;
          const finalBlastDmg = isCrit ? p.dmg * 2.0 : p.dmg;

          if (p.type === 'missile') {
            damageEnemy(e, finalBlastDmg, isCrit);
            sound.playMonsterHit();
            spawnExplosionParticles(p.x, p.y);
            spawnSpriteExplosion(p.x, p.y, 42, '#f97316');
            p.y = -9999; // destroy rocket
            
            // Splash damage AoE
            state.enemiesList.forEach(otherE => {
              if (otherE !== e && otherE.y < 700 && Math.hypot(otherE.x - p.x, otherE.y - p.y) < 80) {
                damageEnemy(otherE, finalBlastDmg * 0.75, false);
                if (otherE.health <= 0) {
                  otherE.y = 9999;
                  handleMonsterKill(otherE);
                }
              }
            });
          } else if (p.type === 'plasma') {
            damageEnemy(e, finalBlastDmg, isCrit);
            spawnHitParticles(p.x, p.y, '#a855f7');
            spawnSpriteExplosion(p.x, p.y, 26, '#c084fc');
            sound.playMonsterHit();
            // Does NOT destroy plasma (piercings on!)
          } else {
            // Normal projectile
            damageEnemy(e, finalBlastDmg, isCrit);
            spawnHitParticles(p.x, p.y, level.colors.accent);
            spawnSpriteExplosion(p.x, p.y, 18, level.colors.accent);
            p.y = -9999;
            sound.playMonsterHit();
          }

          if (e.health <= 0) {
            e.y = 9999; // mark to cull
            handleMonsterKill(e);
          }
        }
      });
    });

    // Clean out dead enemies / projectiles
    state.enemiesList = state.enemiesList.filter(e => e.y < 700 && e.y > -150);
    state.projectilesList = state.projectilesList.filter(p => p.y > -20);

    // Move enemies downwards
    state.enemiesList.forEach(e => {
      if (!e.isBoss) {
        if (e.id && e.id.includes('boss_fireball')) {
          e.y += e.speed;
          e.x += Math.cos(e.angle) * 3; // beautiful fan spread vector outward
        } else {
          e.y += e.speed; // moves downwards!
          // wobble left and right to look animated
          e.x += Math.sin(state.distance / 10 + e.wobbleSeed) * 0.8;
          // strictly clamp position to stay inside visual lanes
          e.x = Math.max(65, Math.min(415, e.x));
        }
      }

      // Enemy touching soldiers check (Floc center at bottom 540)
      const sCenterY = 540;
      const sX = state.mouseX;
      const distToSoldierFlock = Math.hypot(e.x - sX, e.y - sCenterY);
      
      if (distToSoldierFlock < (e.size + 40)) {
        if (isShielded) {
          // safe rebound
          e.y = 9999; // destroy enemy
          spawnShieldBlockParticles(e.x, e.y);
          sound.playMonsterKill();
        } else {
          // Troop takes casualties!
          e.y = 9999; // crush monster
          const casualties = e.isBoss ? Math.ceil(state.virtualSoldierCount * 0.6) : (e.type === 'demon' || e.type === 'fire_elemental' ? 3 : 1);
          inflictCasualties(casualties);
          sound.playMonsterKill();
          state.cameraShake = 8;
        }
      }
    });

    // Evaluate boss status bar
    if (state.bossEnemy) {
      if (state.bossEnemy.health <= 0) {
        triggerVictory();
        return;
      }
      setBossHealthPercent(Math.max(0, (state.bossEnemy.health / state.bossEnemy.maxHealth) * 100));
    }

    // Check Boss Spawn Milestone triggers
    if (state.distance >= level.milestoneDistance && !state.bossSpawned) {
      spawnBoss();
    }

    // Move falling Loot
    state.lootList.forEach(loot => {
      // Pull mechanics back to average soldier flock position if magnetic trigger is reached
      const targetCenterGroupX = state.mouseX;
      const targetCenterGroupY = state.mouseY;
      
      const distanceToFlock = Math.hypot(loot.x - targetCenterGroupX, loot.y - targetCenterGroupY);
      const actualMagnetRadius = characterId === 'sam' ? magnetRadius * 2.5 : magnetRadius;
      
      if (distanceToFlock < actualMagnetRadius || loot.magnetVelocityX !== undefined) {
        // Activate pull velocity vector
        if (loot.magnetVelocityX === undefined) {
          loot.magnetVelocityX = 0;
          loot.magnetVelocityY = 0;
        }
        
        const dx = targetCenterGroupX - loot.x;
        const dy = targetCenterGroupY - loot.y;
        
        loot.magnetVelocityX! += (dx / distanceToFlock) * 0.95;
        loot.magnetVelocityY! += (dy / distanceToFlock) * 0.95;
        
        // apply velocity
        loot.x += loot.magnetVelocityX!;
        loot.y += loot.magnetVelocityY!;
        
        // speed friction limit
        loot.magnetVelocityX! *= 0.9;
        loot.magnetVelocityY! *= 0.9;
      } else {
        // float slowly downwards with road scrolling flow
        loot.y += 1.2;
      }

      // Loot collision grab
      if (distanceToFlock < 24) {
        grabLoot(loot);
        loot.y = 9999; // cull
      }
    });
    // filter culled loot (bottom boundaries)
    state.lootList = state.lootList.filter(l => l.y < 700);

    // Physics check for Math Gates collision crossing
    state.gatesList.forEach(gate => {
      // Threshold checking when passing squad Y offset (around y=540)
      if (!gate.triggered && gate.y > 60 && gate.y < 100) {
        // Soldier flock passes gate crossing threshold!
        gate.triggered = true;
        state.gatesAnswered = (state.gatesAnswered || 0) + 1;
        setGatesAnswered(state.gatesAnswered);
        
        const playerX = state.mouseX;
        const chosenSide = playerX < 240 ? 'left' : 'right';
        const finalGateChosen = chosenSide === 'left' ? gate.leftGate : gate.rightGate;

        const countBefore = state.virtualSoldierCount;
        const leftResult = Math.max(1, gate.leftGate.calcValue(countBefore));
        const rightResult = Math.max(1, gate.rightGate.calcValue(countBefore));
        
        const outcomeValue = chosenSide === 'left' ? leftResult : rightResult;
        const alternateValue = chosenSide === 'left' ? rightResult : leftResult;
        const isBetterChoice = outcomeValue >= alternateValue;

        const chosenGateText = chosenSide === 'left' ? gate.leftGate.text : gate.rightGate.text;
        const alternateGateText = chosenSide === 'left' ? gate.rightGate.text : gate.leftGate.text;

        let mathOpText = '';
        if (gate.leftGate.text.includes('+') || gate.leftGate.text.includes('-') || gate.leftGate.text.includes('×') || gate.leftGate.text.includes('÷') || gate.leftGate.text.match(/[+\-*\/]/)) {
          // Keep existing gate equations
        }

        let explanation = '';
        if (isBetterChoice) {
          explanation = `Excellent choice! With ${countBefore} ${countBefore === 1 ? 'soldier' : 'soldiers'}, choosing "${chosenGateText}" resulted in ${outcomeValue} troops. This was greater than or equal to choosing "${alternateGateText}" (which would have yielded only ${alternateValue}!).`;
        } else {
          explanation = `Watch out! With ${countBefore} ${countBefore === 1 ? 'soldier' : 'soldiers'}, choosing "${chosenGateText}" resulted in ${outcomeValue} troops, while choosing "${alternateGateText}" instead would have given you ${alternateValue} soldiers!`;
        }

        state.gateReviewHistory.push({
          id: gate.id || `review_${Date.now()}_${Math.random()}`,
          distance: Math.round(state.distance),
          initialSoldiers: countBefore,
          leftText: gate.leftGate.text === "Matrix Code" ? gate.leftGate.op : gate.leftGate.text,
          rightText: gate.rightGate.text === "Matrix Code" ? gate.rightGate.op : gate.rightGate.text,
          choice: chosenSide,
          outcomeValue,
          alternateValue,
          isBetterChoice,
          explanation,
          mode: gate.mode,
          opLeft: gate.leftGate.op,
          opRight: gate.rightGate.op,
        });

        let nextTroopCount = countBefore;
        let difference = 0;

        if (isBetterChoice) {
          state.consecutiveWrongAnswers = 0;
          setConsecutiveWrong(0);
          difference = 1;
          nextTroopCount = countBefore + 1;
        } else {
          const currentWrong = (state.consecutiveWrongAnswers || 0) + 1;
          state.consecutiveWrongAnswers = currentWrong;
          setConsecutiveWrong(currentWrong);

          if (currentWrong >= 3) {
            spawnFloatingText(`💥 3 WRONG IN A ROW! ELIMINATED!`, state.mouseX, state.mouseY - 65, '#f43f5e');
            inflictCasualties(countBefore);
            state.cameraShake = 12;
            triggerGameOver();
            return;
          }

          if (countBefore > 1) {
            difference = -1;
            nextTroopCount = countBefore - 1;
          } else {
            difference = 0;
            nextTroopCount = 1;
          }
        }

        // Calculate Combo & Speed Multiplier
        let comboGoldBonus = 0;
        const now = Date.now();
        const prevTime = state.lastGateCrossedTime;
        state.lastGateCrossedTime = now;

        if (isBetterChoice) {
          state.comboCount++;
          let speedFactor = 1.0;
          let speedText = "NORMAL";
          
          if (prevTime > 0) {
            const timePassedSec = (now - prevTime) / 1000;
            if (timePassedSec < 7) {
              speedFactor = 1.6;
              speedText = "🔥 BLITZ SPEED 1.6x";
            } else if (timePassedSec < 12) {
              speedFactor = 1.3;
              speedText = "⚡ QUICK STRIKE 1.3x";
            }
          }

          // Calculate multiplier scale
          const multiplier = 1.0 + (state.comboCount * 0.2) * speedFactor;
          state.currentComboMultiplier = multiplier;

          setComboCount(state.comboCount);
          setComboMultiplier(multiplier);

          // Reward gold coins based on combo
          comboGoldBonus = Math.round(5 * multiplier);
          state.goldThisRun += comboGoldBonus;

          // Trigger Framer Motion particle explosion!
          triggerFramerSplash(state.mouseX, state.mouseY, '#10b981');
          
          spawnFloatingText(`✨ COMBO x${state.comboCount} (${speedText}) - ADDED +🪙${comboGoldBonus}!`, state.mouseX, state.mouseY - 65, '#facc15');
        } else {
          // Suboptimal choice resets combo mechanics
          state.comboCount = 0;
          state.currentComboMultiplier = 1.0;
          setComboCount(0);
          setComboMultiplier(1.0);
          triggerFramerSplash(state.mouseX, state.mouseY, '#ef4444');
          spawnFloatingText(`💥 COMBO BROKEN!`, state.mouseX, state.mouseY - 65, '#f43f5e');
        }

        // Add to soldierHistory instantly for crisp tracking of gate outcome spikes on chart
        state.soldierHistory.push({
          distance: Math.round(state.distance),
          soldiers: nextTroopCount
        });

        if (characterId === 'kai') {
          state.activePowerupsMap['shield'] = 300; // 5 seconds post gate
          spawnFloatingText(`🛡️ Aegis Shield Activated!`, state.mouseX, state.mouseY - 55, '#06b6d4');
        }

        if (difference > 0) {
          // REINFORCE ARMY!
          addSoldiers(difference);
          sound.playGatePass(true);
          spawnFloatingText(`+${difference} Soldier! 👥`, state.mouseX, state.mouseY - 45, '#10b981');
        } else if (difference < 0) {
          // DEVASTATE ARMY!
          inflictCasualties(Math.abs(difference));
          sound.playGatePass(false);
          spawnFloatingText(`${difference} Soldier! 💀`, state.mouseX, state.mouseY - 45, '#ef4444');
          state.cameraShake = 5;
        } else {
          sound.playGatePass(false);
          spawnFloatingText(`Wrong! (Locked at 1 Hero) 💀`, state.mouseX, state.mouseY - 45, '#f43f5e');
          state.cameraShake = 3;
        }
      }
    });

    // Remove gates behind the screen (bottom side)
    state.gatesList = state.gatesList.filter(g => g.y > -50);

    // Update aesthetic particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = p.life / 30;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    // Update sprite-based explosions
    state.explosions.forEach(exp => {
      exp.frame++;
    });
    state.explosions = state.explosions.filter(exp => exp.frame < exp.maxFrames);

    // Update float text decay
    state.floatingTexts.forEach(f => {
      f.y -= 1.2; // float up
      f.duration--;
    });
    state.floatingTexts = state.floatingTexts.filter(f => f.duration > 0);
  };

  // --- SPAWNER MECHANICS ---
  const spawnRandomEnemies = () => {
    const state = stateRef.current;
    
    // Choose enemy health based on distance & level difficulty to keep it challenging
    const difficultyMult = 1 + (state.gatesAnswered || 0) * 0.05;
    const spawnMultiplier = (1 + (state.distance / 350)) * (1 + level.id * 0.35);
    
    // Type allocation
    let type: EnemyType = 'zombie';
    const tChance = Math.random();
    if (tChance > 0.85) {
      type = 'fire_elemental';
    } else if (tChance > 0.6) {
      type = 'skeleton';
    } else {
      type = 'zombie';
    }

    // Spawn 5 monsters in a perfect horizontal line across the playable width
    const monsterCount = 5;
    const spacing = (390 - 90) / (monsterCount - 1);
    const lineY = -60; // perfectly aligned horizontally
    
    for (let idx = 0; idx < monsterCount; idx++) {
      const spawnX = 90 + idx * spacing;
      const health = Math.floor(Math.max(1, (3 + Math.random() * 4) * spawnMultiplier * difficultyMult));
      const size = 16 + Math.min(24, Math.floor(health * 0.8));
      // Give them perfectly matching cohesive speeds so they stay strictly line-aligned (10% faster)
      const speed = (0.50 + Math.random() * 0.12) * 0.575 * 1.1 * difficultyMult;

      state.enemiesList.push({
        id: `enemy_${state.nextEnemyId++}`,
        x: Math.max(65, Math.min(415, spawnX)),
        y: lineY,
        type: type,
        health: health,
        maxHealth: health,
        speed: speed,
        size: size,
        angle: 0,
        wobbleSeed: Math.random() * 100,
        isBoss: false,
      });
    }
  };

  const spawnBoss = () => {
    const state = stateRef.current;
    state.bossSpawned = true;
    setIsBossFight(true);
    setBossBannerActive(true);
    sound.playBossSiren();
    
    // Scale boss health by 6x so it feels like an authentic boss fight that takes more shots
    const difficultyMult = 1 + (state.gatesAnswered || 0) * 0.05;
    const scaledMaxHealth = level.bossHealth * 6 * difficultyMult;

    const bossObj: Enemy = {
      id: 'level_boss',
      x: 240, // centered horizontally
      y: -100, // spawn far top
      type: 'boss',
      health: scaledMaxHealth,
      maxHealth: scaledMaxHealth,
      speed: 0.1,
      size: 60, // massive
      angle: 0,
      wobbleSeed: 4,
      isBoss: true,
    };

    state.bossEnemy = bossObj;
    state.enemiesList.push(bossObj);
    
    // Fanfare feedback: screenshake rumble + flashing warnings
    state.cameraShake = 32;
    state.screenFlashAlpha = 0.75;

    // Spawn 10 warning particles floating across top
    for (let i = 0; i < 15; i++) {
      spawnKillParticles(60 + i * 26, 120, '#ef4444');
    }

    spawnFloatingText(`🚨 WARNING: BOSS ENCOUNTER! 🚨`, 240, 170, '#ef4444');
    spawnFloatingText(`⚠️ ${level.bossName.toUpperCase()} HAS INNERVATED!`, 240, 205, '#f97316');
    addCombatLog(`🚨 BOSS ENCOUNTER: ${level.bossName.toUpperCase()} ENTERS CORRIDOR!`, '#ef4444', 'system');

    // Automatically dismiss full-screen warning banner after 3.5 seconds
    setTimeout(() => {
      setBossBannerActive(false);
    }, 3500);
  };

  // --- SOLDIER ADD OR SUBTRACT SYSTEMS ---
  const addSoldiers = (num: number) => {
    const state = stateRef.current;
    state.virtualSoldierCount += num;

    const targetRenderCount = Math.min(state.virtualSoldierCount, 60);
    const renderLimit = targetRenderCount - state.soldiersList.length;

    for (let i = 0; i < renderLimit; i++) {
      const avgX = state.mouseX;
      const avgY = 540;
      state.soldiersList.push({
        id: `s_add_${Date.now()}_${i}`,
        x: avgX + (Math.random() - 0.5) * 40,
        y: avgY + (Math.random() - 0.5) * 30,
        targetX: avgX,
        targetY: avgY,
        shootCooldown: Math.floor(Math.random() * fireRateCooldown),
      });
    }

    setSoldierCount(state.virtualSoldierCount);
  };

  const inflictCasualties = (num: number) => {
    const state = stateRef.current;
    const visualPuffLimit = Math.min(num, state.soldiersList.length);

    // spawn red puff particles
    for (let i = 0; i < visualPuffLimit; i++) {
      const s = state.soldiersList[state.soldiersList.length - 1 - i];
      if (s) spawnKillParticles(s.x, s.y, '#ef4444');
    }

    state.virtualSoldierCount = Math.max(0, state.virtualSoldierCount - num);
    const targetRenderCount = Math.min(state.virtualSoldierCount, 60);

    if (state.soldiersList.length > targetRenderCount) {
      state.soldiersList = state.soldiersList.slice(0, targetRenderCount);
    }
    setSoldierCount(state.virtualSoldierCount);

    if (state.virtualSoldierCount === 0) {
      triggerGameOver();
    }
  };

  // --- LOOT DROP SYSTEMS ---
  const handleMonsterKill = (e: Enemy) => {
    const state = stateRef.current;
    sound.playMonsterKill();

    const name = getEnemyName(e);
    addCombatLog(`💀 ${name} ELIMINATED!`, '#ef4444', 'kill');

    // Spawn green burst debris particles
    spawnKillParticles(e.x, e.y, level.colors.accent);

    // Spawn Loot drop chance
    const isBoss = e.isBoss;
    const lootRoll = Math.random();

    // Coins of value depending on level
    const baseCoinValue = Math.floor(1 + Math.random() * 2) * level.id;
    const adjustedCoins = Math.round(baseCoinValue * goldBonusCoeff);

    if (isBoss) {
      // BOSS drops a massive ring of treasure!
      for (let i = 0; i < 8; i++) {
        const offsetAngle = (i / 8) * Math.PI * 2;
        state.lootList.push({
          id: `loot_coin_b_${i}`,
          x: e.x + Math.cos(offsetAngle) * 35,
          y: e.y + Math.sin(offsetAngle) * 35,
          type: 'coin',
          value: adjustedCoins * 4,
          size: 10,
        });
      }

      // boss drops guaranteed gear item card!
      const gearRarityRoll = Math.random();
      let rarity: GearItem['rarity'] = 'rare';
      if (level.id >= 5 || gearRarityRoll > 0.85) rarity = 'legendary';
      else if (level.id >= 3 || gearRarityRoll > 0.5) rarity = 'epic';

      const droppedGear = generateRandomGear(rarity);
      state.lootGearDropped = droppedGear;

      // Spawn weapon box loot container inside canvas
      state.lootList.push({
        id: `loot_valuable_gear`,
        x: e.x,
        y: e.y - 10,
        type: 'gear',
        value: 1, // trigger
        gearData: droppedGear,
        size: 16, // big crate icon
      });

      sound.playGearDrop();
      spawnFloatingText(`✨ Giga Boss Loot Dropped!`, e.x, e.y - 45, '#eab308');

    } else {
      // Normal monster loot roll
      if (lootRoll < 0.35) {
        // Drop Coin
        state.lootList.push({
          id: `loot_coin_${Date.now()}_${Math.random()}`,
          x: e.x,
          y: e.y,
          type: 'coin',
          value: adjustedCoins,
          size: 8,
        });
      } else if (lootRoll > 0.94) {
        // Drop useful temporary active powerup inside a crate! (Magnet, Firerate, Shield)
        const powerups: LootType[] = ['magnet', 'firerate', 'shield'];
        const chosen = powerups[Math.floor(Math.random() * powerups.length)];
        
        state.lootList.push({
          id: `loot_pup_${Date.now()}_${Math.random()}`,
          x: e.x,
          y: e.y,
          type: chosen,
          value: 360, // 360 frames duration = 6 seconds
          size: 12,
        });
        spawnFloatingText(`🎁 Crate!`, e.x, e.y - 12, '#38bdf8');
      }
    }
  };

  const grabLoot = (loot: Loot) => {
    const state = stateRef.current;
    
    if (loot.type === 'coin') {
      state.goldThisRun += loot.value;
      setRunGold(state.goldThisRun);
      sound.playCoin();
      // Scatter coin popups beautifuly above player's head so they don't block each other!
      const scatterX = state.mouseX + (Math.random() * 32 - 16);
      const scatterY = state.mouseY - 40 + (Math.random() * 20 - 10);
      spawnFloatingText(`+🪙${loot.value}`, scatterX, scatterY, '#fbbf24');
    } else if (loot.type === 'gear' && loot.gearData) {
      // Loot dropped into inventory!
      const finalGear = loot.gearData;
      setInventory(prev => [...prev, finalGear]);
      sound.playVictory();
      spawnFloatingText(`★ ${finalGear.name}!`, state.mouseX, state.mouseY - 55, '#d946ef');
    } else {
      // Clear other active weapon loot so weapons don't stack/flicker
      if (['machinegun', 'missile', 'plasma'].includes(loot.type)) {
        delete state.activePowerupsMap['machinegun'];
        delete state.activePowerupsMap['missile'];
        delete state.activePowerupsMap['plasma'];
      }
      
      // Active Powerup
      state.activePowerupsMap[loot.type] = loot.value;
      sound.playLevelUp();
      
      const powerupLabels: Record<string, string> = {
        magnet: '🧲 Loot Vacuum!',
        firerate: '🌀 Rapid Gatling!',
        shield: '🛡️ Aura Deflector!',
        machinegun: '🔥 Cannon Overdrive!',
        missile: '🚀 Rocket Barrage!',
        plasma: '⚡ Piercing Wave Plasma!',
      };
      
      const label = powerupLabels[loot.type] || 'Weapon Loaded!';
      spawnFloatingText(label, state.mouseX, state.mouseY - 50, '#22d3ee');
    }
  };

  // --- PARTICLE GENERATORS ---
  const spawnHitParticles = (x: number, y: number, color: string) => {
    const list = stateRef.current.particles;
    for (let i = 0; i < 3; i++) {
      list.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1.5,
        color: color,
        size: 2 + Math.random() * 2,
        alpha: 1,
        life: 15 + Math.floor(Math.random() * 10),
      });
    }
  };

  const spawnKillParticles = (x: number, y: number, color: string) => {
    const list = stateRef.current.particles;
    for (let i = 0; i < 10; i++) {
       const angle = Math.random() * Math.PI * 2;
       const speed = 1.5 + Math.random() * 3.5;
       list.push({
         x: x,
         y: y,
         vx: Math.cos(angle) * speed,
         vy: Math.sin(angle) * speed - 1,
         color: color,
         size: 3 + Math.random() * 4,
         alpha: 1,
         life: 20 + Math.floor(Math.random() * 15),
       });
    }
  };

  const spawnExplosionParticles = (x: number, y: number) => {
    const list = stateRef.current.particles;
    const colors = ['#f97316', '#ef4444', '#facc15', '#b91c1c'];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 4.8;
      list.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        alpha: 1,
        life: 25 + Math.floor(Math.random() * 15),
      });
    }
  };

  const getEnemyName = (e: Enemy) => {
    if (e.isBoss) return level.bossName.toUpperCase();
    switch (e.type) {
      case 'zombie': return "CHRONO GHOUL";
      case 'skeleton': return "SAND DUCHESS";
      case 'fire_elemental': return "MAGMA SHIELD";
      case 'frost_wolf': return "TUNDRA GLADIATOR";
      case 'glitch_bot': return "BINARY REAPER";
      case 'demon': return "ABYSS REAPER";
      case 'slime': return "BIOMASS SLIME";
      default: return "ANOMALY";
    }
  };

  const spawnSpriteExplosion = (x: number, y: number, size: number = 22, color: string = '#ec4899') => {
    stateRef.current.explosions.push({
      x,
      y,
      frame: 0,
      maxFrames: 6,
      size,
      color
    });
  };

  const drawSpriteExplosion = (ctx: CanvasRenderingContext2D, exp: { x: number; y: number; frame: number; maxFrames: number; size: number; color: string }) => {
    const proj = projectPerspective(exp.x, exp.y);
    const px = proj.x;
    const py = proj.y;
    const scale = proj.scale;
    const baseSize = exp.size * scale;
    
    // Calculate percentage progress of the animation
    const prog = exp.frame / exp.maxFrames;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false; // keep it crisp and blocky!

    if (exp.frame === 1) {
      // Stage 1: Intense light flash spark
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = exp.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(px - baseSize * 0.4, py - baseSize * 0.4, baseSize * 0.8, baseSize * 0.8);
    } else if (exp.frame === 2) {
      // Stage 2: Concentric sharp pixel cross
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(px - baseSize * 0.6, py - 2 * scale, baseSize * 1.2, 4 * scale);
      ctx.fillRect(px - 2 * scale, py - baseSize * 0.6, 4 * scale, baseSize * 1.2);
      
      // Core circle
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(px, py, baseSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (exp.frame === 3) {
      // Stage 3: Bursting ring and four diagonal micro sparks
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(px, py, baseSize * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      // Inside filling block
      ctx.fillStyle = '#ffea33';
      ctx.fillRect(px - baseSize * 0.3, py - baseSize * 0.3, baseSize * 0.6, baseSize * 0.6);
    } else if (exp.frame === 4) {
      // Stage 4: Expanded hollow ring with outwards blocky particles
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(px, py, baseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Radial shards
      ctx.fillStyle = '#f97316';
      const numShards = 6;
      const dist = baseSize * 1.15;
      for (let i = 0; i < numShards; i++) {
        const angle = (i / numShards) * Math.PI * 2;
        const sx = px + Math.cos(angle) * dist;
        const sy = py + Math.sin(angle) * dist;
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      }
    } else {
      // Dissipating grey smoke drifts fading out
      const alpha = (exp.maxFrames - exp.frame) / (exp.maxFrames - 4);
      ctx.globalAlpha = Math.max(0, alpha);
      
      ctx.fillStyle = '#64748b'; // tactical dust gray
      const dist = baseSize * (1.1 + prog * 0.3);
      const numPuff = 4;
      for (let i = 0; i < numPuff; i++) {
         const angle = (i / numPuff) * Math.PI * 2 + prog;
         const sx = px + Math.cos(angle) * dist;
         const sy = py + Math.sin(angle) * dist;
         ctx.fillRect(sx - 3 * scale, sy - 3 * scale, 6 * scale, 6 * scale);
      }
    }
    
    ctx.restore();
  };

  const spawnShieldBlockParticles = (x: number, y: number) => {
    const list = stateRef.current.particles;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      list.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        color: '#38bdf8',
        size: 4,
        alpha: 1,
        life: 25,
      });
    }
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string) => {
    stateRef.current.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      duration: 50,
    });
  };

  // --- RENDERING CANVAS LOOP ---
  const renderFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = stateRef.current;
    
    // Apply camera rumble transformations
    ctx.save();
    if (state.cameraShake > 0 && state.bossSpawned) {
      const dx = (Math.random() - 0.5) * state.cameraShake;
      const dy = (Math.random() - 0.5) * state.cameraShake;
      ctx.translate(dx, dy);
    }

    // A. Draw pristine tropical ocean backdrop in background
    ctx.fillStyle = '#0284c7'; // gorgeous cyan tropical ocean water
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // B. Draw rolling waving ripples on the water to simulate deep-speed forward motion
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2.0;
    const waveOffset = (state.distance * 15) % 200;
    for (let wy = 140; wy < canvas.height + 100; wy += 80) {
      const cy = wy + waveOffset / 1.5;
      if (cy < 140) continue;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      for (let wx = 0; wx <= canvas.width; wx += 40) {
        ctx.lineTo(wx, cy + Math.sin((wx + state.distance * 25) / 35) * 4);
      }
      ctx.stroke();
    }

    // C. Draw Sky above Horizon (y < 135)
    ctx.fillStyle = '#bae6fd'; // sky blue
    ctx.fillRect(0, 0, canvas.width, 135);

    // Draw radiant atmospheric rising sun on horizon
    const sunGrad = ctx.createRadialGradient(240, 135, 5, 240, 135, 80);
    sunGrad.addColorStop(0, '#fef08a'); // sun core
    sunGrad.addColorStop(0.25, '#fde047'); // warm yellow inner
    sunGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.4)');
    sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(240, 135, 80, 0, Math.PI, true);
    ctx.fill();

    // Distant mountain ranges along the horizon line
    ctx.fillStyle = '#115e59'; // dark teal mountains
    ctx.beginPath();
    ctx.moveTo(0, 135);
    ctx.lineTo(70, 105);
    ctx.lineTo(150, 135);
    ctx.lineTo(210, 115);
    ctx.lineTo(290, 135);
    ctx.lineTo(370, 100);
    ctx.lineTo(480, 135);
    ctx.fill();

    // Faint cloud puff floating above horizon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(80, 70, 20, 0, Math.PI * 2);
    ctx.arc(105, 65, 25, 0, Math.PI * 2);
    ctx.arc(130, 70, 18, 0, Math.PI * 2);
    ctx.arc(380, 50, 15, 0, Math.PI * 2);
    ctx.arc(400, 45, 20, 0, Math.PI * 2);
    ctx.fill();

    // D. Render sandy coastal margins in perspective floor (Golden shoreline edges)
    const tlSand = projectPerspective(10, 140);
    const trSand = projectPerspective(470, 140);
    const brSand = projectPerspective(470, 640);
    const blSand = projectPerspective(10, 640);

    ctx.fillStyle = '#f5dfbb'; // golden sandy beach floor
    ctx.beginPath();
    ctx.moveTo(tlSand.x, tlSand.y);
    ctx.lineTo(trSand.x, trSand.y);
    ctx.lineTo(brSand.x, brSand.y);
    ctx.lineTo(blSand.x, blSand.y);
    ctx.closePath();
    ctx.fill();

    // Sandy floor details (pebbles, footprints, light specks)
    ctx.fillStyle = '#ca8a04';
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 30; i++) {
      const rx = 15 + ((i * 13) % 450);
      const ry = 140 + ((i * 19 + state.distance * 15) % 500);
      const p = projectPerspective(rx, ry);
      if (p.y > 140) {
        ctx.fillRect(p.x, p.y, Math.ceil(2 * p.scale), Math.ceil(2 * p.scale));
      }
    }
    ctx.globalAlpha = 1.0;

    // E. Draw main bridge wooden deck pathway centered in perspective
    const tlRoad = projectPerspective(40, 140);
    const trRoad = projectPerspective(440, 140);
    const brRoad = projectPerspective(440, 640);
    const blRoad = projectPerspective(40, 640);

    // Left 3D side edge beam projection (depth panel extruded downwards)
    ctx.fillStyle = '#451a03'; // deeper shading brown shadow
    ctx.beginPath();
    ctx.moveTo(tlRoad.x, tlRoad.y);
    ctx.lineTo(blRoad.x, blRoad.y);
    ctx.lineTo(blRoad.x, blRoad.y + 16);
    ctx.lineTo(tlRoad.x, tlRoad.y + 16 * tlRoad.scale);
    ctx.closePath();
    ctx.fill();

    // Right 3D side edge beam projection
    ctx.fillStyle = '#3c1300'; // dark shadow
    ctx.beginPath();
    ctx.moveTo(trRoad.x, trRoad.y);
    ctx.lineTo(brRoad.x, brRoad.y);
    ctx.lineTo(brRoad.x, brRoad.y + 16);
    ctx.lineTo(trRoad.x, trRoad.y + 16 * trRoad.scale);
    ctx.closePath();
    ctx.fill();

    // Top highlight borders separating top road from depth
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = Math.max(1.2, tlRoad.scale * 1.8);
    ctx.beginPath();
    ctx.moveTo(tlRoad.x, tlRoad.y);
    ctx.lineTo(blRoad.x, blRoad.y);
    ctx.moveTo(trRoad.x, trRoad.y);
    ctx.lineTo(brRoad.x, brRoad.y);
    ctx.stroke();

    // Main wooden board faces
    ctx.fillStyle = '#b45309'; // wealthy dark wood bridge boards
    ctx.beginPath();
    ctx.moveTo(tlRoad.x, tlRoad.y);
    ctx.lineTo(trRoad.x, trRoad.y);
    ctx.lineTo(brRoad.x, brRoad.y);
    ctx.lineTo(blRoad.x, blRoad.y);
    ctx.closePath();
    ctx.fill();

    // Drawing individual wooden planks lining the deck scrolling downward
    ctx.strokeStyle = '#451a03'; // Gap black/brown line between adjacent deck boards
    const plankSpacing = 26;
    const boardOffset = (state.distance * 14) % plankSpacing;
    for (let wy = -plankSpacing; wy < 510 + plankSpacing; wy += plankSpacing) {
      const cy = 145 + wy + boardOffset;
      if (cy < 140 || cy > 640) continue;
      
      const pL = projectPerspective(40, cy);
      const pR = projectPerspective(440, cy);
      
      ctx.lineWidth = Math.max(1, pL.scale * 1.5);
      ctx.beginPath();
      ctx.moveTo(pL.x, pL.y);
      ctx.lineTo(pR.x, pR.y);
      ctx.stroke();
    }

    // F. Solid structural wood logs framing the left and right border beams of the deck
    ctx.strokeStyle = '#291305'; // very rich dark thick pine log
    ctx.lineWidth = Math.max(2, 6 * tlRoad.scale);
    ctx.beginPath();
    ctx.moveTo(tlRoad.x, tlRoad.y);
    ctx.lineTo(blRoad.x, blRoad.y);
    ctx.moveTo(trRoad.x, trRoad.y);
    ctx.lineTo(brRoad.x, brRoad.y);
    ctx.stroke();

    // G. Scrolling road white/cyan dash dividers (lane stripes) on deck
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    const dividerSpacing = 85;
    const divOffset = (state.distance * 14) % dividerSpacing;
    for (let wy = -dividerSpacing; wy < 510 + dividerSpacing; wy += dividerSpacing) {
      const cy = 145 + wy + divOffset;
      if (cy < 140 || cy > 640) continue;

      const p1 = projectPerspective(173, cy);
      const p2 = projectPerspective(173, cy + 28);
      const p3 = projectPerspective(306, cy);
      const p4 = projectPerspective(306, cy + 28);

      ctx.lineWidth = Math.max(1, p1.scale * 2.5);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // H. Draw Side decorations (palms, ropes, poles)
    drawThematicBankDecors(ctx, canvas);

    // I. Draw math gates (3D stands vertical billboards)
    state.gatesList.forEach(gate => {
      drawGate(ctx, gate);
    });

    // J. Draw Projectiles with custom models (Rockets, Plasma, energy bolts)
    state.projectilesList.forEach(p => {
      const proj = projectPerspective(p.x, p.y);
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.scale(proj.scale, proj.scale);
      
      if (p.type === 'missile') {
        // Red rocket design with exhaust flame
        const pGrad = ctx.createLinearGradient(-1, -7, 1, 7);
        pGrad.addColorStop(0, '#f97316');
        pGrad.addColorStop(0.5, '#ef4444');
        pGrad.addColorStop(1, '#b91c1c');
        ctx.fillStyle = pGrad;
        ctx.fillRect(-3, -7, 6, 14);
        
        // Fuel flame nozzle
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-3, 7);
        ctx.lineTo(3, 7);
        ctx.lineTo(0, 13);
        ctx.closePath();
        ctx.fill();

        // Spawn rocket spark embers trailing slightly
        if (Math.random() < 0.2) {
          state.particles.push({
            x: p.x,
            y: p.y + 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2.5,
            color: Math.random() > 0.4 ? '#f97316' : '#94a3b8',
            size: 2 + Math.random() * 2,
            alpha: 0.75,
            life: 10 + Math.floor(Math.random() * 8),
          });
        }
      } else if (p.type === 'plasma') {
        // Neon purple heavy arc cores
        const plasmaGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 12);
        plasmaGrad.addColorStop(0, '#ffffff');
        plasmaGrad.addColorStop(0.4, '#e879f9');
        plasmaGrad.addColorStop(0.8, '#a855f7');
        plasmaGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = plasmaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Radiant glowing aura gradient matching model’s glowing projectile line
        const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
        grad.addColorStop(0, '#ffffff'); // blinding white hot core
        grad.addColorStop(0.35, '#ccfbf1'); // shiny light turquoise
        grad.addColorStop(0.55, '#22c55e'); // neon golden lime-green ring
        grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // K. Draw Loot items with realistic floating heights and grounded soft shadows
    state.lootList.forEach(l => {
      drawLoot(ctx, l);
    });

    // L. Draw Enemies (incorporating grounds and structures)
    state.enemiesList.forEach(e => {
      drawEnemy(ctx, e);
    });

    // M. Draw Soldiers (Hero Squad clustered near bottom)
    const isShielded = state.activePowerupsMap['shield'] > 0;
    const selectedChar = CHARACTERS.find(c => c.id === characterId);
    
    const overcrowded = state.soldiersList.length >= 25;
    const drawList = overcrowded
      ? state.soldiersList.filter((_, idx) => idx % 10 === 0)
      : state.soldiersList;

    drawList.forEach((s, drawIdx) => {
      // If overcrowded, each visible drawn soldier represents 10 actual soldiers!
      const actualIdx = overcrowded ? drawIdx * 10 : drawIdx;
      const proj = projectPerspective(s.x, s.y);
      const isCommander = actualIdx === 0;

      // Draw glowing background power ring for overcrowded mega-soldiers
      if (overcrowded) {
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)'; // glowing energetic gold
        ctx.lineWidth = 2.5 * proj.scale;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 22 * proj.scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      
      // Grounded soft circular shadow (Commander/Elite gets gold aura shadow)
      ctx.fillStyle = (isCommander || overcrowded) ? 'rgba(234, 179, 8, 0.4)' : 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(proj.x, proj.y + 11 * proj.scale, (isCommander ? 18 : 16) * proj.scale, (isCommander ? 8 : 7.5) * proj.scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw trooper pixel art oriented upwards
      ctx.save();
      
      // 3D Animated Run bobbing & horizontal swaying physics
      let bobY = 0;
      let swayX = 0;
      let angleAdjust = 0;
      
      if (is3DMode) {
        // Dynamic run cycle formula per soldier to stagger moves
        const runCycle = Math.sin(state.distance * 0.95 + actualIdx * 0.5);
        bobY = runCycle * 1.8 * proj.scale;
        swayX = Math.cos(state.distance * 0.5 + actualIdx * 0.4) * 1.5 * proj.scale;
        angleAdjust = state.tilt * 0.9; // Lean into steering
      }
      
      ctx.translate(proj.x + swayX, proj.y + bobY);
      
      // Set elite scale enlargement if overcrowded consolidated 1 hero = 10 mode
      const scaleMultiplier = overcrowded ? 1.35 : 1.0;
      ctx.scale(proj.scale * scaleMultiplier, proj.scale * scaleMultiplier);
      
      // Leaning 3D slant matrix transformations!
      if (is3DMode) {
        ctx.transform(1, 0, Math.tan(state.tilt * 0.35), 1, 0, 0);
      }
      
      ctx.rotate(-Math.PI / 2 + angleAdjust); // Rotate facing vertically forward + steering sway
      
      drawPixelSprite(ctx, isCommander ? 'hero' : 'soldier', isCommander ? 38 : 35);
      
      // Gorgeous 256-bit shaders: glowing visor highlight & smooth metallic specular overlay
      if (is256BitGraphics) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop'; // locks coloring mask strictly inside character pixels boundaries
        
        const sizeHalf = (isCommander ? 19 : 17.5);
        const glossGrad = ctx.createLinearGradient(-sizeHalf, -sizeHalf, sizeHalf, sizeHalf);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
        glossGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
        glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.05)');
        glossGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        
        ctx.fillStyle = glossGrad;
        ctx.beginPath();
        ctx.arc(0, 0, sizeHalf, 0, Math.PI * 2);
        ctx.fill();
        
        // High fidelity cyber visor glowing core matching the futuristic helmet visor from the image!
        // Visor glow is vibrant cyan with a bright white center glint
        if (isCommander) {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(-6, -6, 12, 1.8);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-2, -6, 4, 1.8);
          
          // Draw a sci-fi laser gun extending forward from the commander's right side
          ctx.fillStyle = '#475569'; // steel rifle body
          ctx.fillRect(5, -6, 3, 15);
          ctx.fillStyle = '#22d3ee'; // charging laser rail
          ctx.fillRect(6, -4, 1, 8);
          ctx.fillStyle = '#39ff14'; // tactical scope glow
          ctx.fillRect(7, -1, 1, 2);
        } else {
          // Normal troopers get clean high contrasted tactical visor & smaller sub-carbine rifles
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(-5, -6, 10, 1.5);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-1, -6, 3, 1.5);

          // Sub-carbine rifle
          ctx.fillStyle = '#334155';
          ctx.fillRect(4, -4, 2, 11);
          ctx.fillStyle = '#00f0ff'; // cybercharge status
          ctx.fillRect(5, -2, 1, 5);
        }
        ctx.restore();
      }
      
      ctx.restore();

      // Draw Commander's Badge Name and Crown above Leader
      if (isCommander) {
        ctx.save();
        ctx.font = `bold ${Math.max(9, Math.floor(10 * proj.scale))}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        ctx.textAlign = 'center';
        
        const leaderLabel = selectedChar ? `👑 ${selectedChar.name.split(' ')[0]}` : '👑 Leader';
        ctx.strokeText(leaderLabel, proj.x, proj.y - 18 * proj.scale);
        ctx.fillText(leaderLabel, proj.x, proj.y - 18 * proj.scale);
        ctx.restore();
      }

      // "when screen becomes overcrowded make 1 hero equal 10" - indicator badge
      if (overcrowded) {
        ctx.save();
        ctx.font = `bold ${Math.max(7, Math.floor(8.5 * proj.scale))}px "Press Start 2P"`;
        ctx.fillStyle = '#fbbf24'; // beautiful neon amber gold
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.textAlign = 'center';
        ctx.strokeText("x10", proj.x, proj.y + 22 * proj.scale);
        ctx.fillText("x10", proj.x, proj.y + 22 * proj.scale);
        ctx.restore();
      }

      // Cosmic blue neon ring surrounding shielded troopers
      if (isShielded) {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, (isCommander ? 19 : 16) * proj.scale * (overcrowded ? 1.35 : 1.0), 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = Math.max(1, 1.5 * proj.scale);
        ctx.stroke();
      }
    });

    // Support Sentry Companion rendering
    if (state.selectedHyperUpgrade === 'sentry') {
      const sAngle = state.sentryAngle || 0;
      const sx = state.mouseX + Math.cos(sAngle) * 55;
      const sy = state.mouseY + Math.sin(sAngle) * 35;
      const projSentry = projectPerspective(sx, sy);
      
      ctx.save();
      ctx.translate(projSentry.x, projSentry.y);
      ctx.scale(projSentry.scale * 1.15, projSentry.scale * 1.15);
      
      // Draw spinning cyber ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, sAngle * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing core hover orb
      const pulse = Math.sin(state.distance * 12.0) * 2;
      ctx.fillStyle = '#38bdf8'; // neon blue energy
      ctx.beginPath();
      ctx.arc(0, -6 + pulse, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Cyber metallic stabilizer plates
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, -4 + pulse, 14, 4);
      ctx.fillStyle = '#f43f5e'; // minor indicator light
      ctx.fillRect(2, -3 + pulse, 2, 2);
      
      // Thruster trail particle emitter
      if (Math.random() < 0.2) {
        state.particles.push({
          x: sx,
          y: sy + 4,
          vx: (Math.random() - 0.5) * 1.0,
          vy: 1.5,
          color: '#38bdf8',
          size: 1.5 + Math.random() * 2,
          alpha: 0.7,
          life: 8 + Math.floor(Math.random() * 6),
        });
      }
      ctx.restore();
    }

    // N. Draw visual explosive debris particles in perspective
    state.particles.forEach(p => {
      const proj = projectPerspective(p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, Math.max(1, p.size * proj.scale), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Draw sprite-based retro explosions
    state.explosions.forEach(exp => {
      drawSpriteExplosion(ctx, exp);
    });

    // O. Draw Floating text overlays with scalable perspective sizes & fading retro effects
    state.floatingTexts.forEach(f => {
      const proj = projectPerspective(f.x, f.y);
      ctx.save();
      // Decay opacity based on duration (duration starts at 50, fade out in the last 15 frames)
      ctx.globalAlpha = Math.max(0, Math.min(1.0, f.duration / 15));
      if (f.isDamage) {
        ctx.font = `bold ${Math.max(8, Math.floor(10 * proj.scale))}px "Press Start 2P", monospace`;
      } else {
        ctx.font = `black ${Math.max(12, Math.floor(16 * proj.scale))}px "Space Grotesk", sans-serif`;
      }
      
      // Retro glowing shadow drop
      ctx.shadowColor = f.color;
      ctx.shadowBlur = f.isDamage ? 3 : 6;
      
      ctx.fillStyle = f.color;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = f.isDamage ? 2.5 : 4;
      ctx.textAlign = 'center';
      ctx.strokeText(f.text, proj.x, proj.y);
      ctx.fillText(f.text, proj.x, proj.y);
      ctx.restore();
    });

    // P. Boss flier flashing alarming indicator
    if (state.bossSpawned && state.bossEnemy && state.bossEnemy.y < 260) {
      const pulseRate = Math.sin(state.distance * 1.5);
      if (pulseRate > 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.fillRect(0, 135, canvas.width, canvas.height - 135);
      }
    }

    // High-contrast screen-flash feedback layer
    if (state.screenFlashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.48, state.screenFlashAlpha)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.restore();
  };

  const drawThematicBankDecors = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = stateRef.current;
    
    // 1. Draw solid wood logs / rope barriers along the beach deck sides
    const fenceSpacing = 85;
    const fenceOffset = (state.distance * 12) % fenceSpacing;
    for (let wy = -fenceSpacing; wy < 510; wy += fenceSpacing) {
      const cy = 145 + wy + fenceOffset;
      if (cy < 140 || cy > 640) continue;

      // Left support post - Cylindrical 3D Shading
      const pL = projectPerspective(36, cy);
      const postW = 7 * pL.scale;
      const postH = 16 * pL.scale;
      const topYL = pL.y - 12 * pL.scale;

      const postGradL = ctx.createLinearGradient(pL.x - postW / 2, 0, pL.x + postW / 2, 0);
      postGradL.addColorStop(0, '#5c2205');   // Deep shadow edge
      postGradL.addColorStop(0.3, '#92400e'); // highlight ridge
      postGradL.addColorStop(0.7, '#78350f'); // mid-tone
      postGradL.addColorStop(1, '#451a03');   // dark right boundary
      ctx.fillStyle = postGradL;
      ctx.fillRect(pL.x - postW / 2, topYL, postW, postH);

      // Gold post cap knob - 3D Spherical Specular Dome
      const capRadL = ctx.createRadialGradient(
        pL.x - 1 * pL.scale, topYL - 1 * pL.scale, 0.5 * pL.scale,
        pL.x, topYL, 3.5 * pL.scale
      );
      capRadL.addColorStop(0, '#ffffff'); // Shiny light reflect specular spot!
      capRadL.addColorStop(0.3, '#fbe578'); // Highlight yellow
      capRadL.addColorStop(0.7, '#d97706'); // Warm gold-orange
      capRadL.addColorStop(1, '#78350f'); // Shadow edge
      ctx.fillStyle = capRadL;
      ctx.beginPath();
      ctx.arc(pL.x, topYL, 3.5 * pL.scale, 0, Math.PI * 2);
      ctx.fill();

      // Right support post - Cylindrical 3D Shading
      const pR = projectPerspective(444, cy);
      const postWR = 7 * pR.scale;
      const postHR = 16 * pR.scale;
      const topYR = pR.y - 12 * pR.scale;

      const postGradR = ctx.createLinearGradient(pR.x - postWR / 2, 0, pR.x + postWR / 2, 0);
      postGradR.addColorStop(0, '#5c2205');
      postGradR.addColorStop(0.3, '#92400e');
      postGradR.addColorStop(0.7, '#78350f');
      postGradR.addColorStop(1, '#451a03');
      ctx.fillStyle = postGradR;
      ctx.fillRect(pR.x - postWR / 2, topYR, postWR, postHR);

      // Gold cap sphere for Right Post
      const capRadR = ctx.createRadialGradient(
        pR.x - 1 * pR.scale, topYR - 1 * pR.scale, 0.5 * pR.scale,
        pR.x, topYR, 3.5 * pR.scale
      );
      capRadR.addColorStop(0, '#ffffff');
      capRadR.addColorStop(0.3, '#fbe578');
      capRadR.addColorStop(0.7, '#d97706');
      capRadR.addColorStop(1, '#78350f');
      ctx.fillStyle = capRadR;
      ctx.beginPath();
      ctx.arc(pR.x, topYR, 3.5 * pR.scale, 0, Math.PI * 2);
      ctx.fill();

      // Double rope connecting lines
      const nextY = cy + fenceSpacing;
      if (nextY <= 645) {
        const pLNext = projectPerspective(36, nextY);
        const pRNext = projectPerspective(444, nextY);

        ctx.strokeStyle = '#d97706'; // rope rustic color
        ctx.lineWidth = Math.max(0.8, 1.5 * pL.scale);
        
        // Sagging physical rope paths
        ctx.beginPath();
        ctx.moveTo(pL.x, pL.y - 8 * pL.scale);
        ctx.quadraticCurveTo((pL.x + pLNext.x) / 2, (pL.y + pLNext.y) / 2 - 2 * pL.scale, pLNext.x, pLNext.y - 8 * pLNext.scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pR.x, pR.y - 8 * pR.scale);
        ctx.quadraticCurveTo((pR.x + pRNext.x) / 2, (pR.y + pRNext.y) / 2 - 2 * pRNext.scale, pRNext.x, pRNext.y - 8 * pRNext.scale);
        ctx.stroke();
      }
    }

    // 2. Draw pristine tropical scrolling palms lining left and right golden beach margins
    const palmSpacing = 220;
    const palmOffset = (state.distance * 12) % palmSpacing;
    for (let wy = -palmSpacing; wy < 510; wy += palmSpacing) {
      const cy = 145 + wy + palmOffset;
      if (cy < 140 || cy > 640) continue;

      // Left palm tree (planted on sand shore x=-15)
      const pL = projectPerspective(-15, cy);
      drawPalmTree(ctx, pL.x, pL.y, pL.scale, true);

      // Right palm tree (planted on sand shore x=495)
      const pR = projectPerspective(495, cy);
      drawPalmTree(ctx, pR.x, pR.y, pR.scale, false);
    }
  };

  const drawGate = React.useCallback((ctx: CanvasRenderingContext2D, gate: MathGate) => {
    // Computes vertical draw position along the scrolling track
    const drawY = 540 - (gate.y - 75);
    if (drawY < 140 || drawY > 650) return; // Skip far-off workspace
    
    const leftIsBuff = gate.leftGate.op.includes('+') || gate.leftGate.op.includes('×');
    const rightIsBuff = gate.rightGate.op.includes('+') || gate.rightGate.op.includes('×');

    // Bottom and Top coordinates for Left Gate Panel (Vertical bill board projection)
    const blL = projectPerspective(44, drawY);
    const brL = projectPerspective(236, drawY);
    const trL = projectPerspective(236, drawY - 110);
    const tlL = projectPerspective(44, drawY - 110);

    // Left gate 3D border panel depth/thickness (extrusion)
    const thicknessL = 6 * blL.scale; 
    ctx.fillStyle = leftIsBuff ? 'rgba(14, 165, 233, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.moveTo(trL.x, trL.y);
    ctx.lineTo(brL.x, brL.y);
    ctx.lineTo(brL.x + thicknessL, brL.y + thicknessL * 0.5);
    ctx.lineTo(trL.x + thicknessL, trL.y - thicknessL * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = leftIsBuff ? 'rgba(56, 189, 248, 0.38)' : 'rgba(251, 146, 60, 0.38)';
    ctx.beginPath();
    ctx.moveTo(tlL.x, tlL.y);
    ctx.lineTo(trL.x, trL.y);
    ctx.lineTo(trL.x + thicknessL, trL.y - thicknessL * 0.5);
    ctx.lineTo(tlL.x + thicknessL, tlL.y - thicknessL * 0.5);
    ctx.closePath();
    ctx.fill();

    // 1. Draw Left Arched Glass vertical billboard
    const leftGrad = ctx.createLinearGradient(tlL.x, tlL.y, brL.x, brL.y);
    if (leftIsBuff) {
      leftGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)'); // Beautiful cyan glass
      leftGrad.addColorStop(1, 'rgba(14, 165, 233, 0.15)');
    } else {
      leftGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)'); // Warm sunset orange glass
      leftGrad.addColorStop(1, 'rgba(239, 68, 68, 0.15)');
    }

    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(tlL.x, tlL.y);
    ctx.lineTo(trL.x, trL.y);
    ctx.lineTo(brL.x, brL.y);
    ctx.lineTo(blL.x, blL.y);
    ctx.closePath();
    ctx.fill();

    // Glossy glass diagonal reflection glare
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(tlL.x + (trL.x - tlL.x) * 0.15, tlL.y + (trL.y - tlL.y) * 0.15);
    ctx.lineTo(tlL.x + (trL.x - tlL.x) * 0.4, tlL.y + (trL.y - tlL.y) * 0.4);
    ctx.lineTo(blL.x + (brL.x - blL.x) * 0.35, blL.y + (brL.y - blL.y) * 0.35);
    ctx.lineTo(blL.x + (brL.x - blL.x) * 0.1, blL.y + (brL.y - blL.y) * 0.1);
    ctx.closePath();
    ctx.fill();

    // Blazing neon glowing laser borders for Left Panel
    ctx.strokeStyle = leftIsBuff ? '#38bdf8' : '#f97316';
    ctx.lineWidth = Math.max(1.5, 4.5 * blL.scale);
    ctx.beginPath();
    ctx.moveTo(tlL.x, tlL.y);
    ctx.lineTo(trL.x, trL.y);
    ctx.lineTo(brL.x, brL.y);
    ctx.lineTo(blL.x, blL.y);
    ctx.closePath();
    ctx.stroke();

    // Bottom and Top coordinates for Right Gate Panel
    const blR = projectPerspective(244, drawY);
    const brR = projectPerspective(436, drawY);
    const trR = projectPerspective(436, drawY - 110);
    const tlR = projectPerspective(244, drawY - 110);

    // Right gate 3D border panel depth/thickness (extrusion)
    const thicknessR = 6 * blR.scale; 
    ctx.fillStyle = rightIsBuff ? 'rgba(14, 165, 233, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.moveTo(trR.x, trR.y);
    ctx.lineTo(brR.x, brR.y);
    ctx.lineTo(brR.x + thicknessR, brR.y + thicknessR * 0.5);
    ctx.lineTo(trR.x + thicknessR, trR.y - thicknessR * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = rightIsBuff ? 'rgba(56, 189, 248, 0.38)' : 'rgba(251, 146, 60, 0.38)';
    ctx.beginPath();
    ctx.moveTo(tlR.x, tlR.y);
    ctx.lineTo(trR.x, trR.y);
    ctx.lineTo(trR.x + thicknessR, trR.y - thicknessR * 0.5);
    ctx.lineTo(tlR.x + thicknessR, tlR.y - thicknessR * 0.5);
    ctx.closePath();
    ctx.fill();

    // 2. Draw Right Arched Glass vertical billboard
    const rightGrad = ctx.createLinearGradient(tlR.x, tlR.y, brR.x, brR.y);
    if (rightIsBuff) {
      rightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      rightGrad.addColorStop(1, 'rgba(14, 165, 233, 0.15)');
    } else {
      rightGrad.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
      rightGrad.addColorStop(1, 'rgba(239, 68, 68, 0.15)');
    }

    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(tlR.x, tlR.y);
    ctx.lineTo(trR.x, trR.y);
    ctx.lineTo(brR.x, brR.y);
    ctx.lineTo(blR.x, blR.y);
    ctx.closePath();
    ctx.fill();

    // Glass reflection glare for Right Panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(tlR.x + (trR.x - tlR.x) * 0.15, tlR.y + (trR.y - tlR.y) * 0.15);
    ctx.lineTo(tlR.x + (trR.x - tlR.x) * 0.4, tlR.y + (trR.y - tlR.y) * 0.4);
    ctx.lineTo(blR.x + (brR.x - blR.x) * 0.35, blR.y + (brR.y - blR.y) * 0.35);
    ctx.lineTo(blR.x + (brR.x - blR.x) * 0.1, blR.y + (brR.y - blR.y) * 0.1);
    ctx.closePath();
    ctx.fill();

    // Blazing laser border for Right Panel
    ctx.strokeStyle = rightIsBuff ? '#38bdf8' : '#f97316';
    ctx.lineWidth = Math.max(1.5, 4.5 * blR.scale);
    ctx.beginPath();
    ctx.moveTo(tlR.x, tlR.y);
    ctx.lineTo(trR.x, trR.y);
    ctx.lineTo(brR.x, brR.y);
    ctx.lineTo(blR.x, blR.y);
    ctx.closePath();
    ctx.stroke();

    // 3. Draw heavy wooden structural central support posts
    const pCenterBottom = projectPerspective(240, drawY);
    const pCenterTop = projectPerspective(240, drawY - 110);
    ctx.strokeStyle = '#451a03'; // heavy redwood pine post
    ctx.lineWidth = Math.max(2, 6 * pCenterBottom.scale);
    ctx.beginPath();
    ctx.moveTo(pCenterBottom.x, pCenterBottom.y);
    ctx.lineTo(pCenterTop.x, pCenterTop.y);
    ctx.stroke();

    // Draw little support caps on posts
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(pCenterTop.x, pCenterTop.y, 4 * pCenterTop.scale, 0, Math.PI * 2);
    ctx.fill();

    // 4. Render big math formulas projected beautifully right in center of vertical panels
    // To prevent unreadable stacking at the far-off horizon line, we enforce scale >= 0.32
    if (pCenterBottom.scale >= 0.32) {
      const textL = projectPerspective(140, drawY - 55);
      const textR = projectPerspective(340, drawY - 55);

      ctx.textAlign = 'center';
      ctx.strokeStyle = '#040d1a';
      ctx.lineWidth = 5;

      // Left formula
      const fontSizeL = Math.max(18, Math.floor(30 * textL.scale));
      ctx.font = `bold ${fontSizeL}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeText(gate.leftGate.op, textL.x, textL.y + 10 * textL.scale);
      ctx.fillText(gate.leftGate.op, textL.x, textL.y + 10 * textL.scale);

      // Right formula
      const fontSizeR = Math.max(18, Math.floor(30 * textR.scale));
      ctx.font = `bold ${fontSizeR}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeText(gate.rightGate.op, textR.x, textR.y + 10 * textR.scale);
      ctx.fillText(gate.rightGate.op, textR.x, textR.y + 10 * textR.scale);

      // Render the algebraic / mixed formula centered ONCE directly above the central support post
      // This completely separates the shared mathematical equation and avoids any visual overlap/stacking!
      if (gate.leftGate.text && mathMode === 'algebraic') {
        const equationPos = projectPerspective(240, drawY - 130);
        ctx.font = `bold ${Math.max(9, Math.floor(13 * equationPos.scale))}px "JetBrains Mono", monospace`;
        ctx.fillStyle = '#facc15'; // Glowing gold / solar yellow
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.strokeText(gate.leftGate.text, equationPos.x, equationPos.y);
        ctx.fillText(gate.leftGate.text, equationPos.x, equationPos.y);
      }

      // Alex the Sage: Drop Math Hint indicator above the mathematically superior gate
      if (characterId === 'alex') {
        const currentClones = stateRef.current.virtualSoldierCount;
        const leftVal = gate.leftGate.calcValue(currentClones);
        const rightVal = gate.rightGate.calcValue(currentClones);
        const leftIsBetter = leftVal >= rightVal;
        
        const starPos = leftIsBetter ? projectPerspective(140, drawY - 122) : projectPerspective(340, drawY - 122);
        
        ctx.save();
        ctx.translate(starPos.x, starPos.y);
        ctx.scale(starPos.scale * 1.5, starPos.scale * 1.5);
        
        ctx.fillStyle = '#facc15'; // Glowing gold star
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 10, -Math.sin((18 + i * 72) * Math.PI / 180) * 10);
          ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 4, -Math.sin((54 + i * 72) * Math.PI / 180) * 4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [characterId, mathMode]);

  const drawEnemy = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    const proj = projectPerspective(e.x, e.y);
    ctx.save();
    ctx.translate(proj.x, proj.y);
    
    // Slight angle oscillation based on scroll progress
    ctx.rotate(Math.sin(stateRef.current.distance / 4 + e.wobbleSeed) * 0.15);
    ctx.scale(proj.scale, proj.scale);

    if (e.isBoss) {
      // Draw massive Boss Overlord rotated to face DOWNWARDS at the player
      ctx.textAlign = 'center';
      
      // Determine boss specific color custom themes based on the current level theme ("alternate monster types")
      let bossColors: Record<string, string> = {};
      if (level.theme === 'Graveyard') {
        bossColors = {
          "S": "#22c55e", // Undead rotting radioactive green
          "s": "#15803d", // Shaded dark toxic green
          "R": "#ff7800", // Fiery orange eyes
          "W": "#afd8f8"  // Cyan skin accents
        };
      } else if (level.theme === 'Desert') {
        bossColors = {
          "S": "#eab308", // Ancient desert mummy gold plates
          "s": "#ca8a04", // Dark amber bronze shadows
          "R": "#22d3ee", // Electric turquoise glowing eyes
          "W": "#fef08a"  // Pale beige sand linen wrappings
        };
      } else if (level.theme === 'Lava Rock') {
        bossColors = {
          "S": "#f97316", // Blazing molten sulfur orange
          "s": "#9a3412", // Heated dark ruby magma rock
          "R": "#ffffff", // Pure white-hot fusion core eyes
          "W": "#ef4444"  // Fiery crimson trim
        };
      } else if (level.theme === 'Arctic Frost') {
        bossColors = {
          "S": "#38bdf8", // Glacial ice crystal neon plates
          "s": "#0284c7", // Deep frozen abyss blue shadows
          "R": "#ffffff", // Sparkling blizzard white glints
          "W": "#e0f2fe"  // Snow polar metal trim
        };
      } else if (level.theme === 'Retro Vaporwave') {
        bossColors = {
          "S": "#ec4899", // Synthwave neon laser pink
          "s": "#be185d", // Cyber violet dark grid trim
          "R": "#10b981", // High contrasted cybernetic neon green eyes
          "W": "#fae8ff"  // Vapor peak purple mist
        };
      } else if (level.theme === 'Abyssal Void') {
        bossColors = {
          "S": "#a855f7", // Lord Archimonde void dark purple
          "s": "#6b21a8", // Abyssal shadow indigo borders
          "R": "#f43f5e", // Terror red demonic laser eyeballs
          "W": "#312e81"  // Void dark indigo panels
        };
      }

      // 1. Draw pulsing, glowing ambient background aura
      const auraPulse = 1.0 + Math.sin(stateRef.current.distance / 5) * 0.12;
      const auraGradient = ctx.createRadialGradient(0, 0, e.size * 0.1, 0, 0, e.size * 1.6 * auraPulse);
      const mainCol = bossColors["S"] || "#ef4444";
      const shadowCol = bossColors["s"] || "#7f1d1d";
      auraGradient.addColorStop(0, `${mainCol}44`); // 25% opacity
      auraGradient.addColorStop(0.5, `${shadowCol}22`);
      auraGradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(0, 0, e.size * 1.6 * auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // 2. Swirling glowing magical orbs orbiting the boss
      const orbCount = 4;
      const orbOrbitRadius = e.size * 1.28;
      const orbAngleOffset = stateRef.current.distance / 10;
      for (let i = 0; i < orbCount; i++) {
        const angle = orbAngleOffset + (i * Math.PI * 2 / orbCount);
        const ox = Math.cos(angle) * orbOrbitRadius;
        const oy = Math.sin(angle) * orbOrbitRadius;
        
        ctx.save();
        ctx.fillStyle = mainCol;
        ctx.shadowColor = mainCol;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ox, oy, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Spiky glowing crown of absolute doom
      ctx.fillStyle = '#facc15'; // Golden status
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-16, -e.size * 0.9);
      ctx.lineTo(-26, -e.size * 1.35); // left spike
      ctx.lineTo(-8, -e.size * 1.05);
      ctx.lineTo(0, -e.size * 1.55);   // center massive spike
      ctx.lineTo(8, -e.size * 1.05);
      ctx.lineTo(26, -e.size * 1.35);  // right spike
      ctx.lineTo(16, -e.size * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      ctx.save();
      ctx.rotate(Math.PI / 2); // Rotate facing down toward player
      drawPixelSprite(ctx, 'boss', e.size * 1.8, bossColors);
      ctx.restore();
      
      // Boss target shield circle glow
      ctx.beginPath();
      ctx.arc(0, 0, e.size, 0, Math.PI * 2);
      ctx.strokeStyle = e.health <= e.maxHealth * 0.5 ? '#38bdf8' : '#ef4444'; // cyan cracked look when <50% HP
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cracked shield indicator on Boss
      if (e.health <= e.maxHealth * 0.5) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-15, -10);
        ctx.lineTo(-5, 5);
        ctx.lineTo(5, -5);
        ctx.lineTo(15, 10);
        ctx.stroke();

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-20, 5);
        ctx.lineTo(-10, -5);
        ctx.lineTo(10, 5);
        ctx.lineTo(20, -10);
        ctx.stroke();
        ctx.restore();

        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText("💢", 0, e.size * 0.7);
      }
    } else {
      // Normal monster waves
      ctx.textAlign = 'center';

      // Pick correct retro sprite based on Level monsterType setup and enemy type variability
      let spriteKey = e.type === 'slime' ? level.monsterType : e.type;
      if (spriteKey === 'slime' && level.monsterType === 'zombie') {
        spriteKey = 'zombie';
      }
      
      drawPixelSprite(ctx, spriteKey, e.size * 1.4);

      // Visual 'armor break' indicators (small shield cracks) on monsters <= 50% health
      if (e.health <= e.maxHealth * 0.5) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8'; // bright neon cyan crack glow
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        // crack pattern 1
        ctx.moveTo(-5, -3);
        ctx.lineTo(-1, 1);
        ctx.lineTo(3, -1);
        ctx.lineTo(6, 3);
        ctx.stroke();

        ctx.strokeStyle = '#e0f2fe'; // white-ish highlight
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        // crack pattern 2
        ctx.moveTo(-6, 2);
        ctx.lineTo(-2, -1);
        ctx.lineTo(2, -4);
        ctx.stroke();

        ctx.restore();

        // Small break symbol icon overlay
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText("💢", 0, e.size * 0.7 + 6);
      }

      // Enemy Health Bar on top
      if (e.health < e.maxHealth) {
        const barW = e.size * 1.5;
        const currentHB = (e.health / e.maxHealth) * barW;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barW / 2, -e.size / 1.5 - 6, barW, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-barW / 2, -e.size / 1.5 - 6, currentHB, 4);
      }
    }

    ctx.restore();
  };

  const drawLoot = (ctx: CanvasRenderingContext2D, loot: Loot) => {
    const proj = projectPerspective(loot.x, loot.y);
    ctx.save();
    ctx.translate(proj.x, proj.y);
    ctx.scale(proj.scale, proj.scale);

    if (loot.type === 'coin') {
      const wobble = Math.sin(stateRef.current.distance / 5 + loot.x) * 3;
      // Drawing spinning gold coins with 3D edge depth!
      const spinScale = Math.abs(Math.cos(stateRef.current.distance / 6 + loot.x * 2));
      const width = Math.max(1.0, loot.size * spinScale);
      const height = loot.size;
      
      // Draw 3D rim edge first
      ctx.fillStyle = '#b45309'; // Shadow brown
      ctx.beginPath();
      ctx.ellipse(1.5, wobble, width, height, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw front face
      ctx.fillStyle = '#eab308'; // Amber Gold
      ctx.beginPath();
      ctx.ellipse(0, wobble, width, height, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Shiny center block
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(-1.5 * spinScale, wobble - 1.5, 3 * spinScale, 3);

    } else if (loot.type === 'gear' && loot.gearData) {
      // Gear chest crate glow pulsing
      const pulse = 1.0 + Math.sin(stateRef.current.distance / 4) * 0.15;
      
      const item = loot.gearData;
      let glowColor = '#64748b'; // common
      if (item.rarity === 'rare') glowColor = '#3b82f6';
      else if (item.rarity === 'epic') glowColor = '#a855f7';
      else if (item.rarity === 'legendary') glowColor = '#f59e0b';

      ctx.beginPath();
      ctx.arc(0, 0, loot.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 70, 239, 0.1)';
      ctx.fill();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Drop icon emoji center
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎁', 0, 5);

    } else {
      // Temporary Power-up drops with spinning 3D diamond (crystal template)
      const activeColor = loot.type === 'magnet' ? '#06b6d4' : (loot.type === 'firerate' ? '#fbbf24' : '#10b981');
      
      const rotAngle = stateRef.current.distance / 8;
      ctx.save();
      ctx.rotate(rotAngle);
      
      ctx.beginPath();
      ctx.moveTo(0, -loot.size * 1.3);
      ctx.lineTo(loot.size, 0);
      ctx.lineTo(0, loot.size * 1.3);
      ctx.lineTo(-loot.size, 0);
      ctx.closePath();
      
      // Radiant 3D color gradient
      const dGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, loot.size * 1.3);
      dGrad.addColorStop(0, '#ffffff'); // bright 3D reflection node
      dGrad.addColorStop(0.4, activeColor);
      dGrad.addColorStop(1, '#0f172a'); // shadow anchor
      ctx.fillStyle = dGrad;
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // Flat emoji placed clearly on top
      ctx.font = '11px serif';
      ctx.textAlign = 'center';
      const pIcon = loot.type === 'magnet' ? '🧲' : (loot.type === 'firerate' ? '⚡' : '🛡️');
      ctx.fillText(pIcon, 0, 4);
    }

    ctx.restore();
  };

  // --- COMPONENT TERMINALS WIN / LOSE ---
  const triggerGameOver = () => {
    const state = stateRef.current;
    if (state.isEnded) return;

    state.isEnded = true;
    cancelAnimationFrame(state.frameId);
    sound.playDefeat();

    // Ensure the exact final distance of the run is added as the terminal checkpoint
    state.soldierHistory.push({
      distance: Math.max(0, Math.floor(state.distance)),
      soldiers: state.virtualSoldierCount
    });

    onLose(state.goldThisRun, state.gateReviewHistory, state.soldierHistory);
  };

  const triggerVictory = () => {
    const state = stateRef.current;
    if (state.isEnded) return;

    state.isEnded = true;
    cancelAnimationFrame(state.frameId);
    sound.playVictory();

    // Ensure the exact final distance of the run is added as the terminal checkpoint
    state.soldierHistory.push({
      distance: Math.max(0, Math.floor(state.distance)),
      soldiers: state.virtualSoldierCount
    });
    
    onWin(state.goldThisRun, state.lootGearDropped, state.gateReviewHistory, state.soldierHistory);
  };

  // Mute button helper inside game run
  const [muted, setMuted] = useState(sound.isMuted());
  const toggleMute = () => {
    const m = sound.toggleMute();
    setMuted(m);
    sound.playCoin();
  };

  const getWaveIntensity = () => {
    const pct = Math.min(100, Math.max(0, (distanceRun / level.milestoneDistance) * 100));
    let intensityColor = 'bg-emerald-500 shadow-[0_0_4px_#34d399]';
    let intensityTextClass = 'text-emerald-400';
    let intensityLabel = 'STAGE I: CALM';

    if (isBossFight) {
      intensityColor = 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse shadow-[0_0_10px_#f43f5e]';
      intensityTextClass = 'text-pink-400 font-black animate-pulse';
      intensityLabel = 'STAGE V: APOCALYPSE';
    } else if (pct > 75) {
      intensityColor = 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse';
      intensityTextClass = 'text-red-400 font-bold';
      intensityLabel = 'STAGE IV: SEVERE';
    } else if (pct > 45) {
      intensityColor = 'bg-amber-500 shadow-[0_0_6px_#f59e0b]';
      intensityTextClass = 'text-amber-400';
      intensityLabel = 'STAGE III: INTENSE';
    } else if (pct > 20) {
      intensityColor = 'bg-yellow-400 shadow-[0_0_5px_#facc15]';
      intensityTextClass = 'text-yellow-400';
      intensityLabel = 'STAGE II: ACTIVE';
    }
    return { pct, intensityColor, intensityTextClass, intensityLabel };
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-between h-full w-full max-w-lg mx-auto bg-slate-950 text-slate-100 relative scanlines overflow-hidden"
    >
      {/* Top Controller Bar */}
      <div className="w-full h-16 shrink-0 bg-slate-950/90 border-b border-slate-900 px-5 flex items-center justify-between z-25 relative">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              sound.playCoin();
              onBack();
            }}
            className="p-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] uppercase font-mono font-bold text-slate-400 hover:text-white cursor-pointer active:scale-95 transition"
            id="btn_game_abort"
          >
            QUIT
          </button>
          
          <button
            onClick={() => {
              sound.playCoin();
              setIsPaused(p => !p);
            }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition active:scale-95"
            title="Pause/Play"
          >
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}
          </button>
        </div>

        {/* Level Banner Info */}
        <div className="text-center">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-red-400 animate-pulse block">
            {isBossFight ? '⚠️ BOSS ENCOUNTER ⚠️' : 'DEFENDER PATROL'}
          </span>
          <span className="text-[11px] font-mono tracking-wider text-slate-300 font-bold">
            Level {level.id}: {level.name}
          </span>
        </div>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
          title="Toggle local volume"
        >
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      </div>

      {/* Floating Canvas Area */}
      <div className="flex-1 w-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="relative max-w-full aspect-[3/4]">
          {/* Wave Intensity Bar Overlay */}
          <div className="absolute top-2.5 left-3 right-3 bg-slate-950/90 border border-slate-900 px-3 py-1.5 rounded-full z-20 flex items-center justify-between space-x-2.5 pointer-events-none shadow-lg">
            <span className="text-[7.5px] font-mono tracking-widest text-slate-400 font-bold uppercase shrink-0">WAVE INTENSITY</span>
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-850">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getWaveIntensity().intensityColor}`} 
                style={{ width: `${getWaveIntensity().pct}%` }}
              />
            </div>
            <span className={`text-[7.5px] font-mono font-black uppercase text-right shrink-0 tracking-tight ${getWaveIntensity().intensityTextClass}`}>
              {getWaveIntensity().intensityLabel}
            </span>
          </div>

          {/* MATH QUESTION STRIKES (3 RED LIVES THAT GREY OUT ON MISS) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-900 px-3.5 py-1.5 rounded-xl z-20 flex items-center gap-2.5 shadow-2xl backdrop-blur-md pointer-events-none select-none">
            <span className="text-[7px] font-mono tracking-widest text-slate-500 font-bold uppercase">STRIKES</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((num) => {
                const isMissed = num <= consecutiveWrong;
                return (
                  <motion.div
                    key={num}
                    initial={false}
                    animate={isMissed ? {
                      scale: [1.0, 1.4, 1.1, 1.0],
                      color: "#64748b",
                      borderColor: "#475569",
                      backgroundColor: "rgba(15, 23, 42, 0.85)"
                    } : {
                      scale: 1.0,
                      color: "#ef4444",
                      borderColor: "rgba(239, 68, 68, 0.45)",
                      backgroundColor: "rgba(153, 27, 27, 0.25)"
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 450, 
                      damping: 15,
                      duration: 0.4
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border font-mono font-black text-xs shadow-md`}
                  >
                    X
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CHALLENGE INTENSITY (DIFFICULTY MULTIPLIER) MONITOR */}
          <div className="absolute top-26 left-3.5 z-20 pointer-events-none select-none flex flex-col items-start font-mono shadow-2xl">
            <div className="bg-slate-950/90 border-2 border-red-500/30 rounded-xl px-2.5 py-1.5 flex flex-col text-left shadow-lg backdrop-blur-sm">
              <span className="text-[6.5px] font-black text-rose-500/80 tracking-widest uppercase mb-0.5 animate-pulse">⚙️ CHALLENGE INTENSITY</span>
              <div className="flex items-baseline space-x-1 leading-none my-0.5">
                <span className="text-xs font-black text-rose-500">
                  {((1 + gatesAnswered * 0.05)).toFixed(2)}x
                </span>
                <span className="text-[7px] text-slate-400 font-extrabold uppercase">MULT</span>
              </div>
              <div className="w-14 h-1 bg-slate-900 rounded mt-0.5 overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-300 shadow-[0_0_4px_#ef4444]"
                  style={{ width: `${Math.min(100, Math.max(10, ((1 + gatesAnswered * 0.05) - 1) * 80))}%` }}
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC COMBO COUNTER OVERLAY */}
          <AnimatePresence>
            {comboCount > 0 && (
              <motion.div
                key={comboCount}
                initial={{ scale: 0.6, opacity: 0, x: 20 }}
                animate={{ 
                  scale: Math.min(2.0, 1.0 + (comboCount * 0.12)), 
                  opacity: 1, 
                  x: 0 
                }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 12 
                }}
                className="absolute top-26 right-3.5 z-29 pointer-events-none select-none flex flex-col items-end shadow-2xl animate-duration-150"
              >
                <div 
                  className={`px-3 py-1.5 rounded-xl border-2 font-mono font-black text-right shadow-2xl flex flex-col items-end justify-center leading-none backdrop-blur-md ${
                    comboCount >= 10 
                      ? 'bg-red-950/90 border-red-500 text-red-400 shadow-red-500/30' 
                      : comboCount >= 6 
                      ? 'bg-amber-950/90 border-amber-500 text-amber-400 shadow-amber-500/30'
                      : comboCount >= 3 
                      ? 'bg-yellow-950/90 border-yellow-400 text-yellow-300 shadow-yellow-400/30'
                      : 'bg-emerald-950/90 border-emerald-500 text-emerald-400 shadow-emerald-500/15'
                  }`}
                >
                  <span className="text-[6.5px] tracking-widest text-slate-400 font-extrabold uppercase mb-0.5">COMBO MULTIPLIER</span>
                  <div className="flex items-baseline space-x-1">
                    <span className={`font-black ${
                      comboCount >= 10 
                        ? 'text-red-400 text-base animate-pulse' 
                        : comboCount >= 6 
                        ? 'text-amber-400 text-sm'
                        : comboCount >= 3 
                        ? 'text-yellow-300 text-xs'
                        : 'text-emerald-400 text-xs'
                    }`}>x{comboCount}</span>
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-300 mt-1 uppercase tracking-tight">
                    {(comboMultiplier).toFixed(1)}x DAMAGE BONUS
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Battle Combat Log Container Overlay */}
          <div className="absolute bottom-16 left-3 w-[190px] max-h-[110px] bg-slate-950/85 border border-slate-900 rounded-lg p-2 overflow-y-auto pointer-events-none select-none z-22 flex flex-col-reverse gap-1 scrollbar-none shadow-xl">
            {combatLogs.length === 0 ? (
              <span className="text-[7.5px] font-mono text-slate-500 block uppercase italic select-none">
                Waiting for combat events...
              </span>
            ) : (
              combatLogs.map((log) => {
                const isBossLog = log.text.toUpperCase().includes('BOSS') || 
                                  (level && log.text.toUpperCase().includes(level.bossName.toUpperCase()));
                if (isBossLog) {
                  return (
                    <div key={log.id} className="text-[7.5px] font-mono leading-tight tracking-normal whitespace-pre-wrap flex items-center gap-1 select-none bg-red-950/40 border border-red-500/55 rounded px-1.5 py-0.5 my-0.5 shadow-[0_0_4px_rgba(239,68,68,0.3)] animate-pulse">
                      <span className="text-yellow-400 font-extrabold shrink-0">⚡ [BOSS]</span>
                      <span className="text-amber-300 font-black tracking-wide">{log.text}</span>
                    </div>
                  );
                }
                return (
                  <div key={log.id} className="text-[7.5px] font-mono leading-tight tracking-normal whitespace-pre-wrap flex items-start gap-1 select-none">
                    <span style={{ color: log.color }} className="font-bold shrink-0">&gt;</span>
                    <span style={{ color: log.color }}>{log.text}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Hotkey Helper Badge */}
          <div className="absolute bottom-4 left-3 bg-slate-950/90 border border-slate-900 px-2 py-1.5 rounded z-22 pointer-events-none text-[8px] font-mono text-slate-300 font-bold uppercase shadow-lg select-none">
            🎛️ HOTKEYS: <span className="text-cyan-400 font-black">[1]</span> LEFT | <span className="text-cyan-400 font-black">[2]</span> RIGHT
          </div>

          <canvas
            ref={canvasRef}
            width={480}
            height={640}
            onPointerMove={handlePointerMove}
            className="bg-slate-950 w-full h-full border-x border-slate-900 relative shadow-2xl block"
            style={{ touchAction: 'none' }} // Prevents browser scroll pinch
          />

          {/* Real-time Dynamic React Framer Motion particle blast absolute overlay */}
          <AnimatePresence>
            {framerSplashes.map((splash) => (
              <div key={splash.id} className="absolute inset-0 pointer-events-none overflow-hidden z-35">
                {Array.from({ length: 15 }).map((_, i) => {
                  const angle = (i / 15) * Math.PI * 2;
                  const distance = 35 + Math.random() * 70;
                  const pctX = (splash.x / 480) * 100;
                  const pctY = (splash.y / 640) * 100;

                  const tx = Math.cos(angle) * distance;
                  const ty = Math.sin(angle) * distance;

                  return (
                    <motion.div
                      key={i}
                      initial={{ left: `${pctX}%`, top: `${pctY}%`, scale: 0.1, opacity: 1, rotate: 0 }}
                      animate={{
                        left: `calc(${pctX}% + ${tx}px)`,
                        top: `calc(${pctY}% + ${ty}px)`,
                        scale: [0.3, 1.3, 0],
                        opacity: [1, 0.85, 0],
                        rotate: Math.random() * 360
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute w-2 h-2 rounded-full flex items-center justify-center text-[8px]"
                      style={{
                        background: `radial-gradient(circle, ${splash.color} 0%, rgba(0,0,0,0) 80%)`,
                        boxShadow: `0 0 6px ${splash.color}`,
                      }}
                    >
                      {i % 2 === 0 ? '⚡' : '✨'}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>

          {/* VISUAL MILESTONE TOAST FOR 100 HERO MILESTONE */}
          <AnimatePresence>
            {milestoneToast && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                onClick={() => setMilestoneToast(false)}
                className="absolute top-20 left-4 right-4 bg-slate-950/95 border-2 border-amber-500 rounded-xl p-3 shadow-[0_0_15px_rgba(245,158,11,0.4)] z-50 flex items-start gap-3 cursor-pointer select-none"
              >
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2 rounded-lg animate-pulse shrink-0">
                  ⚡
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider">
                    ⚠️ 100-HERO MILESTONE UNLOCKED!
                  </h4>
                  <p className="text-[9px] text-slate-300 leading-tight mt-0.5 font-mono">
                    Your legion has grown to 100+ heroes! Tap on a custom force upgrade to select a new weapon type.
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMilestoneToast(false);
                  }} 
                  className="text-slate-500 hover:text-slate-300 text-[10px] font-mono font-bold uppercase shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PAUSE OVERLAY */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-black tracking-widest font-display text-white mb-2">
              TACTICAL REFLECTION
            </h2>
            <p className="text-[11px] text-slate-400 max-w-xs mb-8 leading-relaxed font-mono">
              Do the math while the monsters sleep. Evaluate your gate formulas and ensure positive army yields.
            </p>
            <button
              onClick={() => {
                sound.playCoin();
                setIsPaused(false);
              }}
              className="py-3 px-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs tracking-wider font-mono rounded-xl cursor-pointer active:scale-95 transition shadow-lg shadow-emerald-900/10"
              id="btn_game_resume"
            >
              RESUME ASSAULT
            </button>
          </div>
        )}

        {/* HYPER UPGRADE CHOICE SELECTOR */}
        {hyperUpgradeChoicePending && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-35 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="border-2 border-amber-500/85 bg-slate-905 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 border border-amber-400/20 pointer-events-none animate-pulse" />
              
              <div className="text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-1.5 animate-bounce">
                ⚡ 100+ HEROES MASSIVE PROGRESS ⚡
              </div>
              <h2 className="text-sm font-black tracking-wider text-white mb-2 font-mono">
                CHOOSE HYPER FORCE UPGRADE
              </h2>
              <p className="text-[10px] text-slate-400 mb-5 leading-relaxed font-mono">
                Your army has crossed 100 warriors! Select a devastating squad-wide special weapon to assist your patrol:
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    sound.playLevelUp();
                    stateRef.current.selectedHyperUpgrade = 'laser';
                    setHyperUpgradeChoicePending(false);
                    addCombatLog("⚡ CHOSE UPGRADE: VOLTAGE DEATH RAY [LASER]", "#fbbf24", "system");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 hover:bg-slate-900 transition active:scale-98 cursor-pointer group"
                >
                  <div className="text-[10px] font-bold text-amber-400 uppercase font-mono group-hover:translate-x-1 transition flex items-center gap-1">
                    🟢 A. VOLTAGE DEATH RAY
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono leading-tight">
                    Fires dense, highly piercing cyan plasma lanes at double fire rate!
                  </p>
                </button>

                <button
                  onClick={() => {
                    sound.playLevelUp();
                    stateRef.current.selectedHyperUpgrade = 'missiles';
                    setHyperUpgradeChoicePending(false);
                    addCombatLog("🚀 CHOSE UPGRADE: HEAVY VULCAN ROCKET SWARM", "#f43f5e", "system");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 hover:bg-slate-900 transition active:scale-98 cursor-pointer group"
                >
                  <div className="text-[10px] font-bold text-rose-400 uppercase font-mono group-hover:translate-x-1 transition flex items-center gap-1">
                    🚀 B. VULCAN ROCKET SWARM
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono leading-tight">
                    Launches devastating 3-way explosive rocket sprays at hostiles!
                  </p>
                </button>

                <button
                  onClick={() => {
                    sound.playLevelUp();
                    stateRef.current.selectedHyperUpgrade = 'sentry';
                    setHyperUpgradeChoicePending(false);
                    addCombatLog("🛸 CHOSE UPGRADE: SENTRY COMPANION ESCORTED", "#38bdf8", "system");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 hover:bg-slate-900 transition active:scale-98 cursor-pointer group"
                >
                  <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono group-hover:translate-x-1 transition flex items-center gap-1">
                    🛸 C. SENTRY DRONE COMPANION
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono leading-tight">
                    Spawns an indestructible hovering mecha escort that zaps closest targets automatically!
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOSS FANFARE WARNING BANNER */}
        <AnimatePresence>
          {bossBannerActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.35, y: -45 }}
              animate={{ opacity: 1, scale: 1.0, y: 0 }}
              exit={{ opacity: 0, scale: 1.25, y: -25 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="absolute inset-x-3 top-1/4 bg-red-950/95 border-y-4 border-red-500/95 z-35 overflow-hidden shadow-[0_0_24px_rgba(239,68,68,0.75)] flex flex-col items-center justify-center p-5 select-none"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl animate-pulse">🚨</span>
                <span className="text-stone-100 font-mono tracking-widest text-[9px] font-black text-red-500 animate-pulse">
                  NEURAL SENSOR CAUTION
                </span>
                <span className="text-xl animate-pulse">🚨</span>
              </div>
              
              <h1 className="text-yellow-400 font-mono font-black text-[13px] uppercase tracking-wider text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] my-1 border-b border-red-800/40 pb-1 w-full flex justify-center items-center gap-1.5 animate-pulse">
                💥 BOSS ENCOUNTER: {level.bossName.toUpperCase()} 💥
              </h1>
              
              <p className="text-[7.5px] font-mono tracking-widest text-cyan-400 font-bold uppercase mt-1 animate-pulse">
                ⚡ HIGH CONDUIT TARGET IMMINENT - PREPARE COMBAT FLOW ⚡
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOSS HEALTH HUD PANEL */}
        {isBossFight && bossHealthPercent !== null && (
          <div className="absolute top-4 left-4 right-4 bg-slate-950/95 border-2 border-red-900/80 p-3 rounded-xl z-20 flex flex-col items-center pixel-shadow-red shadow-lg">
            <div className="flex justify-between w-full mb-2">
              <span className="text-[9px] font-retro text-red-400 uppercase leading-none">
                {level.bossName}
              </span>
              <span className="text-[10px] font-retro text-red-500 text-right leading-none">
                {Math.ceil(bossHealthPercent)}%
              </span>
            </div>

            {/* Retro 8-bit multi-segment segmented health bar */}
            <div className="w-full flex gap-1 bg-slate-900 p-0.5 border border-stone-850 rounded">
              {Array.from({ length: 20 }).map((_, idx) => {
                const threshold = (idx + 1) * 5; // Each block signifies 5% health
                const isActive = bossHealthPercent >= threshold;
                return (
                  <div
                    key={idx}
                    className={`h-3.5 flex-1 rounded-xs border transition-all duration-100 ${
                      isActive
                        ? 'bg-gradient-to-b from-red-500 via-red-650 to-red-800 border-red-400 shadow-[0_0_3px_rgba(239,68,68,0.65)]'
                        : 'bg-stone-955 bg-stone-950 border-stone-900/40'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer statistics Panel */}
      <div className="w-full h-20 shrink-0 bg-slate-950 border-t border-slate-900 grid grid-cols-3 text-center px-4 items-center z-10">
        <div>
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">TROOPS</span>
          <span className="text-sm font-mono font-black text-cyan-400">{soldierCount}</span>
        </div>

        <div>
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">DISTANCE</span>
          <span className="text-sm font-mono font-black text-slate-200">
            {distanceRun}m <span className="text-slate-500 text-xs">/ {level.milestoneDistance}m</span>
          </span>
        </div>

        <div>
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">TRIBUTE</span>
          <span className="text-sm font-mono font-black text-yellow-400">🪙 {runGold}</span>
        </div>
      </div>
    </div>
  );
});

export default GameCanvas;
