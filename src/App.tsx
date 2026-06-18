import React, { useState, useEffect } from 'react';
import { GameStage, MathMode, LevelTheme, UpgradeState, GearItem, MathDifficulty, MathGateReview, ColorPalette, DailyMission, UserProfile } from './types';
import { LEVEL_THEMES } from './data';
import { sound } from './utils/audio';
import { admob } from './utils/admob';

// Components
import MainMenu from './components/MainMenu';
import LoginPortal from './components/LoginPortal';
import UpgradesPanel from './components/UpgradesPanel';
import ArmoryPanel from './components/ArmoryPanel';
import HelpDialog from './components/HelpDialog';
import GameCanvas from './components/GameCanvas';
import CoinBurst from './components/CoinBurst';
import ShopPanel from './components/ShopPanel';
import SettingsModal, { RETRO_PALETTES } from './components/SettingsModal';
import BestiaryPanel from './components/BestiaryPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import DailyMissionsPanel from './components/DailyMissionsPanel';
import BattleHistoryChart from './components/BattleHistoryChart';
import AfterActionReport from './components/AfterActionReport';
import DailyStreakPanel from './components/DailyStreakPanel';

import { Award, ShieldAlert, Coins, RefreshCcw, ArrowRight, Home, Flame, Sparkles, Gift, Users } from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function App() {
  const [stage, setStage] = useState<GameStage>('MENU');
  
  // Custom calibration settings and theme states
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('eek_selected_palette');
      if (saved) return saved;
    } catch (_) {}
    return 'classic';
  });
  
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eek_audio_volume');
      if (saved !== null) return parseFloat(saved);
    } catch (_) {}
    return 0.8;
  });

  const [is3DMode, setIs3DMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eek_3d_mode');
      if (saved !== null) return saved === 'true';
    } catch (_) {}
    return true;
  });

  const [is256BitGraphics, setIs256BitGraphics] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eek_256bit_graphics');
      if (saved !== null) return saved === 'true';
    } catch (_) {}
    return true;
  });

  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eek_music_enabled');
      if (saved !== null) {
        const parsed = saved === 'true';
        sound.setMusicEnabled(parsed);
        return parsed;
      }
    } catch (_) {}
    sound.setMusicEnabled(true);
    return true;
  });

  const [isSFXEnabled, setIsSFXEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eek_sfx_enabled');
      if (saved !== null) {
        const parsed = saved === 'true';
        sound.setSFXEnabled(parsed);
        return parsed;
      }
    } catch (_) {}
    sound.setSFXEnabled(true);
    return true;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [activeBuffs, setActiveBuffs] = useState(() => {
    try {
      const stored = localStorage.getItem('eek_active_buffs');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return { damageBoost: 0, extraStarting: 0 };
  });

  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    try {
      const stored = localStorage.getItem('eek_daily_missions');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [
      {
        id: 'mission_1',
        title: '✖️ CLONE MULTIPLIER BLITZ',
        description: 'Answer 5 multiplication gates during gameplay',
        target: 5,
        current: 0,
        rewardType: 'coins',
        rewardValue: 450,
        completed: false,
        claimed: false,
      },
      {
        id: 'mission_2',
        title: '🧠 ABSOLUTE PERFECT PATH',
        description: 'Pick 12 mathematically optimal gates in a single run',
        target: 12,
        current: 0,
        rewardType: 'buff_starting',
        rewardValue: 12,
        completed: false,
        claimed: false,
      },
      {
        id: 'mission_3',
        title: '🪙 OVERWHELMING TRIBUTE PURGE',
        description: 'Collect 600 total gold coins in a single run',
        target: 600,
        current: 0,
        rewardType: 'buff_damage',
        rewardValue: 3,
        completed: false,
        claimed: false,
      }
    ];
  });

  const [soldierHistoryRun, setSoldierHistoryRun] = useState<{ distance: number; soldiers: number }[]>([]);

  const [mathMode, setMathMode] = useState<MathMode>('addition');
  const [mathDifficulty, setMathDifficulty] = useState<MathDifficulty>('medium');
  const [characterId, setCharacterId] = useState<string>('alex');
  const [coins, setCoins] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  
  const [upgrades, setUpgrades] = useState<UpgradeState>({
    startingSoldiers: 1,
    fireRateLevel: 1,
    damageLevel: 1,
    magnetLevel: 1,
  });

  const [inventory, setInventory] = useState<GearItem[]>([]);

  // Results state variables for end runs
  const [goldEarnedThisRun, setGoldEarnedThisRun] = useState(0);
  const [lootDroppedThisRun, setLootDroppedThisRun] = useState<GearItem | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  // Premium Supporter states
  const [unlockedAura, setUnlockedAura] = useState<boolean>(false);
  const [isDoubleCoins, setIsDoubleCoins] = useState<boolean>(false);
  const [hasPremiumMagnet, setHasPremiumMagnet] = useState<boolean>(false);
  const [quickEquipped, setQuickEquipped] = useState<boolean>(false);

  // AdMob simulated playback overlays
  const [adPlaying, setAdPlaying] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(0);
  const [adMessage, setAdMessage] = useState<string>('');

  // Math Outcome review logs
  const [currentRunMathReviews, setCurrentRunMathReviews] = useState<MathGateReview[]>([]);
  const [historicalReviews, setHistoricalReviews] = useState<MathGateReview[]>([]);

  // History & performance-based prize state variables
  const [runHistory, setRunHistory] = useState<{ distance: number; date: string; stage: string; gold: number }[]>([]);
  const [extraTroopsExpiry, setExtraTroopsExpiry] = useState<number>(0);
  const [avgPrevDistanceThisRun, setAvgPrevDistanceThisRun] = useState<number>(0);
  const [pctImprovementThisRun, setPctImprovementThisRun] = useState<number>(0);
  const [wasPrizeAwardedThisRun, setWasPrizeAwardedThisRun] = useState<boolean>(false);

  // Win Streak Multiplier states
  const [winStreak, setWinStreak] = useState<number>(0);
  const [winStreakPctThisRun, setWinStreakPctThisRun] = useState<number>(0);
  const [winStreakBonusThisRun, setWinStreakBonusThisRun] = useState<number>(0);

  // Daily login streak system states
  const [streakCount, setStreakCount] = useState<number>(0);
  const [lastLoginDate, setLastLoginDate] = useState<string>('');
  const [streakClaimedToday, setStreakClaimedToday] = useState<boolean>(false);

  // Student save point database
  const [checkpointState, setCheckpointState] = useState<{
    coins: number;
    levelIndex: number;
    upgrades: UpgradeState;
    inventory: GearItem[];
  } | null>(null);

  // Toast notifier helper
  const [appNotification, setAppNotification] = useState<{title: string; body: string} | null>(null);
  const spawnAppNotify = (title: string, body: string) => {
    setAppNotification({ title, body });
    setTimeout(() => {
      setAppNotification(null);
    }, 4500);
  };

  const handleCreateCheckpoint = (isAuto: boolean = false) => {
    const saveState = {
      coins,
      levelIndex: currentLevelIndex,
      upgrades,
      inventory,
    };
    setCheckpointState(saveState);
    try {
      localStorage.setItem('eek_savepoint_checkpoint', JSON.stringify(saveState));
    } catch (e) {
      console.warn('Checkpoint write failed', e);
    }
    if (!isAuto) {
      sound.playGatePass(true);
      spawnAppNotify('Checkpoint Created! 💾', 'Saved your current coins, upgrades, and gear stage to local vault.');
    }
  };

  const handleRestoreCheckpoint = () => {
    if (!checkpointState) return;
    setCoins(checkpointState.coins);
    setCurrentLevelIndex(checkpointState.levelIndex);
    setUpgrades(checkpointState.upgrades);
    setInventory(checkpointState.inventory);
    sound.playGatePass(true);
    spawnAppNotify('Timeline Restored! ⏳', 'Returned successfully to your last saved checkpoint state.');
  };

  // Watch Rewarded Ad helper
  const triggerRewardedAd = (type: 'gold' | 'restore') => {
    admob.showRewardedAd(
      () => {
        // Callback of earned reward
        if (type === 'gold') {
          setCoins(c => c + 350);
          spawnAppNotify('Ad Reward Unlocked! 🪙', 'Credited +350 gold coins to your vault.');
        } else if (type === 'restore') {
          handleRestoreCheckpoint();
        }
      },
      (duration, onComplete) => {
        setAdPlaying(true);
        setAdCountdown(duration);
        setAdMessage(
          type === 'gold' 
            ? 'Sponsoring gold reserves for math cadets...' 
            : 'Releasing chronos particle backup to revive squad...'
        );
        
        const interval = setInterval(() => {
          setAdCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setAdPlaying(false);
              onComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    );
  };

  // --- USER PROFILE & PERMANENT LOCALSTORAGE SAVES ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('eek_active_profile_id', profile.id);
    loadProfileState(profile.id);
    sound.playVictory();
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('eek_active_profile_id');
    sound.playGatePass(false);
  };

  const loadProfileState = (profileId: string) => {
    const pfx = `eek_${profileId}_`;
    try {
      const savedCoins = localStorage.getItem(pfx + 'coins');
      const savedHighScore = localStorage.getItem(pfx + 'highscore');
      const savedLevel = localStorage.getItem(pfx + 'level');
      const savedUpgrades = localStorage.getItem(pfx + 'upgrades');
      const savedInventory = localStorage.getItem(pfx + 'inventory');
      const savedCharacter = localStorage.getItem(pfx + 'character');
      const savedDifficulty = localStorage.getItem(pfx + 'difficulty');
      const savedUnlockedAura = localStorage.getItem(pfx + 'unlocked_aura');
      const savedDoubleCoins = localStorage.getItem(pfx + 'double_coins');
      const savedPremiumMagnet = localStorage.getItem(pfx + 'premium_magnet');
      const savedBuffs = localStorage.getItem(pfx + 'active_buffs');
      const savedMissions = localStorage.getItem(pfx + 'daily_missions');
      const savedHistory = localStorage.getItem(pfx + 'run_history');
      const savedExpiry = localStorage.getItem(pfx + 'extra_troops_expiry');
      const savedHistoricalReviews = localStorage.getItem(pfx + 'historical_reviews');

      setCoins(savedCoins ? parseInt(savedCoins, 10) : 0);
      setHighScore(savedHighScore ? parseInt(savedHighScore, 10) : 0);
      setCurrentLevelIndex(savedLevel ? parseInt(savedLevel, 10) : 0);
      setUpgrades(savedUpgrades ? JSON.parse(savedUpgrades) : {
        startingSoldiers: 1,
        fireRateLevel: 1,
        damageLevel: 1,
        magnetLevel: 1,
      });
      setInventory(savedInventory ? JSON.parse(savedInventory) : []);
      setCharacterId(savedCharacter || 'alex');
      setMathDifficulty((savedDifficulty as MathDifficulty) || 'medium');
      setUnlockedAura(savedUnlockedAura === 'true');
      setIsDoubleCoins(savedDoubleCoins === 'true');
      setHasPremiumMagnet(savedPremiumMagnet === 'true');
      setActiveBuffs(savedBuffs ? JSON.parse(savedBuffs) : { damageBoost: 0, extraStarting: 0 });
      setRunHistory(savedHistory ? JSON.parse(savedHistory) : []);
      setExtraTroopsExpiry(savedExpiry ? parseInt(savedExpiry, 10) : 0);
      setHistoricalReviews(savedHistoricalReviews ? JSON.parse(savedHistoricalReviews) : []);
      
      if (savedMissions) {
        setDailyMissions(JSON.parse(savedMissions));
      } else {
        setDailyMissions([
          {
            id: 'mission_1',
            title: '✖️ CLONE MULTIPLIER BLITZ',
            description: 'Answer 5 multiplication gates during gameplay',
            target: 5,
            current: 0,
            rewardType: 'coins',
            rewardValue: 450,
            completed: false,
            claimed: false,
          },
          {
            id: 'mission_2',
            title: '🧠 ABSOLUTE PERFECT PATH',
            description: 'Pick 12 mathematically optimal gates in a single run',
            target: 12,
            current: 0,
            rewardType: 'buff_starting',
            rewardValue: 12,
            completed: false,
            claimed: false,
          },
          {
            id: 'mission_3',
            title: '🪙 OVERWHELMING TRIBUTE PURGE',
            description: 'Collect 600 total gold coins in a single run',
            target: 600,
            current: 0,
            rewardType: 'buff_damage',
            rewardValue: 3,
            completed: false,
            claimed: false,
          }
        ]);
      }

      // Calculate & update loading of streak state
      const savedLastDate = localStorage.getItem(pfx + 'last_login_date') || '';
      const savedStreak = parseInt(localStorage.getItem(pfx + 'streak_count') || '0', 10);
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      setLastLoginDate(savedLastDate);
      if (savedLastDate === today) {
        setStreakCount(savedStreak);
        setStreakClaimedToday(true);
      } else if (savedLastDate === yesterday) {
        setStreakCount(savedStreak);
        setStreakClaimedToday(false);
      } else {
        setStreakCount(0);
        setStreakClaimedToday(false);
      }
    } catch (e) {
      console.warn('Failed to load profile state', e);
    }
  };

  useEffect(() => {
    try {
      // 1. Check legacy statistics migration
      const legacyCoins = localStorage.getItem('eek_coins');
      const legacyHighScore = localStorage.getItem('eek_highscore');
      const stored = localStorage.getItem('eek_profiles');
      let profileList: UserProfile[] = [];
      if (stored) {
        profileList = JSON.parse(stored);
      }

      if (profileList.length === 0 && (legacyCoins || legacyHighScore)) {
        // Convert old standalone save to first operator profile slot
        const legacyProfile: UserProfile = {
          id: 'operator_legacy',
          username: 'RETRO_PLAYER',
          isGuest: false,
          avatar: '🎮',
          createdAt: Date.now()
        };
        profileList.push(legacyProfile);
        localStorage.setItem('eek_profiles', JSON.stringify(profileList));

        // Migrate states
        const pfx = 'eek_operator_legacy_';
        if (legacyCoins) localStorage.setItem(pfx + 'coins', legacyCoins);
        if (legacyHighScore) localStorage.setItem(pfx + 'highscore', legacyHighScore);
        
        const legacyLevel = localStorage.getItem('eek_level');
        if (legacyLevel) localStorage.setItem(pfx + 'level', legacyLevel);
        const legacyUpgrades = localStorage.getItem('eek_upgrades');
        if (legacyUpgrades) localStorage.setItem(pfx + 'upgrades', legacyUpgrades);
        const legacyInventory = localStorage.getItem('eek_inventory');
        if (legacyInventory) localStorage.setItem(pfx + 'inventory', legacyInventory);
        const legacyChar = localStorage.getItem('eek_character');
        if (legacyChar) localStorage.setItem(pfx + 'character', legacyChar || 'alex');
        const legacyDiff = localStorage.getItem('eek_difficulty');
        if (legacyDiff) localStorage.setItem(pfx + 'difficulty', legacyDiff || 'medium');
        const legacyAura = localStorage.getItem('eek_unlocked_aura');
        if (legacyAura) localStorage.setItem(pfx + 'unlocked_aura', legacyAura);
        const legacyDouble = localStorage.getItem('eek_double_coins');
        if (legacyDouble) localStorage.setItem(pfx + 'double_coins', legacyDouble);
        const legacyMagnet = localStorage.getItem('eek_premium_magnet');
        if (legacyMagnet) localStorage.setItem(pfx + 'premium_magnet', legacyMagnet);
      }

      // 2. Load active session
      const activeId = localStorage.getItem('eek_active_profile_id');
      if (activeId) {
        const matchingProfile = profileList.find(p => p.id === activeId);
        if (matchingProfile) {
          setCurrentUser(matchingProfile);
          loadProfileState(matchingProfile.id);
        }
      }

      // Load general global system settings
      const savedPalette = localStorage.getItem('eek_selected_palette');
      const savedVolume = localStorage.getItem('eek_audio_volume');
      if (savedPalette) setSelectedPaletteId(savedPalette);
      if (savedVolume) {
        const parsedVol = parseFloat(savedVolume);
        setVolume(parsedVol);
        sound.setVolume(parsedVol);
      } else {
        sound.setVolume(0.8);
      }
      
      // Start ambient sound chiptune theme
      sound.startMusic();
    } catch (e) {
      console.warn('LocalStorage initial boot load failed', e);
    }
  }, []);

  // Shared settings global sync
  useEffect(() => {
    sound.setVolume(volume);
    try {
      localStorage.setItem('eek_audio_volume', volume.toString());
    } catch (_) {}
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem('eek_selected_palette', selectedPaletteId);
    } catch (_) {}
  }, [selectedPaletteId]);

  useEffect(() => {
    try {
      localStorage.setItem('eek_3d_mode', is3DMode.toString());
    } catch (_) {}
  }, [is3DMode]);

  useEffect(() => {
    try {
      localStorage.setItem('eek_256bit_graphics', is256BitGraphics.toString());
    } catch (_) {}
  }, [is256BitGraphics]);

  useEffect(() => {
    try {
      localStorage.setItem('eek_music_enabled', isMusicEnabled.toString());
    } catch (_) {}
  }, [isMusicEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('eek_sfx_enabled', isSFXEnabled.toString());
    } catch (_) {}
  }, [isSFXEnabled]);

  // Specific current logged-in profile synchronizers
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`eek_${currentUser.id}_active_buffs`, JSON.stringify(activeBuffs));
    } catch (_) {}
  }, [currentUser, activeBuffs]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`eek_${currentUser.id}_daily_missions`, JSON.stringify(dailyMissions));
    } catch (_) {}
  }, [currentUser, dailyMissions]);

  // Profile save changes wrapper
  useEffect(() => {
    if (!currentUser) return;
    const pfx = `eek_${currentUser.id}_`;
    try {
      localStorage.setItem(pfx + 'coins', coins.toString());
      localStorage.setItem(pfx + 'highscore', highScore.toString());
      localStorage.setItem(pfx + 'level', currentLevelIndex.toString());
      localStorage.setItem(pfx + 'upgrades', JSON.stringify(upgrades));
      localStorage.setItem(pfx + 'inventory', JSON.stringify(inventory));
      localStorage.setItem(pfx + 'character', characterId);
      localStorage.setItem(pfx + 'difficulty', mathDifficulty);
      localStorage.setItem(pfx + 'unlocked_aura', unlockedAura.toString());
      localStorage.setItem(pfx + 'double_coins', isDoubleCoins.toString());
      localStorage.setItem(pfx + 'premium_magnet', hasPremiumMagnet.toString());
      localStorage.setItem(pfx + 'run_history', JSON.stringify(runHistory));
      localStorage.setItem(pfx + 'extra_troops_expiry', extraTroopsExpiry.toString());
      localStorage.setItem(pfx + 'historical_reviews', JSON.stringify(historicalReviews));
    } catch (e) {
      console.warn('Profile state local save failed', e);
    }
  }, [currentUser, coins, highScore, currentLevelIndex, upgrades, inventory, characterId, mathDifficulty, unlockedAura, isDoubleCoins, hasPremiumMagnet, runHistory, extraTroopsExpiry, historicalReviews]);

  const currentLevelTheme = LEVEL_THEMES[Math.min(currentLevelIndex, LEVEL_THEMES.length - 1)];

  // --- STAT POWER HELPERS ---
  const isPercentage = (statName: string) => {
    return statName !== 'Damage Bonus' && statName !== 'Starting Force';
  };

  const getPowerInfo = (lootItem: GearItem) => {
    const slotEquipped = inventory.find(item => item.equipped && item.slot === lootItem.slot);
    const totalEquippedStat = inventory
      .filter(item => item.equipped && item.statName === lootItem.statName)
      .reduce((sum, item) => sum + item.statValue, 0);
      
    let projectedStat = totalEquippedStat;
    if (slotEquipped) {
      if (slotEquipped.statName === lootItem.statName) {
        projectedStat = totalEquippedStat - slotEquipped.statValue + lootItem.statValue;
      } else {
        projectedStat = totalEquippedStat + lootItem.statValue;
      }
    } else {
      projectedStat = totalEquippedStat + lootItem.statValue;
    }
    
    return {
      current: totalEquippedStat,
      projected: projectedStat,
    };
  };

  const getRankInfo = (dist: number) => {
    if (dist >= 900) {
      return {
        name: "Platinum Archon",
        colorClass: "text-indigo-400 border-indigo-500/40 bg-indigo-950/20 shadow-indigo-500/10",
        icon: "👑",
        desc: "Supreme Tactician of the Core"
      };
    } else if (dist >= 600) {
      return {
        name: "Gold Overlord",
        colorClass: "text-yellow-405 border-yellow-600/40 bg-yellow-950/25 shadow-yellow-500/10",
        icon: "🎖️",
        desc: "Peerless Commander of the Legion"
      };
    } else if (dist >= 300) {
      return {
        name: "Silver Sentinel",
        colorClass: "text-slate-300 border-slate-700/40 bg-slate-900/40 shadow-slate-400/5",
        icon: "🛡️",
        desc: "Elite Guard of the Mathematical Boundary"
      };
    } else {
      return {
        name: "Bronze Cadet",
        colorClass: "text-amber-600 border-amber-800/30 bg-amber-950/10 shadow-amber-800/5",
        icon: "🔰",
        desc: "Initiated Apprentice Defending the Gates"
      };
    }
  };

  const handleShareAchievement = () => {
    const dist = soldierHistoryRun.length > 0 ? soldierHistoryRun[soldierHistoryRun.length - 1].distance : 0;
    const rank = getRankInfo(dist);
    const streakText = winStreak > 1 ? ` (with a ${winStreak}-level win streak!)` : '';
    const shareText = `👾 EEK MONSTERS - DEFENDER COMPLETE! 👾\n\n` +
                      `📏 Patrol Distance: ${dist} Meters\n` +
                      `🛡️ Obtains Rank: ${rank.icon} ${rank.name}\n` +
                      `🪙 Gold Earned: 🪙 ${goldEarnedThisRun} coins${streakText}\n` +
                      `🔥 Active Win Streak: ${winStreak} Consecutive Victories!\n\n` +
                      `Assemble your cadets & defend the gate! 🚀`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          spawnAppNotify('Copied to Clipboard! 📋', 'Your heroic victory report has been copied in "Eek Monsters" formatting.');
        })
        .catch(() => {
          spawnAppNotify('Share Failed ⚠️', 'Failed to copy achievement text.');
        });
    } else {
      spawnAppNotify('Feature Unavailable ⚠️', 'Clipboard access restricted in this environment.');
    }
  };

  const handleQuickEquip = (item: GearItem) => {
    setInventory(prev => {
      return prev.map(invItem => {
        // Unequip item in the same slot
        if (invItem.slot === item.slot && invItem.equipped && invItem.id !== item.id) {
          return { ...invItem, equipped: false };
        }
        // Equip this custom item
        if (invItem.id === item.id) {
          return { ...invItem, equipped: true };
        }
        return invItem;
      });
    });
    sound.playGatePass(true); // play solid equipment audio
  };

  const updateMissionsProgress = (reviews: MathGateReview[], goldValue: number) => {
    setDailyMissions(prevMissions => {
      return prevMissions.map(m => {
        if (m.completed) return m;

        let addedProgress = 0;
        if (m.id === 'mission_1') {
          addedProgress = reviews.filter(r => r.isBetterChoice && (r.leftText.toLowerCase().includes('x') || r.leftText.includes('×') || r.leftText.includes('*') || r.rightText.toLowerCase().includes('x') || r.rightText.includes('×') || r.rightText.includes('*'))).length;
        } else if (m.id === 'mission_2') {
          let maxStreak = 0;
          let currentStreak = 0;
          reviews.forEach(r => {
            if (r.isBetterChoice) {
              currentStreak++;
              if (currentStreak > maxStreak) maxStreak = currentStreak;
            } else {
              currentStreak = 0;
            }
          });
          addedProgress = maxStreak;
        } else if (m.id === 'mission_3') {
          addedProgress = goldValue;
        }

        const newCurrent = m.id === 'mission_2' 
          ? Math.max(m.current, addedProgress)
          : m.current + addedProgress;

        const completed = newCurrent >= m.target;
        if (completed && !m.completed) {
          spawnAppNotify('Daily Mission Cleared! 🏁', `You've satisfied all criteria for "${m.title}". Claim your rewards from HQ!`);
        }

        return {
          ...m,
          current: Math.min(m.target, newCurrent),
          completed,
        };
      });
    });
  };

  const handleClaimReward = (missionId: string) => {
    const mission = dailyMissions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    sound.playVictory();
    
    if (mission.rewardType === 'coins') {
      setCoins(c => c + mission.rewardValue);
      spawnAppNotify('Coins Claimed! 🪙', `Credited +🪙${mission.rewardValue} Coins to your balance.`);
    } else if (mission.rewardType === 'buff_starting') {
      setActiveBuffs((prev: { damageBoost: number; extraStarting: number }) => ({
        ...prev,
        extraStarting: prev.extraStarting + mission.rewardValue
      }));
      spawnAppNotify('Soldier Buff Prepped! 👥', `Added +${mission.rewardValue} starting forces to your next patrol deployment.`);
    } else if (mission.rewardType === 'buff_damage') {
      setActiveBuffs((prev: { damageBoost: number; extraStarting: number }) => ({
        ...prev,
        damageBoost: prev.damageBoost + mission.rewardValue
      }));
      spawnAppNotify('Damage Force Prepped! ⚡', `Prepped massive +${mission.rewardValue} Bullet Damage ready for next patrol.`);
    }

    setDailyMissions(prev => prev.map(m => m.id === missionId ? { ...m, claimed: true } : m));
  };

  const handleClaimStreakReward = () => {
    if (!currentUser) return;
    const pfx = `eek_${currentUser.id}_`;
    const today = getTodayDateString();
    const dayToClaim = (streakCount % 7) + 1;

    let rewardValue = 150;
    let rewardType: 'coins' | 'buff_damage' | 'buff_starting' | 'mega' = 'coins';
    let rewardLabel = '150 Coins';

    if (dayToClaim === 1) {
      rewardType = 'coins';
      rewardValue = 150;
      rewardLabel = '150 Coins';
    } else if (dayToClaim === 2) {
      rewardType = 'coins';
      rewardValue = 300;
      rewardLabel = '300 Coins';
    } else if (dayToClaim === 3) {
      rewardType = 'buff_starting';
      rewardValue = 2;
      rewardLabel = '+2 Starting Clones Buff';
    } else if (dayToClaim === 4) {
      rewardType = 'coins';
      rewardValue = 500;
      rewardLabel = '500 Coins';
    } else if (dayToClaim === 5) {
      rewardType = 'buff_damage';
      rewardValue = 1;
      rewardLabel = '+1 Bullet Damage Buff';
    } else if (dayToClaim === 6) {
      rewardType = 'coins';
      rewardValue = 750;
      rewardLabel = '750 Coins';
    } else if (dayToClaim === 7) {
      rewardType = 'mega';
      rewardValue = 1000;
      rewardLabel = '1000 Coins, +3 Starting Clones, & +2 Bullet Damage!';
    }

    if (rewardType === 'coins') {
      setCoins(c => c + rewardValue);
    } else if (rewardType === 'buff_starting') {
      setActiveBuffs((prev: { damageBoost: number; extraStarting: number }) => ({
        ...prev,
        extraStarting: prev.extraStarting + rewardValue
      }));
    } else if (rewardType === 'buff_damage') {
      setActiveBuffs((prev: { damageBoost: number; extraStarting: number }) => ({
        ...prev,
        damageBoost: prev.damageBoost + rewardValue
      }));
    } else if (rewardType === 'mega') {
      setCoins(c => c + 1000);
      setActiveBuffs((prev: { damageBoost: number; extraStarting: number }) => ({
        extraStarting: prev.extraStarting + 3,
        damageBoost: prev.damageBoost + 2
      }));
    }

    localStorage.setItem(pfx + 'last_login_date', today);
    localStorage.setItem(pfx + 'streak_count', dayToClaim.toString());

    setStreakCount(dayToClaim);
    setLastLoginDate(today);
    setStreakClaimedToday(true);

    sound.playVictory();
    spawnAppNotify(`Streak Claimed! 🔥`, `Day ${dayToClaim} Claimed: ${rewardLabel}`);

    setCurrentUser(prev => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        streakCount: dayToClaim,
        lastLoginDate: today,
        streakClaimedToday: true
      };
      try {
        const stored = localStorage.getItem('eek_profiles');
        if (stored) {
          const profileList: UserProfile[] = JSON.parse(stored);
          const updatedList = profileList.map(p => p.id === prev.id ? updated : p);
          localStorage.setItem('eek_profiles', JSON.stringify(updatedList));
        }
      } catch (_) {}
      return updated;
    });
  };

  const submitToLeaderboard = (username: string, score: number) => {
    if (score <= 0) return;
    try {
      const stored = localStorage.getItem('eek_leaderboard');
      let board: { name: string; score: number; date: number }[] = [];
      if (stored) {
        board = JSON.parse(stored);
      } else {
        board = [
          { name: 'MATH_WIZARD', score: 2450, date: 1779934110000 },
          { name: 'CHIP_8', score: 1840, date: 1779934105000 },
          { name: 'ATARI_CHAMP', score: 1290, date: 1779934090000 },
          { name: 'SOLDIER_Y', score: 980, date: 1779934080000 },
          { name: 'RETRO_RACER', score: 650, date: 1779934050000 }
        ];
      }

      const existingIdx = board.findIndex(item => item.name.toLowerCase() === username.toLowerCase());
      if (existingIdx >= 0) {
        if (score > board[existingIdx].score) {
          board[existingIdx].score = score;
          board[existingIdx].date = Date.now();
        }
      } else {
        board.push({ name: username, score, date: Date.now() });
      }

      board.sort((a, b) => b.score - a.score);
      board = board.slice(0, 5);

      localStorage.setItem('eek_leaderboard', JSON.stringify(board));
    } catch (e) {
      console.warn('LocalStorage save leaderboard failed', e);
    }
  };

  // --- ACTIONS ---
  const handleGameEndWin = (gold: number, loot: GearItem | null, reviews?: MathGateReview[], soldierHistory?: { distance: number; soldiers: number }[]) => {
    const nextStreak = winStreak + 1;
    setWinStreak(nextStreak);
    
    const pct = Math.min(50, nextStreak * 10);
    setWinStreakPctThisRun(pct);
    
    const bonus = Math.round(gold * (pct / 100));
    setWinStreakBonusThisRun(bonus);

    setGoldEarnedThisRun(gold);
    setLootDroppedThisRun(loot);
    setCoins(prev => prev + gold + bonus);
    setCurrentRunMathReviews(reviews || []);
    setSoldierHistoryRun(soldierHistory || []);
    setCardRevealed(false);
    setQuickEquipped(false);
    
    if (reviews) {
      updateMissionsProgress(reviews, gold);
      setHistoricalReviews(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const newReviews = reviews.filter(r => !existingIds.has(r.id));
        return [...prev, ...newReviews];
      });
    }

    let runDistance = 0;
    if (soldierHistory && soldierHistory.length > 0) {
      runDistance = soldierHistory[soldierHistory.length - 1].distance;
    }
    if (runDistance > highScore) {
      setHighScore(runDistance);
    }
    const activeUsername = currentUser ? currentUser.username : 'GUEST_OPERATOR';
    submitToLeaderboard(activeUsername, runDistance);

    // Calc previous run history stats
    const previousRuns = runHistory.filter(r => r.distance > 0);
    const avgPrevDist = previousRuns.length > 0 ? (previousRuns.reduce((sum, r) => sum + r.distance, 0) / previousRuns.length) : 0;
    setAvgPrevDistanceThisRun(avgPrevDist);

    let improvementPct = 0;
    if (avgPrevDist > 0) {
      improvementPct = ((runDistance - avgPrevDist) / avgPrevDist) * 100;
    }
    setPctImprovementThisRun(improvementPct);

    // ALWAYS award level completion prize on VICTORY (Completed a level)
    const isPrizeAwarded = true;
    setWasPrizeAwardedThisRun(isPrizeAwarded);
    setExtraTroopsExpiry(prev => Math.max(Date.now(), prev) + 15 * 60 * 1000);

    const newHistoryItem = {
      distance: runDistance,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'VICTORY',
      gold: gold + bonus,
    };
    setRunHistory(prev => [...prev, newHistoryItem]);

    if (currentLevelIndex < LEVEL_THEMES.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    }

    setStage('VICTORY');
    sound.playVictory();
  };

  const handleGameEndLose = (gold: number, reviews?: MathGateReview[], soldierHistory?: { distance: number; soldiers: number }[]) => {
    setWinStreak(0);
    setWinStreakPctThisRun(0);
    setWinStreakBonusThisRun(0);

    setGoldEarnedThisRun(gold);
    setCoins(prev => prev + gold);
    setCurrentRunMathReviews(reviews || []);
    setSoldierHistoryRun(soldierHistory || []);
    
    if (reviews) {
      updateMissionsProgress(reviews, gold);
      setHistoricalReviews(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const newReviews = reviews.filter(r => !existingIds.has(r.id));
        return [...prev, ...newReviews];
      });
    }

    let runDistance = 0;
    if (soldierHistory && soldierHistory.length > 0) {
      runDistance = soldierHistory[soldierHistory.length - 1].distance;
    }
    if (runDistance > highScore) {
      setHighScore(runDistance);
    }
    const activeUsername = currentUser ? currentUser.username : 'GUEST_OPERATOR';
    submitToLeaderboard(activeUsername, runDistance);

    // Calc previous run history stats
    const previousRuns = runHistory.filter(r => r.distance > 0);
    const avgPrevDist = previousRuns.length > 0 ? (previousRuns.reduce((sum, r) => sum + r.distance, 0) / previousRuns.length) : 0;
    setAvgPrevDistanceThisRun(avgPrevDist);

    let improvementPct = 0;
    if (avgPrevDist > 0) {
      improvementPct = ((runDistance - avgPrevDist) / avgPrevDist) * 100;
    }
    setPctImprovementThisRun(improvementPct);

    // Prize on lose is awarded if they achieved at least 15% improvement
    const isPrizeAwarded = avgPrevDist > 0 && improvementPct >= 15;
    setWasPrizeAwardedThisRun(isPrizeAwarded);
    if (isPrizeAwarded) {
      setExtraTroopsExpiry(prev => Math.max(Date.now(), prev) + 15 * 60 * 1000);
    }

    const newHistoryItem = {
      distance: runDistance,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'GAMEOVER',
      gold: gold,
    };
    setRunHistory(prev => [...prev, newHistoryItem]);

    setStage('GAMEOVER');
  };

  const handleLevelRestart = () => {
    handleCreateCheckpoint(true);
    sound.playCoin();
    setActiveBuffs({ damageBoost: 0, extraStarting: 0 });
    setStage('PLAYING');
  };

  const handleNextLevelProceed = () => {
    handleCreateCheckpoint(true);
    sound.playCoin();
    setActiveBuffs({ damageBoost: 0, extraStarting: 0 });
    setStage('PLAYING');
  };

  const activePalette = RETRO_PALETTES.find(p => p.id === selectedPaletteId) || RETRO_PALETTES[0];

  const dailyMissionsElement = (
    <DailyMissionsPanel 
      missions={dailyMissions} 
      onClaim={handleClaimReward} 
      palette={activePalette} 
      activeBuffs={activeBuffs}
    />
  );

  const dailyStreakElement = currentUser ? (
    <DailyStreakPanel
      streakCount={streakCount}
      streakClaimedToday={streakClaimedToday}
      onClaim={handleClaimStreakReward}
      palette={activePalette}
    />
  ) : null;

  return (
    <div className={`font-sans h-screen max-h-[100dvh] flex items-center justify-center relative select-none overflow-hidden ${activePalette.bgBgClass}`}>
      {/* Container emulator layout */}
      <div className={`w-full max-w-lg h-full border-x shadow-2xl relative flex flex-col justify-between overflow-hidden ${activePalette.bgBgClass} ${activePalette.borderClass}`}>
        
        {/* State Stage Gateways */}
        {!currentUser ? (
          <LoginPortal
            palette={activePalette}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <>
            {stage === 'MENU' && (
              <MainMenu
                mathMode={mathMode}
                setMathMode={setMathMode}
                mathDifficulty={mathDifficulty}
                setMathDifficulty={setMathDifficulty}
                characterId={characterId}
                setCharacterId={setCharacterId}
                highScore={highScore}
                unlockedAura={unlockedAura}
                extraTroopsExpiry={extraTroopsExpiry}
                onShowShop={() => {
                  sound.playCoin();
                  setStage('SHOP');
                }}
                onStart={() => {
                  handleCreateCheckpoint(true); // Auto checkpoint
                  sound.playCoin();
                  // Consume active buffs upon starting a deployment patrol
                  setActiveBuffs({ damageBoost: 0, extraStarting: 0 });
                  setStage('PLAYING');
                }}
                onShowUpgrades={() => {
                  sound.playCoin();
                  setStage('UPGRADES');
                }}
                onShowArmory={() => {
                  sound.playCoin();
                  setStage('ARMORY');
                }}
                onShowHelp={() => {
                  sound.playCoin();
                  setStage('HELP');
                }}
                onShowBestiary={() => {
                  sound.playCoin();
                  setStage('BESTIARY');
                }}
                onShowLeaderboard={() => {
                  sound.playCoin();
                  setStage('LEADERBOARD');
                }}
                onShowReports={() => {
                  sound.playCoin();
                  setStage('REPORTS');
                }}
                onOpenSettings={() => setIsSettingsOpen(true)}
                palette={activePalette}
                dailyMissionsComponent={dailyMissionsElement}
                dailyStreakComponent={dailyStreakElement}
                currentUserProfile={currentUser}
                onSignOut={handleSignOut}
              />
            )}

        {stage === 'SHOP' && (
          <ShopPanel
            coins={coins}
            setCoins={setCoins}
            unlockedAura={unlockedAura}
            setUnlockedAura={setUnlockedAura}
            isDoubleCoins={isDoubleCoins}
            setIsDoubleCoins={setIsDoubleCoins}
            hasPremiumMagnet={hasPremiumMagnet}
            setHasPremiumMagnet={setHasPremiumMagnet}
            onBack={() => setStage('MENU')}
          />
        )}

        {stage === 'UPGRADES' && (
          <UpgradesPanel
            coins={coins}
            setCoins={setCoins}
            upgrades={upgrades}
            setUpgrades={setUpgrades}
            onBack={() => setStage('MENU')}
          />
        )}

        {stage === 'ARMORY' && (
          <ArmoryPanel
            inventory={inventory}
            setInventory={setInventory}
            coins={coins}
            setCoins={setCoins}
            onBack={() => setStage('MENU')}
          />
        )}

        {stage === 'HELP' && (
          <HelpDialog onBack={() => setStage('MENU')} />
        )}

        {stage === 'BESTIARY' && (
          <BestiaryPanel
            onBack={() => setStage('MENU')}
            palette={activePalette}
          />
        )}

        {stage === 'LEADERBOARD' && (
          <LeaderboardPanel
            onBack={() => setStage('MENU')}
            palette={activePalette}
          />
        )}

        {stage === 'REPORTS' && (
          <AfterActionReport
            currentRunReviews={currentRunMathReviews}
            historicalReviews={historicalReviews}
            palette={activePalette}
            onBack={() => setStage('MENU')}
          />
        )}

        {stage === 'PLAYING' && (
          <GameCanvas
            level={currentLevelTheme}
            mathMode={mathMode}
            mathDifficulty={mathDifficulty}
            characterId={characterId}
            upgrades={{
              ...upgrades,
              startingSoldiers: upgrades.startingSoldiers + activeBuffs.extraStarting,
              damageLevel: upgrades.damageLevel + activeBuffs.damageBoost,
            }}
            inventory={inventory}
            setInventory={setInventory}
            isDoubleCoins={isDoubleCoins}
            hasPremiumMagnet={hasPremiumMagnet}
            is3DMode={is3DMode}
            is256BitGraphics={is256BitGraphics}
            extraTroopsActive={extraTroopsExpiry > Date.now()}
            onWin={handleGameEndWin}
            onLose={handleGameEndLose}
            onBack={() => setStage('MENU')}
            onAutoSave={handleCreateCheckpoint}
          />
        )}

        {/* VICTORY LOOT FLIP SCREEN */}
        {stage === 'VICTORY' && (
          <div className={`flex flex-col items-center justify-start h-full w-full px-5 py-6 scanlines relative text-center overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 touch-pan-y z-10 ${activePalette.bgBgClass}`}>
            {/* Retro pixelated 8-bit coin burst particles! */}
            <CoinBurst />

            <div className="absolute inset-0 bg-radial-at-t from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="py-2 z-10 flex flex-col items-center shrink-0">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full mb-3 animate-bounce">
                <Award size={36} />
              </div>
              
              <h1 className="text-3xl font-black font-display text-white tracking-tight uppercase leading-none">
                GIGA BOSS FEATHERED!
              </h1>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                VICTORY PROGRESS SEED ACQUIRED
              </p>

              {/* Gold Stats */}
              <div className="flex items-center space-x-1.5 bg-yellow-950/25 border border-yellow-800 px-4 py-2 rounded-2xl my-4 shadow">
                <Coins className="text-yellow-400" size={16} />
                <span className="text-xs font-mono font-bold text-yellow-500">TRIBUTE AWARDED:</span>
                <span className="text-sm font-mono font-black text-yellow-400">🪙 {goldEarnedThisRun}</span>
              </div>

              {/* Watch Ad for Bonus gold option */}
              <button
                onClick={() => triggerRewardedAd('gold')}
                className="mb-4 py-2 px-4 bg-yellow-950/40 hover:bg-yellow-950/80 border border-yellow-600/40 hover:border-yellow-500 text-yellow-400 rounded-xl font-mono text-[9.5px] font-black tracking-wider flex items-center justify-center space-x-1.5 active:scale-95 transition cursor-pointer max-w-sm"
              >
                <span>📺 WATCH AD FOR BONUS 🪙 +350 COINS</span>
              </button>

              {/* Interactive Card Reveal section */}
              {lootDroppedThisRun ? (
                <div className="flex flex-col items-center max-w-sm w-full mx-auto my-1 px-4 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-purple-400 tracking-widest uppercase mb-3">
                    ELITE BOSS DROP IDENTIFIED
                  </span>

                  {/* Flippable Card Container with float animation before flip */}
                  <button
                    onClick={() => {
                      if (!cardRevealed) {
                        setCardRevealed(true);
                        sound.playGearDrop(); // Shimmering sound upon card reveal
                      } else {
                        // Clicking on the won card after reveal makes it go away completely
                        setLootDroppedThisRun(null);
                      }
                    }}
                    className={`h-56 w-40 outline-none cursor-pointer relative transition-transform duration-700 ease-in-out select-none [transform-style:preserve-3d] ${
                      cardRevealed 
                        ? '[transform:rotateY(180deg)]' 
                        : 'animate-float-card hover:scale-110 active:scale-95 hover:shadow-2xl hover:shadow-purple-500/10'
                    }`}
                  >
                    {/* Unrevealed Front Face */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl border-2 border-dashed border-purple-500 bg-purple-950/20 hover:bg-purple-950/40 flex flex-col items-center justify-center p-4 [backface-visibility:hidden] z-10 pb-6">
                      <Sparkles className="text-purple-400 mb-2 animate-spin-slow" size={24} />
                      <span className="text-[10px] font-mono text-purple-300 font-bold tracking-wider leading-relaxed text-center uppercase">
                        TAP TO REVEAL BOSS CARD
                      </span>
                    </div>

                    {/* Revealed Back Face (Rotated 180deg internally so it is right-side up when flipped) */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl border-2 border-indigo-500 bg-slate-900 shadow-xl shadow-indigo-950/25 p-4 flex flex-col justify-between select-none text-left overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      {/* Background effect */}
                      <div className="absolute inset-0 bg-radial-at-t from-indigo-500/10 to-transparent pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <span className="text-2xl shadow-sm">{lootDroppedThisRun.icon}</span>
                        <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider font-extrabold ${
                          lootDroppedThisRun.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        }`}>
                          {lootDroppedThisRun.rarity}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">
                          {lootDroppedThisRun.name.split(' ').slice(1).join(' ')}
                        </h4>
                        <p className="text-[10px] text-teal-400 font-mono mt-0.5 font-bold">
                          +{lootDroppedThisRun.statValue}{isPercentage(lootDroppedThisRun.statName) ? '%' : ''} {lootDroppedThisRun.statName.replace('Bonus','')}
                        </p>
                        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider block mt-0.5">
                          Slot: {lootDroppedThisRun.slot}
                        </span>

                        {/* TOTAL POWER GEAR COMPARISON */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 font-mono text-[9px] text-slate-400 flex flex-col gap-0.5">
                          <span className="text-yellow-405 font-extrabold uppercase tracking-tight text-[8px] mb-0.5 block">
                            TOTAL POWER GEAR INFO
                          </span>
                          <div className="flex justify-between">
                            <span>Equipped Total:</span>
                            <span className="text-slate-300">
                              +{getPowerInfo(lootDroppedThisRun).current}{isPercentage(lootDroppedThisRun.statName) ? '%' : ''}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-emerald-400">
                            <span>Projected Power:</span>
                            <span>
                              +{getPowerInfo(lootDroppedThisRun).projected}{isPercentage(lootDroppedThisRun.statName) ? '%' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {cardRevealed && (
                    <div className="flex flex-col items-center mt-3">
                      {quickEquipped ? (
                        <div className="py-2 px-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center space-x-1 animate-pulse">
                          <span>✓ EQUIPPED IN LOADOUT!</span>
                        </div>
                      ) : (
                        (() => {
                          const powerInfo = getPowerInfo(lootDroppedThisRun);
                          const isBetter = powerInfo.projected > powerInfo.current;
                          
                          if (isBetter) {
                            return (
                              <button
                                onClick={() => {
                                  handleQuickEquip(lootDroppedThisRun);
                                  setQuickEquipped(true);
                                }}
                                className="w-full max-w-xs py-2.5 px-5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-mono text-xs font-black rounded-xl active:scale-95 transition flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
                              >
                                <span>⚡ QUICK EQUIP (+POWER)</span>
                              </button>
                            );
                          } else {
                            return (
                              <p className="text-[10px] text-slate-500 font-mono">
                                Visit your Soldier Armory on the menu to equip item! (Current gear has higher power)
                              </p>
                            );
                          }
                        })()
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-3 flex flex-col items-center shrink-0">
                  <Gift className="text-slate-600 mb-1" size={18} />
                  <span className="text-[9.5px] text-slate-600 font-mono">Loot crate vacant for this region</span>
                </div>
              )}
            </div>

            {/* SAVEPOINTS CHECKPOINT WIDGET */}
            <div className="w-full max-w-sm bg-slate-900/40 border border-slate-900 rounded-2xl p-4 my-2 text-left z-10 shrink-0 select-none">
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-2 mb-3.5 font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs">💾</span>
                  <h3 className="text-xs font-black text-indigo-405 uppercase tracking-widest leading-none">
                    CHRONOS CHECKPOINTS
                  </h3>
                </div>
                <span className="text-[7.5px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-900 px-1 py-0.5 rounded">SAVE POINT</span>
              </div>

              {checkpointState ? (
                <div className="flex flex-col gap-2 font-mono">
                  <div className="p-2.5 rounded-xl border border-indigo-900/40 bg-indigo-950/10 text-[9px] leading-relaxed text-slate-300 flex justify-between items-center">
                    <div>
                      <p className="font-sans text-[10px] text-slate-100 font-semibold uppercase tracking-tight">Active Checkpoint Status:</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">Coins: 🪙{checkpointState.coins} | Level: Theme {checkpointState.levelIndex + 1}</p>
                    </div>
                    <span className="bg-emerald-955 bg-emerald-950 text-emerald-400 text-[6.5px] font-black border border-emerald-900 rounded px-1 py-0.5 animate-pulse">WARP READY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={handleRestoreCheckpoint}
                      className="py-2.5 px-3 bg-indigo-950 hover:bg-indigo-900/50 border border-indigo-805 text-[9px] font-black text-indigo-305 text-indigo-300 hover:text-white rounded-xl active:scale-95 transition cursor-pointer text-center flex items-center justify-center space-x-1 uppercase"
                    >
                      <span>⏪ WARP BACK</span>
                    </button>
                    <button
                      onClick={() => triggerRewardedAd('restore')}
                      className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-805 text-[9px] font-black text-yellow-405 text-yellow-400 hover:text-yellow-300 rounded-xl active:scale-95 transition cursor-pointer text-center flex items-center justify-center space-x-1 uppercase"
                    >
                      <span>📺 PREMIUM LOAD</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 bg-slate-950/30 rounded-xl border border-slate-900/80">
                  <span className="text-[9px] text-slate-500 font-mono leading-relaxed block">No rescue checkpoint recorded. Launch troops or upgrade characters to trigger auto-saves, or back up checkpoints manually!</span>
                  <button
                    onClick={() => handleCreateCheckpoint(false)}
                    className="mt-2 py-1 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[8.5px] font-black text-slate-300 hover:text-white rounded-lg active:scale-95 transition cursor-pointer font-mono inline-block mx-auto"
                  >
                    💾 SAVE CHECKPOINT SECURELY
                  </button>
                </div>
              )}
            </div>

            {/* Battle History Line Area progression Graph - Visualizing soldier count progression */}
            <div className="w-full max-w-sm my-2 z-10 shrink-0">
              <BattleHistoryChart data={soldierHistoryRun} palette={activePalette} />
            </div>

            {/* RUN PERFORMANCE HISTORY AND COMPARISON REPORT */}
            <div className="w-full max-w-sm bg-slate-900/60 border border-slate-800 rounded-2xl p-4 my-3 text-left z-10 shrink-0 select-none font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <span>📈 PERFORMANCE COMPARISON</span>
                </h3>
                <span className="text-[8px] font-mono font-bold text-slate-500">
                  PATROL #{runHistory.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 font-mono text-[10px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900/60">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">This Deployment:</span>
                  <span className="text-xs font-black text-white">{soldierHistoryRun.length > 0 ? soldierHistoryRun[soldierHistoryRun.length - 1].distance : 0}M</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900/60">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Historical Average:</span>
                  <span className="text-xs font-black text-slate-300">
                    {avgPrevDistanceThisRun > 0 ? `${avgPrevDistanceThisRun.toFixed(0)}M` : 'Base Run'}
                  </span>
                </div>
              </div>

              {avgPrevDistanceThisRun > 0 ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[10px]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-400">Calculated Improvement:</span>
                    <span className={`font-black ${pctImprovementThisRun > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {pctImprovementThisRun > 0 ? `+${pctImprovementThisRun.toFixed(1)}%` : '0%'}
                    </span>
                  </div>

                  {pctImprovementThisRun >= 15 ? (
                    <div className="mt-2 pt-2 border-t border-slate-900/80">
                      <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wide">
                        <span>🏆</span>
                        <span>
                          {pctImprovementThisRun >= 100 ? 'Epic job!' :
                           pctImprovementThisRun >= 50 ? 'Awesome job!' :
                           pctImprovementThisRun >= 30 ? 'Great job!' : 'Good job!'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-450 mt-1 leading-normal text-slate-400">
                        Improved by over{' '}
                        <span className="text-white font-bold">
                          {pctImprovementThisRun >= 100 ? '100' :
                           pctImprovementThisRun >= 50 ? '50' :
                           pctImprovementThisRun >= 30 ? '30' : '15'}%
                        </span>{' '}
                        vs average. Starting Troop bonus power-up registered!
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 pb-1 text-[8.5px] text-slate-400 leading-normal">
                      🏁 Hit 15% improvement threshold vs your {avgPrevDistanceThisRun.toFixed(0)}M baseline to unlock a 15-minute start troops multiplier!
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-[9px] font-mono text-slate-505 leading-normal">
                  📊 Baseline established. Future deployment distances will comparison-track from this average to unlock active starting boosts.
                </div>
              )}

              {/* Power up status */}
              {wasPrizeAwardedThisRun && (
                <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-505/30 text-emerald-300 rounded-xl flex items-center justify-between font-mono text-[9px]">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="animate-bounce">🎁</span>
                    <div className="truncate">
                      <p className="font-extrabold text-white uppercase text-[9.5px]">PRIZE SECURED!</p>
                      <p className="text-[8.5px] text-slate-400 animate-pulse">Power Up: +2 Extra Troops for 15M!</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400 shrink-0 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-900 uppercase text-[8px] tracking-wider">
                    UNLOCKED
                  </span>
                </div>
              )}
            </div>

            {/* HISTORICAL LOG TRACKER */}
            <div className="w-full max-w-sm bg-slate-900/40 border border-slate-900 rounded-2xl p-4 my-2 text-left z-10 shrink-0 select-none">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5 text-slate-400">
                  <span>📁 FLIGHT DEPLOYMENT HISTORY</span>
                </h3>
                <span className="text-[8px] font-mono font-bold text-slate-500">
                  {runHistory.length} Runs recorded
                </span>
              </div>

              {runHistory.length === 0 ? (
                <span className="text-[9.5px] text-slate-500 font-mono italic block py-2 text-center">No past runs captured.</span>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {[...runHistory].reverse().map((run, hIdx) => (
                    <div key={hIdx} className="p-2 border border-slate-900 bg-slate-950/60 rounded-xl flex justify-between items-center font-mono text-[9px]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={run.stage === 'VICTORY' ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                            {run.stage === 'VICTORY' ? '🏆 WIN' : '💀 FAIL'}
                          </span>
                          <span className="text-slate-350 font-extrabold font-mono text-[9.5px]">{run.distance}M</span>
                        </div>
                        <span className="text-[7.5px] text-slate-500 block mt-0.5">{run.date}</span>
                      </div>
                      <span className="text-yellow-500 font-bold">🪙 {run.gold}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MATH OUTCOME REVIEW LOGS */}
            <div className="w-full max-w-sm bg-slate-900/40 border border-slate-900 rounded-2xl p-4 my-2 text-left z-10 shrink-0 select-none">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <span>📊 MATH RUN DEBRIEF</span>
                </h3>
                <span className="text-[8px] font-mono font-bold text-slate-500">
                  {currentRunMathReviews.length} Wave {currentRunMathReviews.length === 1 ? 'Gate' : 'Gates'} Crossed
                </span>
              </div>

              {currentRunMathReviews.length === 0 ? (
                <div className="text-center py-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[9.5px] text-slate-505 font-mono leading-relaxed block px-2">No gates traversed during this mission cycle. Ensure you target algebraic/formula portals to expand your squad!</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {currentRunMathReviews.map((review, rIdx) => {
                    return (
                      <div
                        key={review.id || rIdx}
                        className={`p-3 rounded-xl border bg-gradient-to-br transition-all border-slate-900/30 ${
                          review.isBetterChoice 
                            ? 'from-slate-950 to-emerald-955/5 border-emerald-950/40' 
                            : 'from-slate-950 to-orange-955/5 border-orange-950/40'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8px] font-mono text-slate-505">Progression: {review.distance}M</span>
                          <span className={`text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                            review.isBetterChoice 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                              : 'bg-orange-950 text-orange-400 border border-orange-900/30 animate-pulse'
                          }`}>
                            {review.isBetterChoice ? '✓ OPTIMAL' : '✗ INFERIOR'}
                          </span>
                        </div>

                        <div className="flex gap-2 items-center mb-1.5 bg-slate-950/50 p-1 rounded-lg border border-slate-900/65 font-mono text-[9.5px]">
                          <span className="text-slate-505 uppercase px-1 text-[8px] tracking-wider">Formula Option:</span>
                          <span className="px-1.5 rounded uppercase font-extrabold bg-slate-900 text-slate-350">
                            {review.leftText}
                          </span>
                          <span className="text-slate-600 font-bold font-mono">vs</span>
                          <span className="px-1.5 rounded uppercase font-extrabold bg-slate-900 text-slate-350">
                            {review.rightText}
                          </span>
                        </div>

                        <div className="text-[9px] font-sans text-slate-100 leading-normal border-t border-slate-900/30 pt-1.5">
                          <p className="text-slate-450 mb-1 leading-normal text-slate-300">
                            Squad size grew from <span className="text-white font-black">{review.initialSoldiers}</span> to{' '}
                            <span className={review.isBetterChoice ? 'text-emerald-400 font-black' : 'text-orange-400 font-black'}>{review.outcomeValue}</span> soldiers{' '}
                            ({review.choice === 'left' ? 'Left Portal' : 'Right Portal'}).{' '}
                            {!review.isBetterChoice && (
                              <span>Alternative path was <span className="text-emerald-405 font-bold">{review.alternateValue}</span> troops.</span>
                            )}
                          </p>
                          <div className={`p-1.5 rounded mt-1.5 text-[8.5px] font-mono leading-relaxed bg-slate-900/40 ${
                            review.isBetterChoice ? 'text-emerald-300' : 'text-orange-300 font-normal'
                          }`}>
                            {review.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Bar Bottom */}
            <div className="w-full flex gap-2.5 z-10 shrink-0 mt-4 select-none">
              <button
                onClick={() => {
                  sound.playCoin();
                  setStage('MENU');
                }}
                className="flex-1 py-3 px-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 font-mono text-[10.5px] font-bold text-slate-300 hover:text-white rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1"
                id="btn_victory_home"
              >
                <Home size={12} />
                <span>MENU</span>
              </button>

              <button
                onClick={() => {
                  sound.playCoin();
                  setStage('REPORTS');
                }}
                className="flex-1 py-3 px-2 bg-rose-950/45 border border-rose-900/55 hover:bg-rose-900/50 hover:border-rose-700 font-mono text-[10.5px] font-black text-rose-300 hover:text-white rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1"
                id="btn_victory_aar"
              >
                <span>📊 VIEW AAR</span>
              </button>

              <button
                onClick={handleNextLevelProceed}
                className="flex-[1.2] py-3 px-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-mono text-[10.5px] font-black text-slate-950 rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1 uppercase font-bold"
                id="btn_victory_next"
              >
                <span>NEXT LEVEL</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* GAMEOVER SCREEN */}
        {stage === 'GAMEOVER' && (
          <div className={`flex flex-col items-center justify-start h-full w-full px-5 py-6 scanlines relative text-center overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 touch-pan-y z-10 ${activePalette.bgBgClass}`}>
            <div className="absolute inset-0 bg-radial-at-t from-red-950/40 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="py-2 z-10 flex flex-col items-center shrink-0">
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full mb-3 animate-pulse">
                <ShieldAlert size={36} />
              </div>
              
              <h1 className="text-3xl font-black font-display text-white tracking-tight uppercase leading-none">
                SQUAD OVERRUN!
              </h1>
              <p className="text-[10px] text-red-400 font-mono tracking-widest mt-2">
                FAILED MATHEMATICAL TARGETS
              </p>

              {/* Tips container box */}
              <div className="max-w-xs bg-slate-900/60 border border-slate-800 p-4 rounded-2xl my-4 shadow text-left">
                <h4 className="text-[11px] font-mono font-bold text-yellow-500 uppercase mb-1 flex items-center space-x-1.5">
                  <Flame size={12} className="shrink-0 text-yellow-500" />
                  <span>TACTICAL STUDY STRATEGY:</span>
                </h4>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                  "Each math door calculates instantly. If your soldier numbers deplete too far, your fire rate won't break zombie defenses. Use gold tributes at the **Recruit Barracks** to upgrade Starting Troops and fire speeds before next deployment!"
                </p>
              </div>

              {/* Gold Stats */}
              <div className="flex items-center space-x-1.5 bg-yellow-950/10 border border-yellow-800/20 px-3.5 py-1.5 rounded-full shadow mb-4">
                <Coins className="text-yellow-400" size={14} />
                <span className="text-[10px] font-mono tracking-wide text-slate-450 font-bold">GOLD RETRIEVED:</span>
                <span className="text-xs font-mono font-black text-yellow-400">🪙 {goldEarnedThisRun}</span>
              </div>

              {/* Watch Ad for Bonus gold option */}
              <button
                onClick={() => triggerRewardedAd('gold')}
                className="mb-1 py-1.5 px-3 bg-yellow-950/40 hover:bg-yellow-950/80 border border-yellow-600/40 hover:border-yellow-500 rounded-xl font-mono text-[9px] font-black text-yellow-400 tracking-wider flex items-center justify-center space-x-1.5 active:scale-95 transition cursor-pointer max-w-sm"
              >
                <span>📺 WATCH AD FOR EXTRA 🪙 +350 GOLD</span>
              </button>
            </div>

            {/* SAVEPOINTS CHECKPOINT WIDGET */}
            <div className="w-full max-w-sm bg-slate-900/40 border border-slate-900 rounded-2xl p-4 my-2 text-left z-10 shrink-0 select-none">
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-2 mb-3.5 font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs">💾</span>
                  <h3 className="text-xs font-black text-indigo-405 uppercase tracking-widest leading-none">
                    CHRONOS CHECKPOINTS
                  </h3>
                </div>
                <span className="text-[7.5px] font-bold bg-indigo-950 text-indigo-305 text-indigo-300 border border-indigo-900 px-1 py-0.5 rounded">SAVE POINT</span>
              </div>

              {checkpointState ? (
                <div className="flex flex-col gap-2 font-mono">
                  <div className="p-2.5 rounded-xl border border-indigo-900/40 bg-indigo-950/10 text-[9px] leading-relaxed text-slate-300 flex justify-between items-center">
                    <div>
                      <p className="font-sans text-[10px] text-slate-100 font-semibold uppercase tracking-tight">Active Checkpoint Status:</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">Coins: 🪙{checkpointState.coins} | Level: Theme {checkpointState.levelIndex + 1}</p>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 text-[6.5px] font-black border border-emerald-900 rounded px-1 py-0.5 animate-pulse">WARP READY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={handleRestoreCheckpoint}
                      className="py-2.5 px-3 bg-indigo-950 hover:bg-indigo-900/50 border border-indigo-805 text-[9px] font-black text-indigo-305 text-indigo-300 hover:text-white rounded-xl active:scale-95 transition cursor-pointer text-center flex items-center justify-center space-x-1 uppercase"
                    >
                      <span>⏪ WARP BACK</span>
                    </button>
                    <button
                      onClick={() => triggerRewardedAd('restore')}
                      className="py-2.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-805 text-[9px] font-black text-yellow-405 text-yellow-400 hover:text-yellow-300 rounded-xl active:scale-95 transition cursor-pointer text-center flex items-center justify-center space-x-1 uppercase"
                    >
                      <span>📺 PREMIUM LOAD</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 bg-slate-950/30 rounded-xl border border-slate-900/80">
                  <span className="text-[9px] text-slate-500 font-mono leading-relaxed block">No rescue checkpoint recorded. Launch troops or upgrade characters to trigger auto-saves, or back up checkpoints manually!</span>
                  <button
                    onClick={() => handleCreateCheckpoint(false)}
                    className="mt-2 py-1 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[8.5px] font-black text-slate-300 hover:text-white rounded-lg active:scale-95 transition cursor-pointer font-mono inline-block mx-auto"
                  >
                    💾 SAVE CURRENT SQUAD CHECKPOINT
                  </button>
                </div>
              )}
            </div>

            {/* Battle History Line Area progression Graph - Visualizing soldier progression */}
            <div className="w-full max-w-sm my-2 z-10 shrink-0">
              <BattleHistoryChart data={soldierHistoryRun} palette={activePalette} />
            </div>

            {/* RUN PERFORMANCE HISTORY AND COMPARISON REPORT */}
            <div className="w-full max-w-sm bg-slate-900/60 border border-slate-800 rounded-2xl p-4 my-3 text-left z-10 shrink-0 select-none font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <span>📈 PERFORMANCE COMPARISON</span>
                </h3>
                <span className="text-[8px] font-mono font-bold text-slate-500">
                  PATROL #{runHistory.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 font-mono text-[10px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900/60">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">This Deployment:</span>
                  <span className="text-xs font-black text-white">{soldierHistoryRun.length > 0 ? soldierHistoryRun[soldierHistoryRun.length - 1].distance : 0}M</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900/60">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Historical Average:</span>
                  <span className="text-xs font-black text-slate-300">
                    {avgPrevDistanceThisRun > 0 ? `${avgPrevDistanceThisRun.toFixed(0)}M` : 'Base Run'}
                  </span>
                </div>
              </div>

              {avgPrevDistanceThisRun > 0 ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[10px]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-400">Calculated Improvement:</span>
                    <span className={`font-black ${pctImprovementThisRun > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {pctImprovementThisRun > 0 ? `+${pctImprovementThisRun.toFixed(1)}%` : '0%'}
                    </span>
                  </div>

                  {pctImprovementThisRun >= 15 ? (
                    <div className="mt-2 pt-2 border-t border-slate-900/80">
                      <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wide">
                        <span>🏆</span>
                        <span>
                          {pctImprovementThisRun >= 100 ? 'Epic job!' :
                           pctImprovementThisRun >= 50 ? 'Awesome job!' :
                           pctImprovementThisRun >= 30 ? 'Great job!' : 'Good job!'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-450 mt-1 leading-normal text-slate-400">
                        Improved by over{' '}
                        <span className="text-white font-bold">
                          {pctImprovementThisRun >= 100 ? '100' :
                           pctImprovementThisRun >= 50 ? '50' :
                           pctImprovementThisRun >= 30 ? '30' : '15'}%
                        </span>{' '}
                        vs average. Starting Troop bonus power-up registered!
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 pb-1 text-[8.5px] text-slate-400 leading-normal">
                      🏁 Hit 15% improvement threshold vs your {avgPrevDistanceThisRun.toFixed(0)}M baseline to unlock a 15-minute start troops multiplier!
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-[9px] font-mono text-slate-505 leading-normal">
                  📊 Baseline established. Future deployment distances will comparison-track from this average to unlock active starting boosts.
                </div>
              )}

              {/* Power up status */}
              {wasPrizeAwardedThisRun && (
                <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-505/30 text-emerald-300 rounded-xl flex items-center justify-between font-mono text-[9px]">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="animate-bounce">🎁</span>
                    <div className="truncate">
                      <p className="font-extrabold text-white uppercase text-[9.5px]">PRIZE SECURED!</p>
                      <p className="text-[8.5px] text-slate-400 animate-pulse">Power Up: +2 Extra Troops for 15M!</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400 shrink-0 bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-900 uppercase text-[8px] tracking-wider">
                    UNLOCKED
                  </span>
                </div>
              )}
            </div>

            {/* HISTORICAL LOG TRACKER */}
            <div className="w-full max-w-sm bg-slate-900/40 border border-slate-900 rounded-2xl p-4 my-2 text-left z-10 shrink-0 select-none">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5 text-slate-400">
                  <span>📁 FLIGHT DEPLOYMENT HISTORY</span>
                </h3>
                <span className="text-[8px] font-mono font-bold text-slate-500">
                  {runHistory.length} Runs recorded
                </span>
              </div>

              {runHistory.length === 0 ? (
                <span className="text-[9.5px] text-slate-500 font-mono italic block py-2 text-center">No past runs captured.</span>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {[...runHistory].reverse().map((run, hIdx) => (
                    <div key={hIdx} className="p-2 border border-slate-900 bg-slate-950/60 rounded-xl flex justify-between items-center font-mono text-[9px]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={run.stage === 'VICTORY' ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                            {run.stage === 'VICTORY' ? '🏆 WIN' : '💀 FAIL'}
                          </span>
                          <span className="text-slate-350 font-extrabold font-mono text-[9.5px]">{run.distance}M</span>
                        </div>
                        <span className="text-[7.5px] text-slate-500 block mt-0.5">{run.date}</span>
                      </div>
                      <span className="text-yellow-500 font-bold">🪙 {run.gold}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MATH OUTCOME REVIEW LOGS */}
            <div className="w-full max-w-sm bg-slate-900/40 border border-slate-900 rounded-2xl p-4 my-2 text-left z-10 shrink-0 select-none">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                <h3 className="text-xs font-mono font-black text-cyan-405 uppercase tracking-widest flex items-center space-x-1.5">
                  <span>📊 MATH RUN DEBRIEF</span>
                </h3>
                <span className="text-[8px] font-mono font-bold text-slate-500">
                  {currentRunMathReviews.length} Wave {currentRunMathReviews.length === 1 ? 'Gate' : 'Gates'} Crossed
                </span>
              </div>

              {currentRunMathReviews.length === 0 ? (
                <div className="text-center py-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-[9.5px] text-slate-505 font-mono leading-relaxed block px-2">No gates traversed during this mission cycle. Ensure you target algebraic/formula portals to expand your squad!</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {currentRunMathReviews.map((review, rIdx) => {
                    return (
                      <div
                        key={review.id || rIdx}
                        className={`p-3 rounded-xl border bg-gradient-to-br transition-all border-slate-900/35 ${
                          review.isBetterChoice 
                            ? 'from-slate-950 to-emerald-955/5 border-emerald-900/40' 
                            : 'from-slate-950 to-orange-955/5 border-orange-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8px] font-mono text-slate-505">Progression: {review.distance}M</span>
                          <span className={`text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                            review.isBetterChoice 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' 
                              : 'bg-orange-950 text-orange-400 border border-orange-900/40 animate-pulse'
                          }`}>
                            {review.isBetterChoice ? '✓ OPTIMAL' : '✗ INFERIOR'}
                          </span>
                        </div>

                        <div className="flex gap-2 items-center mb-1.5 bg-slate-950/50 p-1 rounded-lg border border-slate-900/80 font-mono text-[9.5px]">
                          <span className="text-slate-505 uppercase px-1 text-[8px] tracking-wider">Formula Option:</span>
                          <span className="px-1.5 rounded uppercase font-extrabold bg-slate-900 text-slate-350">
                            {review.leftText}
                          </span>
                          <span className="text-slate-600 font-bold font-mono">vs</span>
                          <span className="px-1.5 rounded uppercase font-extrabold bg-slate-900 text-slate-350">
                            {review.rightText}
                          </span>
                        </div>

                        <div className="text-[9px] font-sans text-slate-300 leading-normal border-t border-slate-900/30 pt-1.5">
                          <p className="text-slate-400 mb-1 leading-normal">
                            Squad size grew from <span className="text-white font-black">{review.initialSoldiers}</span> to{' '}
                            <span className={review.isBetterChoice ? 'text-emerald-400 font-black' : 'text-orange-400 font-black'}>{review.outcomeValue}</span> soldiers{' '}
                            ({review.choice === 'left' ? 'Left Portal' : 'Right Portal'}).{' '}
                            {!review.isBetterChoice && (
                              <span>Alternative path was <span className="text-emerald-400 font-semibold">{review.alternateValue}</span> troops.</span>
                            )}
                          </p>
                          <div className={`p-1.5 rounded mt-1.5 text-[8.5px] font-mono leading-relaxed bg-slate-900/60 ${
                            review.isBetterChoice ? 'text-emerald-300' : 'text-orange-300 font-normal'
                          }`}>
                            {review.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Bar Bottom */}
            <div className="w-full flex gap-2.5 z-10 shrink-0 mt-4 select-none">
              <button
                onClick={() => {
                  sound.playCoin();
                  setStage('MENU');
                }}
                className="flex-1 py-3 px-2 bg-indigo-950 border border-indigo-900/60 hover:bg-indigo-900 font-mono text-[10.5px] font-black text-indigo-300 hover:text-white rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1 uppercase"
                id="btn_fail_home"
              >
                <span>MENU</span>
              </button>

              <button
                onClick={() => {
                  sound.playCoin();
                  setStage('REPORTS');
                }}
                className="flex-1 py-3 px-2 bg-rose-950/45 border border-rose-900/55 hover:bg-rose-900/50 hover:border-rose-700 font-mono text-[10.5px] font-black text-rose-300 hover:text-white rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1"
                id="btn_fail_aar"
              >
                <span>📊 VIEW AAR</span>
              </button>

              <button
                onClick={handleLevelRestart}
                className="flex-[1.2] py-3 px-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 font-mono text-[10.5px] font-black text-white rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1 uppercase font-bold"
                id="btn_fail_retry"
              >
                <span>RETRY</span>
                <RefreshCcw size={12} className="animate-spin-slow" />
              </button>
            </div>
          </div>
        )}
          </>
        )}

        {/* ADMOB SPONSOR AD OVERLAY POPUP */}
        {adPlaying && (
          <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
            <div className="p-4 bg-slate-900 border border-yellow-500/50 rounded-2xl max-w-sm w-full relative overflow-hidden flex flex-col items-center shadow-2xl">
              <div className="absolute inset-0 bg-radial-at-t from-yellow-500/5 to-transparent pointer-events-none" />
              
              <span className="text-yellow-400 font-bold tracking-widest text-[8px] border border-yellow-500/30 px-2 py-0.5 rounded bg-yellow-950/20 mb-3 uppercase animate-pulse">
                AdMob Sponsor Stream
              </span>

              <div className="w-14 h-14 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin flex items-center justify-center text-lg font-black text-white bg-slate-950 my-3">
                {adCountdown}
              </div>

              <h3 className="text-xs font-black text-white uppercase mt-2">
                REWARD SECURING WAVE...
              </h3>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                {adMessage}
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900/80 mt-4 text-left w-full">
                <span className="text-[8px] font-bold text-cyan-400 block mb-1 uppercase tracking-wider">⚡ MATHEMATICAL LAW:</span>
                <p className="text-[9px] text-slate-400 leading-normal font-sans">
                  Multiplying soldiers exponentially outperforms standard addition when monster waves exceed 30 armor points. Target multiplication and exponents first!
                </p>
              </div>

              <span className="text-[7.5px] text-slate-600 mt-4 uppercase">
                Ad closes automatically in {adCountdown}s
              </span>
            </div>
          </div>
        )}

        {/* TOAST NOTIFIER BANNER */}
        {appNotification && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900 border-2 border-indigo-505 border-indigo-500 rounded-xl p-3.5 shadow-xl shadow-black z-50 animate-float-card flex items-start space-x-2 w-auto select-none pointer-events-none">
            <span className="text-sm">🔔</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-[9.5px] font-black font-mono text-indigo-400 uppercase tracking-wider">
                {appNotification.title}
              </h4>
              <p className="text-[9px] text-slate-300 leading-normal font-sans mt-0.5">
                {appNotification.body}
              </p>
            </div>
          </div>
        )}

        {/* SETTINGS CALIBRATION MODAL OVERLAY */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          volume={volume}
          setVolume={setVolume}
          selectedPalette={selectedPaletteId}
          setSelectedPalette={setSelectedPaletteId}
          is3DMode={is3DMode}
          setIs3DMode={setIs3DMode}
          is256BitGraphics={is256BitGraphics}
          setIs256BitGraphics={setIs256BitGraphics}
          isMusicEnabled={isMusicEnabled}
          setIsMusicEnabled={setIsMusicEnabled}
          isSFXEnabled={isSFXEnabled}
          setIsSFXEnabled={setIsSFXEnabled}
        />

      </div>
    </div>
  );
}
