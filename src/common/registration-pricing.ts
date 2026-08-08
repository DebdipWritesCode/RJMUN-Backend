export const EARLY_BIRD_ENDS_AT = '2026-08-18T00:00:00+05:30';

export const REGISTRATION_PRICES = {
  mun: {
    earlyBird: 1000,
    regular: 1200,
  },
  festPerDay: {
    earlyBird: 400,
    regular: 500,
  },
} as const;

export type PricingPhase = 'early_bird' | 'regular';

export interface RegistrationPricing {
  phase: PricingPhase;
  earlyBirdEndsAt: string;
  munAmount: number;
  festDayAmount: number;
}

export function getRegistrationPricing(
  now: Date = new Date(),
): RegistrationPricing {
  const isEarlyBird = now.getTime() < new Date(EARLY_BIRD_ENDS_AT).getTime();

  return {
    phase: isEarlyBird ? 'early_bird' : 'regular',
    earlyBirdEndsAt: new Date(EARLY_BIRD_ENDS_AT).toISOString(),
    munAmount: isEarlyBird
      ? REGISTRATION_PRICES.mun.earlyBird
      : REGISTRATION_PRICES.mun.regular,
    festDayAmount: isEarlyBird
      ? REGISTRATION_PRICES.festPerDay.earlyBird
      : REGISTRATION_PRICES.festPerDay.regular,
  };
}

export function isLegacyEarlyBirdCoupon(couponCode?: string): boolean {
  const normalized = couponCode?.trim().toUpperCase();
  return normalized === 'EARLYBIRD100' || normalized === 'EARLYBIRDFEST100';
}
