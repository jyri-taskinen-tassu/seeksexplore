/**
 * Type definitions for Provider Product Management
 */

export type SnowmobileVariant = "sport" | "touring";
export type ResourceType = "snowmobile" | "guide";

export type CustomerType = {
  id: string;
  name: string;
  price: number;
  consumesResource: ResourceType;
  variant?: SnowmobileVariant;
};

export type ProductDraft = {
  title: string;
  categoryMain: "Outdoor" | "Indoor" | "";
  categorySub: string;
  locationName: string;
  address: string;
  durationMinutes: number | null;
  priceFrom: number | null;
  currency: "EUR" | "SEK" | "NOK" | "DKK";
  capacityMode: "per_departure" | "per_resource";
  capacityMax: number | null;
  meetingPoint: string;
  language: string[];
  included: string;
  notIncluded: string;
  requirements: string;
  cancellationPolicyTemplate: "Flexible" | "Standard" | "Strict" | "";
  coverImageNote: string;
  availabilityRule: string;
  resourcesNote: string;
  description: string;
  
  // Resources (optional)
  requiresResources: boolean;
  resourceType?: "snowmobiles" | "ebikes" | "guides_only" | "other";
  snowmobiles?: {
    sport: { total: number; outOfService: number };
    touring: { total: number; outOfService: number };
  };
  ebikes?: {
    sizes: Record<"S" | "M" | "L" | "XL" | "XXL", { total: number; outOfService: number }>;
  };
  guidesPerDeparture?: number;
  
  // Pricing options
  pricingOptions?: Array<{ id: string; name: string; price: number }>;
  exampleBooking?: Record<string, number>;
};

export type ResourceAllocation = {
  snowmobiles: {
    sport: number;
    touring: number;
  };
  guides: number;
};
