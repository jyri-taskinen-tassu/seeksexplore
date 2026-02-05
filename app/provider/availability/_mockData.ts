/**
 * Mock data module for Provider Availability
 * Single source of truth for all availability data
 */

export type DepartureType = "fixed" | "on_request";

export type SnowmobileVariant = "sport1" | "sport2" | "touring1" | "touring2";
export type EbikeSize = "S" | "M" | "L" | "XL" | "XXL";

export type DepartureResources = {
  snowmobiles?: Partial<Record<SnowmobileVariant, number>>;
  ebikes?: Partial<Record<EbikeSize, number>>;
  guides?: number;
};

export type MockDeparture = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  title: string;
  type: DepartureType;
  guestsBooked: number;
  guestsCapacity: number;
  resources: DepartureResources;
  notes?: string;
};

/**
 * Inventory configuration (MVP)
 */
export const INVENTORY = {
  snowmobiles: {
    sport1: 8, // 1-seat sport
    sport2: 6, // 2-seat sport
    touring1: 4, // 1-seat touring
    touring2: 10, // 2-seat touring
  },
  ebikes: {
    S: 3,
    M: 5,
    L: 6,
    XL: 4,
    XXL: 2,
  },
  guides: 12,
} as const;

/**
 * E-bike buffer rule: 3 hours between bookings
 */
export const EBIKE_BUFFER_HOURS = 3;

/**
 * Mock departures data (2-3 weeks)
 */
