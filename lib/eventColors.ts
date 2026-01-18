// Shared event color utility for consistent styling across participant and staff views

export type CategoryKey = "workshops" | "counseling" | "community" | "volunteering" | "default";

export type CategoryColors = {
  color: string;      // Background and text color classes
  dotColor: string;   // Dot/indicator color class
  borderColor: string; // Border color class
};

export const CATEGORY_COLORS: Record<CategoryKey, CategoryColors> = {
  workshops: {
    color: "bg-orange-100 text-orange-700",
    dotColor: "bg-orange-500",
    borderColor: "border-orange-200",
  },
  counseling: {
    color: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-500",
    borderColor: "border-blue-200",
  },
  community: {
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
    borderColor: "border-green-200",
  },
  volunteering: {
    color: "bg-purple-100 text-purple-700",
    dotColor: "bg-purple-500",
    borderColor: "border-purple-200",
  },
  default: {
    color: "bg-gray-100 text-gray-700",
    dotColor: "bg-gray-500",
    borderColor: "border-gray-200",
  },
};

/**
 * Determines the category of an event based on its name keywords
 */
export function getCategoryFromName(eventName: string): CategoryKey {
  const name = eventName.toLowerCase();
  
  if (name.includes("workshop")) return "workshops";
  if (name.includes("counseling") || name.includes("session")) return "counseling";
  if (name.includes("community") || name.includes("park")) return "community";
  if (name.includes("volunteer")) return "volunteering";
  
  return "default";
}

/**
 * Gets the full color classes for an event based on its name
 * Returns: "bg-xxx-100 text-xxx-700 border-xxx-200"
 */
export function getEventColorClasses(eventName: string): string {
  const category = getCategoryFromName(eventName);
  const colors = CATEGORY_COLORS[category];
  return `${colors.color} ${colors.borderColor}`;
}

/**
 * Gets just the dot/indicator color for calendar views
 */
export function getEventDotColor(eventName: string): string {
  const category = getCategoryFromName(eventName);
  return CATEGORY_COLORS[category].dotColor;
}

/**
 * Gets the category colors object for an event
 */
export function getEventColors(eventName: string): CategoryColors {
  const category = getCategoryFromName(eventName);
  return CATEGORY_COLORS[category];
}
