import { supabase } from './authService';
import { DAILY_FREE_QUESTS, PREMIUM_FEATURES } from '../config/monetization';

export interface UserSubscription {
  tier: 'free' | 'premium';
  expiresAt: string | null;
  coins: number;
}

export interface DailyUsage {
  questionsUsed: number;
  lastResetDate: string;
}

const USAGE_KEY = 'quiz_daily_usage';
const COINS_KEY = 'quiz_coins';

class MonetizationService {
  async getSubscription(userId: string): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return { tier: 'free', expiresAt: null, coins: 0 };
      }

      return {
        tier: data.tier,
        expiresAt: data.expires_at,
        coins: data.coins,
      };
    } catch {
      return { tier: 'free', expiresAt: null, coins: 0 };
    }
  }

  canPlayFreeGame(): boolean {
    const usage = this.getDailyUsage();
    return usage.questionsUsed < DAILY_FREE_QUESTS;
  }

  getDailyUsage(): DailyUsage {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(USAGE_KEY);

    if (saved) {
      try {
        const usage: DailyUsage = JSON.parse(saved);
        if (usage.lastResetDate !== today) {
          return { questionsUsed: 0, lastResetDate: today };
        }
        return usage;
      } catch {
        return { questionsUsed: 0, lastResetDate: today };
      }
    }

    return { questionsUsed: 0, lastResetDate: today };
  }

  incrementUsage(): void {
    const usage = this.getDailyUsage();
    usage.questionsUsed += 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  }

  getCoins(): number {
    const saved = localStorage.getItem(COINS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  }

  async spendCoins(userId: string, amount: number): Promise<boolean> {
    const coins = this.getCoins();
    if (coins < amount) return false;

    const newCoins = coins - amount;
    localStorage.setItem(COINS_KEY, newCoins.toString());

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      coins: newCoins,
    }, { onConflict: 'user_id' });

    return true;
  }

  async addCoins(userId: string, amount: number): Promise<void> {
    const current = this.getCoins();
    const newCoins = current + amount;
    localStorage.setItem(COINS_KEY, newCoins.toString());

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      coins: newCoins,
    }, { onConflict: 'user_id', ignoreDuplicates: false });
  }

  hasFeature(feature: string): boolean {
    const sub = localStorage.getItem('quiz_subscription');
    if (!sub) return PREMIUM_FEATURES.includes(feature as typeof PREMIUM_FEATURES[number]);

    try {
      const subscription = JSON.parse(sub);
      return subscription.tier === 'premium';
    } catch {
      return false;
    }
  }

  async subscribe(userId: string, tier: 'premium_monthly' | 'premium_yearly'): Promise<void> {
    const expiresAt = new Date();
    if (tier === 'premium_monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      tier: 'premium',
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'user_id' });

    localStorage.setItem('quiz_subscription', JSON.stringify({
      tier: 'premium',
      expiresAt: expiresAt.toISOString(),
    }));
  }

  async cancelSubscription(userId: string): Promise<void> {
    await supabase.from('subscriptions').update({
      tier: 'free',
      expires_at: null,
    }).eq('user_id', userId);

    localStorage.removeItem('quiz_subscription');
  }
}

export const MONETIZATION_SERVICE = new MonetizationService();