const MOCK_DEPARTURES: MockDeparture[] = [
  // January 6, 2025 (Monday)
  {
    id: "d1",
    date: "2025-01-06",
    startTime: "10:00",
    title: "Snowmobile Safari (Sport)",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      snowmobiles: { sport2: 2, sport1: 2 },
      guides: 1,
    },
  },
  {
    id: "d2",
    date: "2025-01-06",
    startTime: "12:00",
    title: "City Walk (English)",
    type: "fixed",
    guestsBooked: 2,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
    notes: "Low fill",
  },
  {
    id: "d3",
    date: "2025-01-06",
    startTime: "14:00",
    title: "E-bike Tour",
    type: "fixed",
    guestsBooked: 6,
    guestsCapacity: 6,
    resources: {
      ebikes: { L: 3, M: 2, S: 1 },
      guides: 1,
    },
    notes: "Conflict: size L exceeds availability",
  },
  {
    id: "d4",
    date: "2025-01-06",
    startTime: "16:00",
    title: "Snowmobile Safari (Touring)",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 10,
    resources: {
      snowmobiles: { touring2: 2, touring1: 2 },
      guides: 1,
    },
  },
  {
    id: "d5",
    date: "2025-01-06",
    startTime: "18:00",
    title: "Food Market Experience",
    type: "fixed",
    guestsBooked: 14,
    guestsCapacity: 16,
    resources: {
      guides: 1,
    },
  },
  {
    id: "d6",
    date: "2025-01-06",
    startTime: "19:30",
    title: "Reindeer Sleigh Ride",
    type: "fixed",
    guestsBooked: 2,
    guestsCapacity: 8,
    resources: {
      guides: 1,
    },
  },

  // January 7, 2025 (Tuesday)
  {
    id: "d7",
    date: "2025-01-07",
    startTime: "20:00",
    title: "Northern Lights Tour",
    type: "fixed",
    guestsBooked: 12,
    guestsCapacity: 15,
    resources: {
      guides: 2,
    },
  },

  // January 8, 2025 (Wednesday)
  {
    id: "d8a",
    date: "2025-01-08",
    startTime: "10:00",
    title: "Snowmobile Safari (Touring)",
    type: "fixed",
    guestsBooked: 18,
    guestsCapacity: 20,
    resources: {
      snowmobiles: { touring2: 4, touring1: 2 },
      guides: 1,
    },
    notes: "Near cap",
  },
  {
    id: "d8b",
    date: "2025-01-08",
    startTime: "13:00",
    title: "Snowshoe Hike",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
  },
  {
    id: "d8c",
    date: "2025-01-08",
    startTime: "15:00",
    title: "E-bike Tour",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      ebikes: { L: 4, M: 2, XL: 2 },
      guides: 1,
    },
  },

  // January 9, 2025 (Thursday)
  {
    id: "d9a",
    date: "2025-01-09",
    startTime: "09:00",
    title: "Ice Fishing Experience",
    type: "fixed",
    guestsBooked: 6,
    guestsCapacity: 8,
    resources: {
      guides: 1,
    },
  },
  {
    id: "d9b",
    date: "2025-01-09",
    startTime: "14:00",
    title: "Husky Safari",
    type: "fixed",
    guestsBooked: 16,
    guestsCapacity: 16,
    resources: {
      guides: 2,
    },
  },

  // January 10, 2025 (Friday)
  {
    id: "d10a",
    date: "2025-01-10",
    startTime: "10:00",
    title: "Snowmobile Safari (Sport)",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      snowmobiles: { sport2: 2, sport1: 2 },
      guides: 1,
    },
  },
  {
    id: "d10b",
    date: "2025-01-10",
    startTime: "19:00",
    title: "Aurora Photography Tour",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      guides: 1,
    },
    notes: "Weather dependent",
  },

  // January 11, 2025 (Saturday)
  {
    id: "d11a",
    date: "2025-01-11",
    startTime: "10:00",
    title: "Cross-Country Skiing",
    type: "fixed",
    guestsBooked: 4,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
    notes: "Low fill",
  },
  {
    id: "d11b",
    date: "2025-01-11",
    startTime: "16:00",
    title: "Sauna & Ice Swimming",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
  },

  // January 12, 2025 (Sunday)
  {
    id: "d12a",
    date: "2025-01-12",
    startTime: "11:00",
    title: "Reindeer Farm Visit",
    type: "fixed",
    guestsBooked: 20,
    guestsCapacity: 20,
    resources: {
      guides: 2,
    },
  },
  {
    id: "d12b",
    date: "2025-01-12",
    startTime: "14:00",
    title: "Snowmobile Safari (Touring)",
    type: "fixed",
    guestsBooked: 12,
    guestsCapacity: 12,
    resources: {
      snowmobiles: { touring2: 3, touring1: 1 },
      guides: 1,
    },
  },
  {
    id: "d12c",
    date: "2025-01-12",
    startTime: "18:00",
    title: "Evening Sauna Experience",
    type: "fixed",
    guestsBooked: 6,
    guestsCapacity: 8,
    resources: {
      guides: 1,
    },
  },

  // January 13, 2025 (Monday)
  {
    id: "d13a",
    date: "2025-01-13",
    startTime: "09:00",
    title: "E-bike Tour",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 10,
    resources: {
      ebikes: { L: 4, M: 3, XL: 2, S: 1 },
      guides: 1,
    },
  },
  {
    id: "d13b",
    date: "2025-01-13",
    startTime: "13:00",
    title: "Snowmobile Safari (Sport)",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 10,
    resources: {
      snowmobiles: { sport2: 3, sport1: 2 },
      guides: 1,
    },
  },

  // January 14, 2025 (Tuesday)
  {
    id: "d14a",
    date: "2025-01-14",
    startTime: "10:00",
    title: "Snowmobile Safari (Touring)",
    type: "fixed",
    guestsBooked: 20,
    guestsCapacity: 20,
    resources: {
      snowmobiles: { touring2: 5, touring1: 3 },
      guides: 1,
    },
    notes: "Over capacity: SM used exceeds inventory",
  },
  {
    id: "d14b",
    date: "2025-01-14",
    startTime: "14:00",
    title: "E-bike Tour",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      ebikes: { L: 5, M: 2, XL: 1 },
      guides: 1,
    },
  },

  // January 15, 2025 (Wednesday)
  {
    id: "d15a",
    date: "2025-01-15",
    startTime: "09:00",
    title: "Husky Safari",
    type: "fixed",
    guestsBooked: 12,
    guestsCapacity: 16,
    resources: {
      guides: 2,
    },
  },
  {
    id: "d15b",
    date: "2025-01-15",
    startTime: "14:00",
    title: "Snowmobile Safari (Sport)",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      snowmobiles: { sport2: 2, sport1: 2 },
      guides: 1,
    },
  },
  {
    id: "d15c",
    date: "2025-01-15",
    startTime: "17:00",
    title: "Northern Lights Tour",
    type: "fixed",
    guestsBooked: 15,
    guestsCapacity: 15,
    resources: {
      guides: 2,
    },
  },

  // January 16, 2025 (Thursday)
  {
    id: "d16a",
    date: "2025-01-16",
    startTime: "10:00",
    title: "E-bike Tour",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 10,
    resources: {
      ebikes: { M: 4, L: 3, S: 1 },
      guides: 1,
    },
  },
  {
    id: "d16b",
    date: "2025-01-16",
    startTime: "13:00",
    title: "Snowshoe Hike",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
  },
  {
    id: "d16c",
    date: "2025-01-16",
    startTime: "16:00",
    title: "Ice Fishing Experience",
    type: "fixed",
    guestsBooked: 6,
    guestsCapacity: 8,
    resources: {
      guides: 1,
    },
  },

  // January 17, 2025 (Friday)
  {
    id: "d17a",
    date: "2025-01-17",
    startTime: "09:00",
    title: "Snowmobile Safari (Touring)",
    type: "fixed",
    guestsBooked: 16,
    guestsCapacity: 20,
    resources: {
      snowmobiles: { touring2: 4, touring1: 2 },
      guides: 1,
    },
  },
  {
    id: "d17b",
    date: "2025-01-17",
    startTime: "12:00",
    title: "City Walk (Finnish)",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
  },
  {
    id: "d17c",
    date: "2025-01-17",
    startTime: "19:00",
    title: "Aurora Photography Tour",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 10,
    resources: {
      guides: 1,
    },
  },

  // January 18, 2025 (Saturday)
  {
    id: "d18a",
    date: "2025-01-18",
    startTime: "10:00",
    title: "E-bike Tour",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 10,
    resources: {
      ebikes: { L: 4, M: 3, XL: 2, S: 1 },
      guides: 1,
    },
  },
  {
    id: "d18b",
    date: "2025-01-18",
    startTime: "14:00",
    title: "Reindeer Farm Visit",
    type: "fixed",
    guestsBooked: 18,
    guestsCapacity: 20,
    resources: {
      guides: 2,
    },
  },
  {
    id: "d18c",
    date: "2025-01-18",
    startTime: "17:00",
    title: "Sauna & Ice Swimming",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
  },

  // January 19, 2025 (Sunday)
  {
    id: "d19a",
    date: "2025-01-19",
    startTime: "11:00",
    title: "Snowmobile Safari (Sport)",
    type: "fixed",
    guestsBooked: 10,
    guestsCapacity: 10,
    resources: {
      snowmobiles: { sport2: 3, sport1: 2 },
      guides: 1,
    },
  },
  {
    id: "d19b",
    date: "2025-01-19",
    startTime: "15:00",
    title: "Cross-Country Skiing",
    type: "fixed",
    guestsBooked: 6,
    guestsCapacity: 12,
    resources: {
      guides: 1,
    },
    notes: "Low fill",
  },
  {
    id: "d19c",
    date: "2025-01-19",
    startTime: "18:00",
    title: "Evening Sauna Experience",
    type: "fixed",
    guestsBooked: 8,
    guestsCapacity: 8,
    resources: {
      guides: 1,
    },
  },
];

