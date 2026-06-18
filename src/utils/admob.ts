/**
 * AdMob Integration Utility and Configuration Guide
 * Supports both Capacitor (@capacitor-community/admob) for native iOS/Android builds
 * and an interactive web preview mock so students can test reward flows seamlessly.
 */

import { sound } from './audio';

export interface AdMobConfig {
  appIdAndroid: string;
  appIdIos: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
}

// Default Google AdMob Test Ad Units
export const ADMOB_TEST_CONFIG: AdMobConfig = {
  appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
  appIdIos: 'ca-app-pub-3940256099942544~1458002511',
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
};

class AdMobService {
  private config: AdMobConfig = ADMOB_TEST_CONFIG;
  private isCapacitorActive: boolean = false;
  private currentAdResolve: ((rewarded: boolean) => void) | null = null;

  constructor() {
    // Detect if we are running in a native Capacitor shell
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      this.isCapacitorActive = true;
    }
  }

  /**
   * Initializes AdMob SDK inside Capacitor native runtime.
   */
  public async initialize(): Promise<void> {
    if (!this.isCapacitorActive) {
      console.log('AdMob: Running in Web Mode. Interactive mock will handle ad requests.');
      return;
    }

    try {
      const { AdMob } = require('@capacitor-community/admob');
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: [],
        initializeForTesting: true,
      });
      console.log('AdMob Service initialized successfully on native container.');
    } catch (err) {
      console.error('Failed to initialize Capacitor AdMob. Falling back to web.', err);
    }
  }

  /**
   * Shows a reward-bearing ad.
   * If on Web / Dev Previews, triggers a callback to launch a beautiful pixel-themed ad modal in HUD.
   * If on Native Mobile, calls standard Capacitor AdMob Rewarded SDK.
   */
  public async showRewardedAd(
    onRewardEarned: () => void,
    onVideoTriggerOverlay: (triggerTimer: number, onComplete: () => void) => void
  ): Promise<boolean> {
    sound.playCoin();

    // Fallback: Web Mock Player (super engaging and fits visual theme perfectly!)
    if (!this.isCapacitorActive) {
      return new Promise<boolean>((resolve) => {
        // Trigger a 3.5s custom game-universe simulation ad!
        onVideoTriggerOverlay(4, () => {
          onRewardEarned();
          sound.playVictory();
          resolve(true);
        });
      });
    }

    // Native integration pathway
    try {
      const { AdMob, RewardItem } = require('@capacitor-community/admob');
      
      // Prepare rewarded listeners
      await AdMob.addListener('onRewardedVideoAdReward', (info: any) => {
        console.log('Rewarded Ad Action: success!', info);
        onRewardEarned();
      });

      await AdMob.prepareRewardVideoAd({
        adId: this.config.rewardedAdUnitId,
      });

      await AdMob.showRewardVideoAd();
      return true;
    } catch (err) {
      console.warn('Native AdMob Rewarded failure, playing backup simulation', err);
      // fallback to visual simulation
      onVideoTriggerOverlay(4, () => {
        onRewardEarned();
        sound.playVictory();
      });
      return true;
    }
  }

  /**
   * Set custom production AdMob credentials.
   */
  public configure(newConfig: Partial<AdMobConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const admob = new AdMobService();
