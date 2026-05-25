"use client";

import React, { useState, useMemo } from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

interface RevenuePoint {
  date: string;
  revenue: number;
  bookings: number;
  avg_booking_value: number;
}

interface ProductPerformance {
  product_id: string;
  product_name: string;
  bookings: number;
  revenue: number;
  total_guests: number;
  occupancy_rate: number;
}

interface CustomerSummary {
  total_customers: number;
  returning_customers: number;
  new_customers: number;
  avg_bookings_per_customer: number;
}

interface BookingTrend {
  date: string;
  net_bookings: number;
  confirmed_bookings: number;
  cancellations: number;
}

interface ResourceUtilization {
  category_id: string;
  category_name: string;
  variant_id: string;
  variant_name: string;
  total_units: number;
  booked_units: number;
}

interface AnalyticsProps {
  providerName: string;
  revenueData: RevenuePoint[];
  productPerformance: ProductPerformance[];
  customerSummary: CustomerSummary;
  bookingTrends: BookingTrend[];
  resourceUtilization: ResourceUtilization[];
}

// Icon components
function IconTrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconTrendingDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

// Format helpers
function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

type TimePeriod = "week" | "month" | "quarter" | "year";

type KPIMetric = {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
  format: "currency" | "number" | "percentage";
  currency?: string;
};

function KPICard({ metric }: { metric: KPIMetric }) {
  const isPositive = metric.change >= 0;
  const formattedValue =
    metric.format === "currency"
      ? formatCurrency(metric.value, metric.currency)
      : metric.format === "percentage"
        ? formatPercentage(metric.value)
        : formatNumber(metric.value);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider opacity-80">
            {metric.label}
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--green-900)] mb-2">
            {formattedValue}
          </div>
          <div className={cx("flex items-center gap-1 text-xs font-bold", isPositive ? "text-emerald-700" : "text-red-700")}>
            {isPositive ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
            <span>
              {isPositive ? "+" : ""}{metric.change.toFixed(1)}% {metric.changeLabel}
            </span>
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--cream-50)] text-[var(--green-900)] shadow-inner">
          <IconChart className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

type ChartMetric = "revenue" | "bookings" | "avgBookingValue";

