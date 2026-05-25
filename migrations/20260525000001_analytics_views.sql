-- Migration: Analytics views for provider dashboard
-- Created: 2026-05-25

-- 1. Revenue by date
CREATE OR REPLACE VIEW seeks_and_explore_demo.revenue_by_date AS
SELECT 
    provider_id,
    booking_date as date,
    SUM(total_price) as revenue,
    COUNT(*) as bookings,
    AVG(total_price) as avg_booking_value
FROM seeks_and_explore_demo.bookings
WHERE status != 'cancelled'
GROUP BY provider_id, booking_date;

-- 2. Product performance
CREATE OR REPLACE VIEW seeks_and_explore_demo.product_performance_analytics AS
SELECT 
    b.provider_id,
    b.product_id,
    b.product_name,
    COUNT(*) as bookings,
    SUM(b.total_price) as revenue,
    SUM(b.guests) as total_guests,
    -- Simple occupancy rate based on capacity_max if available
    CASE 
        WHEN p.capacity_max > 0 THEN (SUM(b.guests)::numeric / (COUNT(DISTINCT b.booking_date || b.booking_time) * p.capacity_max)) * 100
        ELSE 0 
    END as occupancy_rate
FROM seeks_and_explore_demo.bookings b
JOIN seeks_and_explore_demo.products p ON p.id = b.product_id
WHERE b.status != 'cancelled'
GROUP BY b.provider_id, b.product_id, b.product_name, p.capacity_max;

-- 3. Customer analytics
CREATE OR REPLACE VIEW seeks_and_explore_demo.customer_analytics_summary AS
SELECT 
    provider_id,
    COUNT(*) as total_customers,
    SUM(CASE WHEN total_bookings > 1 THEN 1 ELSE 0 END) as returning_customers,
    SUM(CASE WHEN total_bookings = 1 THEN 1 ELSE 0 END) as new_customers,
    AVG(total_bookings) as avg_bookings_per_customer
FROM seeks_and_explore_demo.customers
GROUP BY provider_id;

-- 4. Booking trends (last 30 days daily)
CREATE OR REPLACE VIEW seeks_and_explore_demo.booking_trends_daily AS
SELECT 
    provider_id,
    booking_date as date,
    COUNT(*) FILTER (WHERE status != 'cancelled') as net_bookings,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations
FROM seeks_and_explore_demo.bookings
GROUP BY provider_id, booking_date;
