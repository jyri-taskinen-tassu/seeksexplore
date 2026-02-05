/**
 * Analytics Store
 * Provides analytics and reporting data for the provider dashboard
 * In-memory mock data for MVP
 */

export type TimePeriod = "today" | "week" | "month" | "quarter" | "year" | "custom";

export type KPIMetric = {
  label: string;
  value: number;
  change: number; // Percentage change from previous period
  changeLabel: string; // e.g., "vs last month"
  format: "currency" | "number" | "percentage";
  currency?: "EUR" | "SEK" | "NOK" | "DKK";
};

export type RevenueDataPoint = {
  date: string; // YYYY-MM-DD
  revenue: number;
  bookings: number;
  avgBookingValue: number;
};

export type ProductPerformance = {
  productId: string;
  productName: string;
  bookings: number;
  revenue: number;
  occupancyRate: number; // Percentage
  avgRating: number;
  totalGuests: number;
};

export type BookingTrend = {
  date: string;
  bookings: number;
  cancellations: number;
  netBookings: number;
};

export type ResourceUtilization = {
  resourceType: "snowmobiles" | "ebikes" | "guides";
  variant?: string;
  totalUnits: number;
  utilizedUnits: number;
  utilizationRate: number; // Percentage
  revenue: number;
};

export type MessageAnalytics = {
  totalMessages: number;
  unreadCount: number;
  avgResponseTime: number; // Minutes
  byPlatform: {
    email: number;
    whatsapp: number;
    meta: number;
    review: number;
  };
};

export type CustomerAnalytics = {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  avgBookingsPerCustomer: number;
  topCountries: Array<{
    country: string;
    bookings: number;
    revenue: number;
  }>;
};

// Mock data generators
function generateRevenueData(days: number): RevenueDataPoint[] {
  const data: RevenueDataPoint[] = [];
  const today = new Date();
  
  // Seed for consistent but varied data
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Base values with trend (slightly increasing over time)
  const baseRevenueStart = 1800;
  const baseRevenueEnd = 3500;
  const baseBookingsStart = 4;
  const baseBookingsEnd = 18;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    // Progress through the period (0 to 1)
    const progress = (days - 1 - i) / (days - 1);
    
    // Simulate realistic revenue data with trend and weekly pattern
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    
    const baseRevenue = (baseRevenueStart + (baseRevenueEnd - baseRevenueStart) * progress) * weekendBoost;
    const revenueVariation = 0.7 + random() * 0.6; // 70-130% variation
    const revenue = baseRevenue * revenueVariation;
    
    const baseBookings = baseBookingsStart + (baseBookingsEnd - baseBookingsStart) * progress;
    const bookingsVariation = 0.8 + random() * 0.4; // 80-120% variation
    const bookings = Math.floor(baseBookings * bookingsVariation * weekendBoost);
    
    const avgBookingValue = revenue / bookings;
    
    data.push({
      date: dateStr,
      revenue: Math.round(revenue),
      bookings,
      avgBookingValue: Math.round(avgBookingValue * 100) / 100,
    });
  }
  
  return data;
}

function generateBookingTrends(days: number): BookingTrend[] {
  const data: BookingTrend[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    const bookings = Math.floor(8 + Math.random() * 12);
    const cancellations = Math.floor(Math.random() * 3);
    
    data.push({
      date: dateStr,
      bookings,
      cancellations,
      netBookings: bookings - cancellations,
    });
  }
  
  return data;
}

// Store
let kpiMetrics: KPIMetric[] = [];
let revenueData: RevenueDataPoint[] = [];
let productPerformance: ProductPerformance[] = [];
let bookingTrends: BookingTrend[] = [];
let resourceUtilization: ResourceUtilization[] = [];
let messageAnalytics: MessageAnalytics | null = null;
let customerAnalytics: CustomerAnalytics | null = null;