function RevenueChart({
  currentData,
  compareData,
  metric = "revenue",
}: {
  currentData: RevenuePoint[];
  compareData?: RevenuePoint[];
  metric?: ChartMetric;
}) {
  const getValue = (point: RevenuePoint) => {
    switch (metric) {
      case "bookings": return point.bookings;
      case "avgBookingValue": return point.avg_booking_value || (point.revenue / (point.bookings || 1));
      default: return point.revenue;
    }
  };

  const maxValue = Math.max(
    ...currentData.map(getValue),
    ...(compareData || []).map(getValue),
    1
  );

  const displayData = currentData.length > 30 
    ? currentData.filter((_, idx) => idx % Math.ceil(currentData.length / 30) === 0)
    : currentData;

  const yAxisTicks = 5;
  const yAxisLabels = Array.from({ length: yAxisTicks + 1 }, (_, i) => (maxValue / yAxisTicks) * i).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--green-900)]"></div>
          <span className="text-[var(--ink)] font-bold">Current period</span>
        </div>
        {compareData && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[var(--line)]"></div>
            <span className="text-[var(--ink)] font-bold">Previous period</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 h-64">
        <div className="flex flex-col justify-between text-[10px] text-[var(--ink)] font-bold pb-6 w-14">
          {yAxisLabels.map((v, i) => (
            <span key={i} className="text-right pr-2">
              {metric === "bookings" ? Math.round(v) : formatCurrency(v).replace(/\s/g, "")}
            </span>
          ))}
        </div>
        <div className="flex-1 flex items-end justify-between gap-1 border-b border-l border-[var(--line)] pl-2 relative">
          {displayData.map((point, idx) => {
            const val = getValue(point);
            const h = (val / maxValue) * 100;
            return (
              <div key={idx} className="flex-1 bg-[var(--green-800)] rounded-t min-w-[2px]" style={{ height: `${Math.max(h, 2)}%` }} title={`${point.date}: ${val}`} />
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-[var(--ink)] font-bold ml-16">
        <span>{displayData[0]?.date}</span>
        <span>{displayData[displayData.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export default function AnalyticsClient({
  providerName,
  revenueData,
  productPerformance,
  customerSummary,
  bookingTrends,
  resourceUtilization
}: AnalyticsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("revenue");

  const filteredRevenue = useMemo(() => {
    const days = timePeriod === "week" ? 7 : timePeriod === "month" ? 30 : timePeriod === "quarter" ? 90 : 365;
    return revenueData.slice(-days);
  }, [revenueData, timePeriod]);

  const kpis: KPIMetric[] = useMemo(() => [
    {
      label: "Total Revenue",
      value: filteredRevenue.reduce((s, d) => s + d.revenue, 0),
      change: 12.5, // Mock change for now
      changeLabel: "vs prev period",
      format: "currency"
    },
    {
      label: "Total Bookings",
      value: filteredRevenue.reduce((s, d) => s + d.bookings, 0),
      change: 8.2,
      changeLabel: "vs prev period",
      format: "number"
    },
    {
      label: "Avg. Occupancy",
      value: productPerformance.reduce((s, d) => s + d.occupancy_rate, 0) / (productPerformance.length || 1),
      change: 5.3,
      changeLabel: "vs prev period",
      format: "percentage"
    },
    {
      label: "Total Guests",
      value: productPerformance.reduce((s, d) => s + d.total_guests, 0),
      change: 15.7,
      changeLabel: "vs prev period",
      format: "number"
    }
  ], [filteredRevenue, productPerformance]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--cream-50)]">
      <header className="border-b border-[var(--line)] bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex w-full items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-[var(--green-900)]">{providerName} Analytics</div>
            <div className="mt-1 text-sm text-[var(--ink-sub)]">Data-driven insights from Supabase</div>
          </div>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)]"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => <KPICard key={i} metric={k} />)}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[var(--green-900)]">Performance Trends</h3>
                <select
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value as ChartMetric)}
                  className="text-sm border-none bg-transparent font-bold text-[var(--green-800)]"
                >
                  <option value="revenue">Revenue</option>
                  <option value="bookings">Bookings</option>
                  <option value="avgBookingValue">Avg Value</option>
                </select>
              </div>
              <RevenueChart currentData={filteredRevenue} metric={chartMetric} />
            </section>

            <div className="rounded-xl border border-[var(--line)] bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--cream-50)]/30">
                <h3 className="font-bold text-[var(--green-900)]">Product Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--cream-50)] text-[var(--ink)] font-bold text-left">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3 text-right">Bookings</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                      <th className="px-6 py-3 text-right">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {productPerformance.map((p) => (
                      <tr key={p.product_id} className="hover:bg-[var(--cream-50)]/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-[var(--ink)]">{p.product_name}</td>
                        <td className="px-6 py-4 text-right text-[var(--ink)] font-bold">{p.bookings}</td>
                        <td className="px-6 py-4 text-right text-[var(--ink)] font-bold">{formatCurrency(p.revenue)}</td>
                        <td className="px-6 py-4 text-right text-[var(--ink)] font-bold">{formatPercentage(p.occupancy_rate)}</td>
                      </tr>
                    ))}
                    {productPerformance.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-[var(--ink)] font-medium">No product performance data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--line)] bg-white shadow-sm p-6 space-y-6">
              <h3 className="font-bold text-[var(--green-900)]">Customer Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--cream-50)] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[var(--ink)] opacity-70">New</div>
                  <div className="text-xl font-bold text-[var(--green-900)]">{customerSummary.new_customers}</div>
                </div>
                <div className="p-3 bg-[var(--cream-50)] rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-[var(--ink)] opacity-70">Returning</div>
                  <div className="text-xl font-bold text-[var(--green-900)]">{customerSummary.returning_customers}</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ink)] font-bold">Total Customers</span>
                  <span className="font-extrabold text-[var(--green-900)]">{customerSummary.total_customers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ink)] font-bold">Avg Bookings</span>
                  <span className="font-extrabold text-[var(--green-900)]">{customerSummary.avg_bookings_per_customer?.toFixed(1) || "0.0"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-white shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-[var(--green-900)]">Equipment Usage</h3>
              <div className="space-y-4">
                {resourceUtilization.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[var(--ink)] font-bold">{r.variant_name}</span>
                      <span className="text-[var(--ink)] font-extrabold">{r.booked_units} / {r.total_units}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--cream-100)] rounded-full overflow-hidden shadow-inner border border-[var(--line)]/30">
                      <div 
                        className="h-full bg-[var(--green-800)] rounded-full" 
                        style={{ width: `${Math.min((r.booked_units / (r.total_units || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {resourceUtilization.length === 0 && (
                  <div className="text-center py-4 text-xs text-[var(--ink)] font-medium">No equipment data</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-white shadow-sm p-6">
              <h3 className="font-bold text-[var(--green-900)] mb-4">Daily Trends</h3>
              <div className="space-y-4">
                {bookingTrends.slice(-5).reverse().map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-[var(--line)] last:border-0 last:pb-0">
                    <span className="text-[var(--ink)] font-bold">{t.date}</span>
                    <div className="flex gap-3">
                      <span className="text-emerald-700 font-extrabold">+{t.confirmed_bookings}</span>
                      {t.cancellations > 0 && <span className="text-red-700 font-extrabold">-{t.cancellations}</span>}
                    </div>
                  </div>
                ))}
                {bookingTrends.length === 0 && (
                  <div className="text-center py-4 text-xs text-[var(--ink)] font-medium">No trend data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}