/**
 * Get all departures for a specific date
 */
export function getDeparturesByDate(date: string): MockDeparture[] {
  return MOCK_DEPARTURES.filter((d) => d.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Get week dates (Monday to Sunday) for a given anchor date
 */
export function getWeekDates(anchorDate: Date): string[] {
  const dayOfWeek = (anchorDate.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - dayOfWeek);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

/**
 * Get all departures for a week (Monday to Sunday)
 */
export function getDeparturesByWeek(anchorDate: Date): Map<string, MockDeparture[]> {
  const weekDates = getWeekDates(anchorDate);
  const result = new Map<string, MockDeparture[]>();

  for (const date of weekDates) {
    result.set(date, getDeparturesByDate(date));
  }

  return result;
}

/**
 * Aggregate resources from departures for a day
 */
export type AggregatedResources = {
  snowmobiles: Partial<Record<SnowmobileVariant, { used: number; cap: number }>>;
  ebikes: Partial<Record<EbikeSize, { used: number; cap: number }>>;
  guides: { used: number; cap: number };
};

export function aggregateDayResources(departures: MockDeparture[]): AggregatedResources {
  const agg: AggregatedResources = {
    snowmobiles: {},
    ebikes: {},
    guides: { used: 0, cap: INVENTORY.guides },
  };

  for (const dep of departures) {
    // Aggregate snowmobiles
    if (dep.resources.snowmobiles) {
      for (const [variant, count] of Object.entries(dep.resources.snowmobiles)) {
        const v = variant as SnowmobileVariant;
        if (!agg.snowmobiles[v]) {
          agg.snowmobiles[v] = { used: 0, cap: INVENTORY.snowmobiles[v] };
        }
        agg.snowmobiles[v]!.used += count || 0;
      }
    }

    // Aggregate e-bikes
    if (dep.resources.ebikes) {
      for (const [size, count] of Object.entries(dep.resources.ebikes)) {
        const s = size as EbikeSize;
        if (!agg.ebikes[s]) {
          agg.ebikes[s] = { used: 0, cap: INVENTORY.ebikes[s] };
        }
        agg.ebikes[s]!.used += count || 0;
      }
    }

    // Aggregate guides
    if (dep.resources.guides) {
      agg.guides.used += dep.resources.guides;
    }
  }

  return agg;
}

/**
 * Check for resource conflicts (used > cap)
 */
export function checkResourceConflicts(agg: AggregatedResources): string[] {
  const conflicts: string[] = [];

  // Check snowmobiles
  for (const [variant, data] of Object.entries(agg.snowmobiles)) {
    if (data && data.used > data.cap) {
      conflicts.push(`Snowmobile ${variant}: ${data.used}/${data.cap}`);
    }
  }

  // Check e-bikes
  for (const [size, data] of Object.entries(agg.ebikes)) {
    if (data && data.used > data.cap) {
      conflicts.push(`E-bike size ${size}: ${data.used}/${data.cap}`);
    }
  }

  // Check guides
  if (agg.guides.used > agg.guides.cap) {
    conflicts.push(`Guides: ${agg.guides.used}/${agg.guides.cap}`);
  }

  return conflicts;
}

/**
 * Day summary for calendar cells
 */
export type DaySummary = {
  date: string;
  departuresCount: number;
  guestsBooked: number;
  guestsCapacity: number;
  resources: AggregatedResources;
  conflicts: string[];
};

export function getDaySummary(date: string): DaySummary {
  const departures = getDeparturesByDate(date);
  const resources = aggregateDayResources(departures);
  const conflicts = checkResourceConflicts(resources);

  return {
    date,
    departuresCount: departures.length,
    guestsBooked: departures.reduce((sum, d) => sum + d.guestsBooked, 0),
    guestsCapacity: departures.reduce((sum, d) => sum + d.guestsCapacity, 0),
    resources,
    conflicts,
  };
}

/**
 * Calculate end time with buffer for e-bike departures
 */
export function getEndTimeWithBuffer(startTime: string, hasEbikes: boolean): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const duration = 2.5; // Default 2.5 hours
  const buffer = hasEbikes ? EBIKE_BUFFER_HOURS : 0;
  const totalHours = hours + duration + buffer;

  const endHours = Math.floor(totalHours);
  const endMinutes = Math.floor((totalHours - endHours) * 60);
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}