export function seedAnalyticsData() {
  // KPI Metrics (current month vs last month)
  kpiMetrics = [
    {
      label: "Total Revenue",
      value: 125430,
      change: 12.5,
      changeLabel: "vs last month",
      format: "currency",
      currency: "EUR",
    },
    {
      label: "Total Bookings",
      value: 342,
      change: 8.2,
      changeLabel: "vs last month",
      format: "number",
    },
    {
      label: "Average Occupancy",
      value: 78.5,
      change: 5.3,
      changeLabel: "vs last month",
      format: "percentage",
    },
    {
      label: "Average Rating",
      value: 4.6,
      change: 0.2,
      changeLabel: "vs last month",
      format: "number",
    },
    {
      label: "Total Guests",
      value: 1248,
      change: 15.7,
      changeLabel: "vs last month",
      format: "number",
    },
  {
    label: "Cancellation Rate",
    value: 4.2,
    change: -1.8,
    changeLabel: "vs last month",
    format: "percentage",
  },
  {
    label: "Avg. Order Value",
    value: 366.5,
    change: 3.9,
    changeLabel: "vs last month",
    format: "currency",
    currency: "EUR",
  },
  ];

  // Revenue data (generate enough for all periods - 365 days)
  revenueData = generateRevenueData(365);

  // Product performance
  productPerformance = [
    {
      productId: "prod-snowmobile-safari",
      productName: "Snowmobile Safari",
      bookings: 142,
      revenue: 52340,
      occupancyRate: 85.2,
      avgRating: 4.8,
      totalGuests: 568,
    },
    {
      productId: "prod-hiking",
      productName: "Guided Hiking Tour",
      bookings: 98,
      revenue: 6370,
      occupancyRate: 72.1,
      avgRating: 4.5,
      totalGuests: 294,
    },
    {
      productId: "prod-ebike-tour",
      productName: "E-bike Tour",
      bookings: 67,
      revenue: 10050,
      occupancyRate: 91.3,
      avgRating: 4.3,
      totalGuests: 201,
    },
    {
      productId: "prod-sauna",
      productName: "Private Sauna Experience",
      bookings: 35,
      revenue: 5670,
      occupancyRate: 45.8,
      avgRating: 4.9,
      totalGuests: 185,
    },
  ];

  // Booking trends (last 30 days)
  bookingTrends = generateBookingTrends(30);

  // Resource utilization
  resourceUtilization = [
    {
      resourceType: "snowmobiles",
      variant: "Sport",
      totalUnits: 5,
      utilizedUnits: 4.2,
      utilizationRate: 84.0,
      revenue: 31200,
    },
    {
      resourceType: "snowmobiles",
      variant: "Touring",
      totalUnits: 5,
      utilizedUnits: 4.5,
      utilizationRate: 90.0,
      revenue: 21140,
    },
    {
      resourceType: "ebikes",
      variant: "All sizes",
      totalUnits: 20,
      utilizedUnits: 18.3,
      utilizationRate: 91.5,
      revenue: 10050,
    },
    {
      resourceType: "guides",
      totalUnits: 12,
      utilizedUnits: 8.7,
      utilizationRate: 72.5,
      revenue: 0, // Guides don't generate direct revenue
    },
  ];

  // Message analytics
  messageAnalytics = {
    totalMessages: 156,
    unreadCount: 3,
    avgResponseTime: 45, // minutes
    byPlatform: {
      email: 67,
      whatsapp: 42,
      meta: 28,
      review: 19,
    },
  };

  // Customer analytics
  customerAnalytics = {
    newCustomers: 234,
    returningCustomers: 108,
    totalCustomers: 342,
    avgBookingsPerCustomer: 1.8,
    topCountries: [
      { country: "Finland", bookings: 142, revenue: 52340 },
      { country: "Germany", bookings: 89, revenue: 32120 },
      { country: "UK", bookings: 67, revenue: 24150 },
      { country: "Netherlands", bookings: 44, revenue: 16820 },
    ],
  };
}

// Getters
export function getKPIMetrics(): KPIMetric[] {
  return kpiMetrics;
}

export function getRevenueData(period: TimePeriod = "month"): RevenueDataPoint[] {
  const days = period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 90 : 365;
  return revenueData.slice(-days);
}

export function getProductPerformance(): ProductPerformance[] {
  return [...productPerformance].sort((a, b) => b.revenue - a.revenue);
}

export function getBookingTrends(period: TimePeriod = "month"): BookingTrend[] {
  const days = period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 90 : 365;
  return bookingTrends.slice(-days);
}

export function getResourceUtilization(): ResourceUtilization[] {
  return resourceUtilization;
}

export function getMessageAnalytics(): MessageAnalytics | null {
  return messageAnalytics;
}

export function getCustomerAnalytics(): CustomerAnalytics | null {
  return customerAnalytics;
}

// Initialize with mock data
seedAnalyticsData();
