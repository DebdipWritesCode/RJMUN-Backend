import {
  EARLY_BIRD_ENDS_AT,
  getRegistrationPricing,
  isLegacyEarlyBirdCoupon,
} from './registration-pricing';

describe('registration pricing', () => {
  it('uses early-bird prices immediately before the cutoff', () => {
    const pricing = getRegistrationPricing(
      new Date('2026-08-17T23:59:59.999+05:30'),
    );

    expect(pricing).toMatchObject({
      phase: 'early_bird',
      munAmount: 1000,
      festDayAmount: 400,
    });
    expect(pricing.earlyBirdEndsAt).toBe(
      new Date(EARLY_BIRD_ENDS_AT).toISOString(),
    );
  });

  it('switches to regular prices exactly at the cutoff', () => {
    expect(getRegistrationPricing(new Date(EARLY_BIRD_ENDS_AT))).toMatchObject({
      phase: 'regular',
      munAmount: 1200,
      festDayAmount: 500,
    });
  });

  it('recognizes obsolete early-bird coupon codes case-insensitively', () => {
    expect(isLegacyEarlyBirdCoupon('earlybird100')).toBe(true);
    expect(isLegacyEarlyBirdCoupon(' EARLYBIRDFEST100 ')).toBe(true);
    expect(isLegacyEarlyBirdCoupon('SCHOOLPARTNER')).toBe(false);
  });
});
