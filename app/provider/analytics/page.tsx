"use client";

import React, { useState, useMemo } from "react";
import {
  getKPIMetrics,
  getRevenueData,
  getProductPerformance,
  getBookingTrends,
  getResourceUtilization,
  getMessageAnalytics,
  getCustomerAnalytics,
  type TimePeriod,
} from "@/lib/analyticsStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
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

// KPI Card Component
function KPICard({ metric }: { metric: ReturnType<typeof getKPIMetrics>[number] }) {
  const isPositive = metric.change >= 0;
  const formattedValue =
    metric.format === "currency"
      ? formatCurrency(metric.value, metric.currency)
      : metric.format === "percentage"
        ? formatPercentage(metric.value)
        : formatNumber(metric.value);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-600 mb-1">{metric.label}</div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
            {formattedValue}
          </div>
          <div className={cx(
            "flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {isPositive ? (
              <IconTrendingUp className="h-3 w-3" />
            ) : (
              <IconTrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? "+" : ""}{metric.change.toFixed(1)}% {metric.changeLabel}
            </span>
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-700">
          <IconChart className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// Chart metric type
type ChartMetric = "revenue" | "bookings" | "avgBookingValue";

// Revenue Chart Component with comparison
function RevenueChart({ 
  currentData, 
  compareData,
  metric = "revenue"
}: { 
  currentData: ReturnType<typeof getRevenueData>;
  compareData?: ReturnType<typeof getRevenueData>;
  metric?: ChartMetric;
}) {
  if (!currentData || currentData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
        No data available
      </div>
    );
  }

  // Get value based on metric
  const getValue = (point: ReturnType<typeof getRevenueData>[number]) => {
    switch (metric) {
      case "bookings":
        return point.bookings;
      case "avgBookingValue":
        return point.avgBookingValue;
      default:
        return point.revenue;
    }
  };

  const getLabel = () => {
    switch (metric) {
      case "bookings":
        return "Bookings";
      case "avgBookingValue":
        return "Avg Booking Value (EUR)";
      default:
        return "Revenue (EUR)";
    }
  };

  const maxValue = Math.max(
    ...currentData.map((d) => getValue(d)),
    ...(compareData || []).map((d) => getValue(d)),
    1
  );
  
  // Group data by week/month for better visualization if too many points
  const shouldGroup = currentData.length > 30;
  const groupedData = shouldGroup 
    ? currentData.filter((_, idx) => idx % Math.ceil(currentData.length / 30) === 0)
    : currentData;
  
  // Ensure we have at least some data points to show
  const displayData = groupedData.length > 0 ? groupedData : currentData.slice(0, 30);
  
  // Generate Y-axis labels (5 ticks)
  const yAxisTicks = 5;
  const yAxisLabels: number[] = [];
  for (let i = 0; i <= yAxisTicks; i++) {
    yAxisLabels.push((maxValue / yAxisTicks) * i);
  }
  
  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-neutral-900"></div>
          <span className="text-neutral-600">Current period</span>
        </div>
        {compareData && compareData.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neutral-300"></div>
            <span className="text-neutral-600">Previous period</span>
          </div>
        )}
      </div>
      
      {/* Chart with Y-axis */}
      <div className="flex gap-2">
        {/* Y-axis */}
        <div className="flex flex-col justify-between text-xs text-neutral-500 pb-6" style={{ width: '60px' }}>
          {yAxisLabels.reverse().map((value, idx) => (
            <span key={idx} className="text-right pr-2">
              {metric === "revenue" || metric === "avgBookingValue" 
                ? formatCurrency(value, "EUR").replace(/\s/g, '')
                : Math.round(value).toString()}
            </span>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="flex-1 space-y-2">
          <div className="flex items-end justify-between gap-0.5 h-64 relative border-b border-l border-neutral-200 pl-2">
            {/* Y-axis grid lines */}
            {yAxisLabels.map((value, idx) => (
              <div
                key={`grid-${idx}`}
                className="absolute left-0 right-0 border-t border-neutral-100"
                style={{ bottom: `${(value / maxValue) * 100}%` }}
              />
            ))}
            
            {/* Bars */}
            {displayData.map((point, idx) => {
              const value = getValue(point);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              // Find matching comparison point by date or index
              const comparePoint = compareData?.find(cp => cp.date === point.date) || compareData?.[idx];
              const compareValue = comparePoint ? getValue(comparePoint) : 0;
              const compareHeight = compareValue && maxValue > 0 
                ? (compareValue / maxValue) * 100 
                : 0;
              
              return (
                <div key={`${point.date}-${idx}`} className="flex-1 flex flex-col items-center gap-1 group relative min-w-[4px] h-full">
                  <div className="w-full flex flex-col justify-end h-full gap-0.5 relative z-0">
                    {/* Comparison bar (behind) */}
                    {compareHeight > 0 && (
                      <div
                        className="w-full rounded-t bg-neutral-300 opacity-70"
                        style={{ height: `${compareHeight}%`, minHeight: compareHeight > 0 ? '1px' : '0' }}
                        title={comparePoint ? `${comparePoint.date}: ${metric === "revenue" || metric === "avgBookingValue" ? formatCurrency(compareValue) : compareValue}` : ""}
                      />
                    )}
                    {/* Current bar */}
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 transition-all duration-200 cursor-pointer relative z-10 shadow-sm"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '2px' : '0' }}
                      title={`${point.date}: ${metric === "revenue" || metric === "avgBookingValue" ? formatCurrency(value) : value}`}
                    />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                    <div className="bg-neutral-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                      {point.date}: {metric === "revenue" || metric === "avgBookingValue" ? formatCurrency(value) : value}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pl-2">
            <span>{displayData[0]?.date}</span>
            <span>{displayData[displayData.length - 1]?.date}</span>
          </div>
        </div>
      </div>
      
      {/* Y-axis label */}
      <div className="text-xs text-neutral-500 -mt-2 pl-2" style={{ marginLeft: '60px' }}>
        {getLabel()}
      </div>
    </div>
  );
}

// Product Performance Table
function ProductPerformanceTable({ data }: { data: ReturnType<typeof getProductPerformance> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Product</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Bookings</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Revenue</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Occupancy</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rating</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Guests</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((product) => (
            <tr key={product.productId} className="hover:bg-neutral-50 transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium text-sm text-neutral-900">{product.productName}</div>
              </td>
              <td className="py-3 px-4 text-right text-sm text-neutral-700">{formatNumber(product.bookings)}</td>
              <td className="py-3 px-4 text-right text-sm font-medium text-neutral-900">{formatCurrency(product.revenue)}</td>
              <td className="py-3 px-4 text-right text-sm text-neutral-700">{formatPercentage(product.occupancyRate)}</td>
              <td className="py-3 px-4 text-right text-sm text-neutral-700">
                <div className="flex items-center justify-end gap-1">
                  <span>{product.avgRating.toFixed(1)}</span>
                  <span className="text-amber-400">★</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right text-sm text-neutral-700">{formatNumber(product.totalGuests)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Resource Utilization Component
function ResourceUtilizationCard({ resource }: { resource: ReturnType<typeof getResourceUtilization>[number] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">
            {resource.resourceType === "snowmobiles" ? "Snowmobiles" : resource.resourceType === "ebikes" ? "E-bikes" : "Guides"}
          </div>
          {resource.variant && (
            <div className="text-xs text-neutral-500 mt-0.5">{resource.variant}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-neutral-900">{formatPercentage(resource.utilizationRate)}</div>
          <div className="text-xs text-neutral-500">
            {resource.utilizedUnits.toFixed(1)} / {resource.totalUnits}
          </div>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neutral-700 to-neutral-900 rounded-full transition-all duration-300"
          style={{ width: `${resource.utilizationRate}%` }}
        />
      </div>
      {resource.revenue > 0 && (
        <div className="mt-2 text-xs text-neutral-600">
          Revenue: {formatCurrency(resource.revenue)}
        </div>
      )}
    </div>
  );
}

export default function ProviderAnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [comparePeriod, setComparePeriod] = useState<boolean>(true);
  const [chartMetric, setChartMetric] = useState<"revenue" | "bookings" | "avgBookingValue">("revenue");

  const kpiMetrics = useMemo(() => getKPIMetrics(), []);
  const revenueData = useMemo(() => {
    const data = getRevenueData(timePeriod);
    // Ensure we always have data
    if (data.length === 0) {
      console.warn("No revenue data available for period:", timePeriod);
    }
    return data;
  }, [timePeriod]);
  
  // Get comparison data (previous period)
  const compareRevenueData = useMemo(() => {
    if (!comparePeriod) return undefined;
    const days = timePeriod === "week" ? 7 : timePeriod === "month" ? 30 : timePeriod === "quarter" ? 90 : 365;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - days);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Generate comparison data for previous period
    const compareData: ReturnType<typeof getRevenueData> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const baseRevenue = 1800 + Math.random() * 2800; // Slightly lower for comparison
      const bookings = Math.floor(4 + Math.random() * 14);
      compareData.push({
        date: dateStr,
        revenue: Math.round(baseRevenue),
        bookings,
        avgBookingValue: Math.round((baseRevenue / bookings) * 100) / 100,
      });
    }
    return compareData;
  }, [timePeriod, comparePeriod]);
  
  const productPerformance = useMemo(() => getProductPerformance(), []);
  const bookingTrends = useMemo(() => getBookingTrends(timePeriod), [timePeriod]);
  const resourceUtilization = useMemo(() => getResourceUtilization(), []);
  const messageAnalytics = useMemo(() => getMessageAnalytics(), []);
  const customerAnalytics = useMemo(() => getCustomerAnalytics(), []);

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = bookingTrends.reduce((sum, d) => sum + d.netBookings, 0);
  const compareTotalRevenue = compareRevenueData?.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const revenueChange = compareTotalRevenue > 0 
    ? ((totalRevenue - compareTotalRevenue) / compareTotalRevenue) * 100 
    : 0;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex w-full items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-neutral-900">Analytics & Reports</div>
            <div className="mt-1 text-sm text-neutral-500">
              Data-driven insights for your business
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={comparePeriod}
                onChange={(e) => setComparePeriod(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>Compare with previous period</span>
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          {kpiMetrics.map((metric, idx) => (
            <KPICard key={idx} metric={metric} />
          ))}
        </section>

        {/* Revenue Chart */}
        <section className="mb-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-neutral-900">Revenue Trend</div>
                <div className="mt-1 text-sm text-neutral-500">
                  {chartMetric === "revenue" && (
                    <>
                      {formatCurrency(totalRevenue)} over {timePeriod === "week" ? "7" : timePeriod === "month" ? "30" : timePeriod === "quarter" ? "90" : "365"} days
                      {comparePeriod && compareTotalRevenue > 0 && (
                        <span className={cx(
                          "ml-2 font-medium",
                          revenueChange >= 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                          ({revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}% vs previous)
                        </span>
                      )}
                    </>
                  )}
                  {chartMetric === "bookings" && (
                    <>
                      {formatNumber(revenueData.reduce((sum, d) => sum + d.bookings, 0))} bookings
                    </>
                  )}
                  {chartMetric === "avgBookingValue" && (
                    <>
                      Average: {formatCurrency(revenueData.reduce((sum, d) => sum + d.avgBookingValue, 0) / revenueData.length)}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value as typeof chartMetric)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="revenue">Revenue</option>
                  <option value="bookings">Bookings</option>
                  <option value="avgBookingValue">Avg Booking Value</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <RevenueChart 
              currentData={revenueData} 
              compareData={comparePeriod ? compareRevenueData : undefined}
              metric={chartMetric}
            />
          </div>
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-6">
          {/* Product Performance */}
          <div className="xl:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="text-base font-semibold text-neutral-900">Product Performance</div>
              <div className="mt-1 text-sm text-neutral-500">Top products by revenue</div>
            </div>
            <div className="p-6">
              <ProductPerformanceTable data={productPerformance} />
            </div>
          </div>

          {/* Resource Utilization */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="text-base font-semibold text-neutral-900">Resource Utilization</div>
              <div className="mt-1 text-sm text-neutral-500">Equipment & guide usage</div>
            </div>
            <div className="p-6 space-y-4">
              {resourceUtilization.map((resource, idx) => (
                <ResourceUtilizationCard key={idx} resource={resource} />
              ))}
            </div>
          </div>
        </section>

        {/* Secondary Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
          {/* Booking Trends */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="text-base font-semibold text-neutral-900">Booking Trends</div>
              <div className="mt-1 text-sm text-neutral-500">
                {formatNumber(totalBookings)} net bookings
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {bookingTrends.slice(-7).reverse().map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <div className="text-sm text-neutral-700">{trend.date}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-emerald-600 font-medium">+{trend.bookings}</span>
                      {trend.cancellations > 0 && (
                        <span className="text-red-600">-{trend.cancellations}</span>
                      )}
                      <span className="text-neutral-900 font-semibold">{trend.netBookings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Analytics */}
          {customerAnalytics && (
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-4">
                <div className="text-base font-semibold text-neutral-900">Customer Insights</div>
                <div className="mt-1 text-sm text-neutral-500">
                  {formatNumber(customerAnalytics.totalCustomers)} total customers
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-600 mb-1">New Customers</div>
                    <div className="text-lg font-bold text-neutral-900">{formatNumber(customerAnalytics.newCustomers)}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-600 mb-1">Returning</div>
                    <div className="text-lg font-bold text-neutral-900">{formatNumber(customerAnalytics.returningCustomers)}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-600 mb-1">Avg. Bookings per Customer</div>
                  <div className="text-lg font-bold text-neutral-900">{customerAnalytics.avgBookingsPerCustomer.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-700 mb-2">Top Countries</div>
                  <div className="space-y-2">
                    {customerAnalytics.topCountries.map((country, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">{country.country}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-600">{formatNumber(country.bookings)}</span>
                          <span className="font-medium text-neutral-900">{formatCurrency(country.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Analytics */}
          {messageAnalytics && (
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-4">
                <div className="text-base font-semibold text-neutral-900">Message Analytics</div>
                <div className="mt-1 text-sm text-neutral-500">Communication overview</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-600 mb-1">Total Messages</div>
                    <div className="text-lg font-bold text-neutral-900">{formatNumber(messageAnalytics.totalMessages)}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-600 mb-1">Unread</div>
                    <div className="text-lg font-bold text-red-600">{formatNumber(messageAnalytics.unreadCount)}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs text-neutral-600 mb-1">Avg. Response Time</div>
                  <div className="text-lg font-bold text-neutral-900">{messageAnalytics.avgResponseTime} min</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-700 mb-2">By Platform</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Email</span>
                      <span className="font-medium text-neutral-900">{formatNumber(messageAnalytics.byPlatform.email)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">WhatsApp</span>
                      <span className="font-medium text-neutral-900">{formatNumber(messageAnalytics.byPlatform.whatsapp)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Meta</span>
                      <span className="font-medium text-neutral-900">{formatNumber(messageAnalytics.byPlatform.meta)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Reviews</span>
                      <span className="font-medium text-neutral-900">{formatNumber(messageAnalytics.byPlatform.review)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
