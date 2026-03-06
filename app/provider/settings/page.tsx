"use client";

import React, { useState } from "react";
import {
  getSettings,
  updateCompanySettings,
  updateNotificationSettings,
  updateIntegrationSettings,
  updateLocalizationSettings,
  updatePricingSettings,
  type Settings,
  type Currency,
  type Language,
  type Timezone,
} from "@/lib/settingsStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProviderSettingsPage() {
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [activeTab, setActiveTab] = useState<"company" | "notifications" | "integrations" | "localization" | "pricing">("company");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "company" as const, label: "Company" },
    { id: "notifications" as const, label: "Notifications" },
    { id: "integrations" as const, label: "Integrations" },
    { id: "localization" as const, label: "Localization" },
    { id: "pricing" as const, label: "Pricing" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage your company settings, integrations, and preferences.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-200">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                  activeTab === tab.id
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Company Settings */}
        {activeTab === "company" && (
          <CompanySettingsTab
            settings={settings}
            onUpdate={(updates) => {
              updateCompanySettings(updates);
              setSettings(getSettings());
            }}
            onSave={handleSave}
            saved={saved}
          />
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <NotificationSettingsTab
            settings={settings}
            onUpdate={(updates) => {
              updateNotificationSettings(updates);
              setSettings(getSettings());
            }}
            onSave={handleSave}
            saved={saved}
          />
        )}

        {/* Integration Settings */}
        {activeTab === "integrations" && (
          <IntegrationSettingsTab
            settings={settings}
            onUpdate={(updates) => {
              updateIntegrationSettings(updates);
              setSettings(getSettings());
            }}
            onSave={handleSave}
            saved={saved}
          />
        )}

        {/* Localization Settings */}
        {activeTab === "localization" && (
          <LocalizationSettingsTab
            settings={settings}
            onUpdate={(updates) => {
              updateLocalizationSettings(updates);
              setSettings(getSettings());
            }}
            onSave={handleSave}
            saved={saved}
          />
        )}

        {/* Pricing Settings */}
        {activeTab === "pricing" && (
          <PricingSettingsTab
            settings={settings}
            onUpdate={(updates) => {
              updatePricingSettings(updates);
              setSettings(getSettings());
            }}
            onSave={handleSave}
            saved={saved}
          />
        )}
      </div>
    </div>
  );
}

