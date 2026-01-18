// Tier hierarchy utility for booking eligibility checks

export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

// Tier hierarchy: BRONZE (lowest) -> SILVER -> GOLD -> PLATINUM (highest)
const TIER_ORDER: Record<LoyaltyTier, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

/**
 * Check if a user's tier meets or exceeds the minimum required tier
 * @param userTier - The user's current tier (can be null/undefined)
 * @param minTier - The minimum tier required for the event
 * @returns true if user can book, false otherwise
 */
export function canUserBookEvent(
  userTier: LoyaltyTier | null | undefined,
  minTier: LoyaltyTier
): boolean {
  // If user has no tier, they can only book BRONZE events
  if (!userTier) {
    return minTier === "BRONZE";
  }

  return TIER_ORDER[userTier] >= TIER_ORDER[minTier];
}

/**
 * Get tier display name with proper casing
 */
export function getTierDisplayName(tier: LoyaltyTier): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

/**
 * Get the tier level (1-4) for comparison
 */
export function getTierLevel(tier: LoyaltyTier): number {
  return TIER_ORDER[tier];
}

/**
 * Get all tiers that a user can access based on their tier
 */
export function getAccessibleTiers(userTier: LoyaltyTier | null | undefined): LoyaltyTier[] {
  if (!userTier) return ["BRONZE"];
  
  const userLevel = TIER_ORDER[userTier];
  return (Object.entries(TIER_ORDER) as [LoyaltyTier, number][])
    .filter(([, level]) => level <= userLevel)
    .map(([tier]) => tier);
}

/**
 * Get the tier color classes for display
 */
export function getTierColorClasses(tier: LoyaltyTier): string {
  switch (tier) {
    case "BRONZE":
      return "bg-amber-100 text-amber-800";
    case "SILVER":
      return "bg-slate-100 text-slate-700";
    case "GOLD":
      return "bg-yellow-100 text-yellow-800";
    case "PLATINUM":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
