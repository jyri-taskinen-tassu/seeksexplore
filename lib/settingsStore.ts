// lib/settingsStore.ts
export type Currency = "EUR" | "USD" | "GBP" | "SEK" | "NOK";
export type Language = "en" | "fi" | "sv" | "no";
export type Timezone = "Europe/Helsinki" | "Europe/Stockholm" | "Europe/Oslo" | "UTC";

export type CompanySettings = {
  companyName: string;
  legalName?: string;
  logo?: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  website?: string;
  taxId?: string;
};

export type NotificationSettings = {
  emailNotifications: {
    newBooking: boolean;
    bookingCancellation: boolean;
    lowFill: boolean;
    resourceConflict: boolean;
    dailySummary: boolean;
  };
  smsNotifications: {
    newBooking: boolean;
    bookingCancellation: boolean;
    urgentAlerts: boolean;
  };
};

export type IntegrationSettings = {
  calendar: {
    enabled: boolean;
    provider?: "google" | "outlook" | "ical";
    syncUrl?: string;
  };
  payments: {
    enabled: boolean;
    provider?: "stripe" | "paypal" | "other";
    accountId?: string;
  };
};

export type LocalizationSettings = {
  language: Language;
  timezone: Timezone;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
};

export type PricingSettings = {
  currency: Currency;
  taxRate: number; // percentage
  taxIncluded: boolean; // true = prices include tax
  cancellationPolicy: {
    freeCancellationHours: number; // hours before departure
    cancellationFee: number; // percentage
  };
};

export type Settings = {
  company: CompanySettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  localization: LocalizationSettings;
  pricing: PricingSettings;
};

let settings: Settings = {
  company: {
    companyName: "Northern Adventures",
    legalName: "Northern Adventures Oy",
    email: "hello@northernadventures.fi",
    phone: "+358 40 123 4567",
    address: {
      street: "Adventure Street 123",
      city: "Rovaniemi",
      postalCode: "96100",
      country: "Finland",
    },
    website: "https://northernadventures.fi",
    taxId: "FI12345678",
  },
  notifications: {
    emailNotifications: {
      newBooking: true,
      bookingCancellation: true,
      lowFill: true,
      resourceConflict: true,
      dailySummary: false,
    },
    smsNotifications: {
      newBooking: false,
      bookingCancellation: false,
      urgentAlerts: true,
    },
  },
  integrations: {
    calendar: {
      enabled: false,
    },
    payments: {
      enabled: false,
    },
  },
  localization: {
    language: "en",
    timezone: "Europe/Helsinki",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  },
  pricing: {
    currency: "EUR",
    taxRate: 24.0, // Finnish VAT
    taxIncluded: true,
    cancellationPolicy: {
      freeCancellationHours: 48,
      cancellationFee: 10,
    },
  },
};

export function getSettings(): Settings {
  return { ...settings };
}

export function updateCompanySettings(updates: Partial<CompanySettings>): void {
  settings.company = { ...settings.company, ...updates };
}

export function updateNotificationSettings(updates: Partial<NotificationSettings>): void {
  settings.notifications = { ...settings.notifications, ...updates };
}

export function updateIntegrationSettings(updates: Partial<IntegrationSettings>): void {
  settings.integrations = { ...settings.integrations, ...updates };
}

export function updateLocalizationSettings(updates: Partial<LocalizationSettings>): void {
  settings.localization = { ...settings.localization, ...updates };
}

export function updatePricingSettings(updates: Partial<PricingSettings>): void {
  settings.pricing = { ...settings.pricing, ...updates };
}