function CompanySettingsTab({
  settings,
  onUpdate,
  onSave,
  saved,
}: {
  settings: Settings;
  onUpdate: (updates: Partial<Settings["company"]>) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [formData, setFormData] = useState(settings.company);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Company Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Legal Name
            </label>
            <input
              type="text"
              value={formData.legalName || ""}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tax ID
            </label>
            <input
              type="text"
              value={formData.taxId || ""}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Address</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address?.street || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, street: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.address?.city || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, city: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.address?.postalCode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, postalCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.address?.country || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address!, country: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center">Saved!</span>
        )}
        <button
          onClick={() => {
            onUpdate(formData);
            onSave();
          }}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationSettingsTab({
  settings,
  onUpdate,
  onSave,
  saved,
}: {
  settings: Settings;
  onUpdate: (updates: Partial<Settings["notifications"]>) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [formData, setFormData] = useState(settings.notifications);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Email Notifications</h2>
        <div className="space-y-3">
          {Object.entries(formData.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-neutral-900">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </div>
                <div className="text-xs text-neutral-500">
                  {key === "newBooking" && "Get notified when a new booking is made"}
                  {key === "bookingCancellation" && "Get notified when a booking is cancelled"}
                  {key === "lowFill" && "Get notified when a departure has low fill rate"}
                  {key === "resourceConflict" && "Get notified when there are resource conflicts"}
                  {key === "dailySummary" && "Receive a daily summary of operations"}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailNotifications: {
                        ...formData.emailNotifications,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">SMS Notifications</h2>
        <div className="space-y-3">
          {Object.entries(formData.smsNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-neutral-900">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </div>
                <div className="text-xs text-neutral-500">
                  {key === "newBooking" && "Get SMS when a new booking is made"}
                  {key === "bookingCancellation" && "Get SMS when a booking is cancelled"}
                  {key === "urgentAlerts" && "Get SMS for urgent alerts and conflicts"}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smsNotifications: {
                        ...formData.smsNotifications,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center">Saved!</span>
        )}
        <button
          onClick={() => {
            onUpdate(formData);
            onSave();
          }}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function IntegrationSettingsTab({
  settings,
  onUpdate,
  onSave,
  saved,
}: {
  settings: Settings;
  onUpdate: (updates: Partial<Settings["integrations"]>) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [formData, setFormData] = useState(settings.integrations);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Calendar Integration</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-neutral-900">Enable Calendar Sync</div>
              <div className="text-xs text-neutral-500">
                Sync your departures with external calendars
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.calendar.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calendar: { ...formData.calendar, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
            </label>
          </div>
          {formData.calendar.enabled && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Calendar Provider
              </label>
              <select
                value={formData.calendar.provider || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calendar: {
                      ...formData.calendar,
                      provider: e.target.value as "google" | "outlook" | "ical",
                    },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">Select provider</option>
                <option value="google">Google Calendar</option>
                <option value="outlook">Outlook Calendar</option>
                <option value="ical">iCal Export</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment Integration</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-neutral-900">Enable Payment Processing</div>
              <div className="text-xs text-neutral-500">
                Process payments directly through the platform
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.payments.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payments: { ...formData.payments, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
            </label>
          </div>
          {formData.payments.enabled && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Payment Provider
              </label>
              <select
                value={formData.payments.provider || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payments: {
                      ...formData.payments,
                      provider: e.target.value as "stripe" | "paypal" | "other",
                    },
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value="">Select provider</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center">Saved!</span>
        )}
        <button
          onClick={() => {
            onUpdate(formData);
            onSave();
          }}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function LocalizationSettingsTab({
  settings,
  onUpdate,
  onSave,
  saved,
}: {
  settings: Settings;
  onUpdate: (updates: Partial<Settings["localization"]>) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [formData, setFormData] = useState(settings.localization);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Language & Region</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value as Language })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="fi">Finnish</option>
              <option value="sv">Swedish</option>
              <option value="no">Norwegian</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value as Timezone })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="Europe/Helsinki">Europe/Helsinki (EET/EEST)</option>
              <option value="Europe/Stockholm">Europe/Stockholm (CET/CEST)</option>
              <option value="Europe/Oslo">Europe/Oslo (CET/CEST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Date Format
            </label>
            <select
              value={formData.dateFormat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateFormat: e.target.value as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Time Format
            </label>
            <select
              value={formData.timeFormat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeFormat: e.target.value as "12h" | "24h",
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="24h">24-hour (14:30)</option>
              <option value="12h">12-hour (2:30 PM)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center">Saved!</span>
        )}
        <button
          onClick={() => {
            onUpdate(formData);
            onSave();
          }}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function PricingSettingsTab({
  settings,
  onUpdate,
  onSave,
  saved,
}: {
  settings: Settings;
  onUpdate: (updates: Partial<Settings["pricing"]>) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [formData, setFormData] = useState(settings.pricing);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Currency & Tax</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value as Currency })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SEK">SEK (kr)</option>
              <option value="NOK">NOK (kr)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.taxRate}
              onChange={(e) =>
                setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-neutral-900">Prices Include Tax</div>
              <div className="text-xs text-neutral-500">
                When enabled, displayed prices already include tax
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.taxIncluded}
                onChange={(e) =>
                  setFormData({ ...formData, taxIncluded: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Cancellation Policy</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Free Cancellation Hours
            </label>
            <input
              type="number"
              value={formData.cancellationPolicy.freeCancellationHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cancellationPolicy: {
                    ...formData.cancellationPolicy,
                    freeCancellationHours: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
            <div className="text-xs text-neutral-500 mt-1">
              Hours before departure when cancellation is free
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Cancellation Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.cancellationPolicy.cancellationFee}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cancellationPolicy: {
                    ...formData.cancellationPolicy,
                    cancellationFee: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
            <div className="text-xs text-neutral-500 mt-1">
              Percentage charged for cancellations after free period
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center">Saved!</span>
        )}
        <button
          onClick={() => {
            onUpdate(formData);
            onSave();
          }}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
