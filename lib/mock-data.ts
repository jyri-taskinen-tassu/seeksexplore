/**
 * Mock data for Provider Product Management
 */

import type { ProductDraft } from "./types";

export const MOCK_AI_DRAFT_SNOWMOBILE: ProductDraft = {
  title: "Snowmobile Safari – Sport & Touring",
  categoryMain: "Outdoor",
  categorySub: "Snowmobile",
  locationName: "Tahko",
  address: "Tahkomäentie 100, 73310 Tahkovuori",
  durationMinutes: 120,
  priceFrom: 149,
  currency: "EUR",
  capacityMode: "per_resource",
  capacityMax: 12,
  meetingPoint: "Safari house, 10 min before start",
  language: ["FI", "EN"],
  included: "Guide, helmet, warm overalls, fuel",
  notIncluded: "Meals, transport to Tahko",
  requirements: "Driving license required for driver. Minimum age 18 for driving.",
  cancellationPolicyTemplate: "Standard",
  coverImageNote: "Add a cover image (required) — upload after draft creation.",
  availabilityRule: "Fixed departures + on request (later). Start with fixed times.",
  resourcesNote: "Uses snowmobiles by variant (Sport 1-seat / Touring 2-seat). Mark units out-of-service when needed.",
  description: "Experience the thrill of snowmobiling through pristine winter landscapes. Choose between solo Sport (1-seat) or shared Touring (2-seat) options. Professional guide included.",
  requiresResources: true,
  resourceType: "snowmobiles",
  snowmobiles: {
    sport: { total: 5, outOfService: 0 },
    touring: { total: 5, outOfService: 0 },
  },
  guidesPerDeparture: 1,
  pricingOptions: [
    { id: "solo", name: "Solo rider (Sport)", price: 149 },
    { id: "shared", name: "Shared rider (Touring)", price: 199 },
  ],
  exampleBooking: {
    solo: 2,
    shared: 1,
  },
};

export const MOCK_AI_DRAFT_HIKING: ProductDraft = {
  title: "Guided Hiking Tour – Nuuksio National Park",
  categoryMain: "Outdoor",
  categorySub: "Hiking",
  locationName: "Nuuksio",
  address: "Nuuksiontie 84, 02820 Espoo",
  durationMinutes: 240,
  priceFrom: 65,
  currency: "EUR",
  capacityMode: "per_departure",
  capacityMax: 12,
  meetingPoint: "Nuuksio National Park visitor center",
  language: ["FI", "EN"],
  included: "Professional guide, route map, safety briefing",
  notIncluded: "Transportation, meals, equipment rental",
  requirements: "Good physical condition, suitable hiking shoes, weather-appropriate clothing",
  cancellationPolicyTemplate: "Flexible",
  coverImageNote: "Add a cover image (required) — upload after draft creation.",
  availabilityRule: "Fixed departures (MVP) — you can add times after publishing.",
  resourcesNote: "No equipment required. Guide provided.",
  description: "Explore the beautiful trails of Nuuksio National Park with an experienced guide. Suitable for all fitness levels. Discover local flora and fauna while enjoying the peaceful Nordic nature.",
  requiresResources: false,
  resourceType: undefined,
  snowmobiles: undefined,
  guidesPerDeparture: 1,
  pricingOptions: [
    { id: "adult", name: "Adult", price: 65 },
    { id: "child", name: "Child (under 12)", price: 35 },
  ],
  exampleBooking: {
    adult: 3,
    child: 1,
  },
};
