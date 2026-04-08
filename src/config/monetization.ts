export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export interface IAPProduct {
  id: string;
  name: string;
  coins: number;
  bonus: number;
  price: number;
  icon: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 4.99,
    interval: 'month',
    features: [
      'Questions illimitées',
      'Tous les modes de jeu',
      'Pas de publicité',
      'Badges exclusifs',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    id: 'premium_yearly',
    name: 'Premium',
    price: 39.99,
    interval: 'year',
    features: [
      'Tous les avantages Premium',
      'Économie de 33%',
      '300 coins bonus',
      'Badge "Premium Éternel"',
    ],
  },
];

export const IAP_PRODUCTS: IAPProduct[] = [
  { id: 'coins_100', name: 'Petite Pochette', coins: 100, bonus: 0, price: 0.99, icon: '🪙' },
  { id: 'coins_500', name: 'Pochette', coins: 500, bonus: 50, price: 2.99, icon: '🪙' },
  { id: 'coins_1500', name: 'Grand Sac', coins: 1500, bonus: 200, price: 6.99, icon: '💰' },
  { id: 'coins_5000', name: 'Coffre', coins: 5000, bonus: 1000, price: 19.99, icon: '🏆' },
];

export const POWER_UPS = [
  { id: 'skip', name: 'Passer', coins: 50, description: 'Passe une question difficile' },
  { id: 'hint', name: 'Indice', coins: 30, description: 'Élimine 2 mauvaises réponses' },
  { id: 'double', name: 'Double', coins: 75, description: 'Score x2 pour la prochaine réponse' },
  { id: 'freeze', name: 'Gel', coins: 100, description: 'Gèle les bots pendant 1 tour' },
] as const;

export const DAILY_FREE_QUESTS = 10;

export const PREMIUM_FEATURES = [
  'unlimited_questions',
  'all_modes',
  'no_ads',
  'exclusive_badges',
  'priority_support',
  'custom_avatar',
  'analytics',
] as const;