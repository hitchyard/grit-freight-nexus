-- Insert dummy data for testing and AI training

-- Insert test users (these would normally be created through auth)
INSERT INTO public.users (id, email, first_name, last_name, role, phone)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'john.trucker@example.com', 'John', 'Smith', 'trucker', '+1-555-0101'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah.broker@example.com', 'Sarah', 'Johnson', 'broker', '+1-555-0102'),
  ('550e8400-e29b-41d4-a716-446655440003', 'mike.carrier@example.com', 'Mike', 'Williams', 'trucker', '+1-555-0103'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lisa.logistics@example.com', 'Lisa', 'Brown', 'broker', '+1-555-0104'),
  ('550e8400-e29b-41d4-a716-446655440005', 'david.driver@example.com', 'David', 'Miller', 'trucker', '+1-555-0105');

-- Insert test companies
INSERT INTO public.companies (id, name, dot_number, mc_number, address, city, state, zip_code, phone, email, company_type)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', 'Smith Trucking LLC', '12345678', 'MC-123456', '123 Main St', 'Atlanta', 'GA', '30309', '+1-555-1001', 'info@smithtrucking.com', 'Trucking'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Johnson Logistics Inc', '87654321', 'MC-654321', '456 Oak Ave', 'Dallas', 'TX', '75201', '+1-555-1002', 'contact@johnsonlogistics.com', 'Brokerage'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Williams Transport', '11223344', 'MC-112233', '789 Pine Rd', 'Nashville', 'TN', '37201', '+1-555-1003', 'dispatch@williamstransport.com', 'Trucking'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Brown Freight Solutions', '44332211', 'MC-443322', '321 Elm St', 'Phoenix', 'AZ', '85001', '+1-555-1004', 'ops@brownfreight.com', 'Brokerage'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Miller Express', '55667788', 'MC-556677', '654 Maple Dr', 'Denver', 'CO', '80201', '+1-555-1005', 'office@millerexpress.com', 'Trucking');

-- Insert test profiles
INSERT INTO public.profiles (id, user_id, company_id, first_name, last_name, phone, role, onboarding_complete)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', '+1-555-0101', 'trucker', true),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '+1-555-0102', 'broker', true),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Mike', 'Williams', '+1-555-0103', 'trucker', true),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'Lisa', 'Brown', '+1-555-0104', 'broker', true),
  ('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'David', 'Miller', '+1-555-0105', 'trucker', true);

-- Insert test brokers
INSERT INTO public.brokers (id, user_id, company_name, mc_number, dot_number, address, city, state, zip_code, status)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Johnson Logistics Inc', 'MC-654321', '87654321', '456 Oak Ave', 'Dallas', 'TX', '75201', 'approved'),
  ('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Brown Freight Solutions', 'MC-443322', '44332211', '321 Elm St', 'Phoenix', 'AZ', '85001', 'approved');

-- Insert test truckers
INSERT INTO public.truckers (id, user_id, broker_id, company_name, truck_type, equipment_details, home_base_city, home_base_state, max_radius, rate_per_mile_min, preferred_lanes, average_rating, total_bookings)
VALUES 
  ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Smith Trucking LLC', 'Dry Van', '2022 Freightliner Cascadia, 53ft dry van', 'Atlanta', 'GA', 500, 2.25, ARRAY['Atlanta,GA to Nashville,TN', 'Atlanta,GA to Charlotte,NC'], 4.8, 15),
  ('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 'Williams Transport', 'Refrigerated', '2021 Peterbilt 579, 53ft reefer', 'Nashville', 'TN', 600, 2.75, ARRAY['Nashville,TN to Atlanta,GA', 'Nashville,TN to Memphis,TN'], 4.6, 22),
  ('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440004', 'Miller Express', 'Flatbed', '2020 Kenworth W990, 48ft flatbed', 'Denver', 'CO', 800, 3.00, ARRAY['Denver,CO to Phoenix,AZ', 'Denver,CO to Dallas,TX'], 4.9, 18);

-- Insert test loads
INSERT INTO public.loads (id, broker_id, title, description, pickup_city, pickup_state, delivery_city, delivery_state, pickup_date, delivery_date, truck_type, rate, rate_per_mile, distance_miles, weight_lbs, status, priority_level, special_requirements, equipment_needed)
VALUES 
  ('a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Electronics Shipment ATL-NASH', 'High-value electronics requiring careful handling', 'Atlanta', 'GA', 'Nashville', 'TN', '2025-08-10', '2025-08-11', 'Dry Van', 650.00, 2.60, 250, 25000, 'posted', 2, 'No tarping, inside delivery required', 'Liftgate required'),
  ('a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'Frozen Food Delivery', 'Temperature-sensitive food products', 'Dallas', 'TX', 'Houston', 'TX', '2025-08-12', '2025-08-12', 'Refrigerated', 480.00, 2.85, 240, 40000, 'posted', 1, 'Maintain -10°F throughout transport', 'Multi-temp reefer'),
  ('a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440004', 'Steel Coils Transport', 'Heavy steel coils for construction', 'Phoenix', 'AZ', 'Las Vegas', 'NV', '2025-08-15', '2025-08-16', 'Flatbed', 890.00, 3.20, 300, 80000, 'posted', 3, 'Securement required, overweight permit included', 'Chains and binders provided'),
  ('a50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'Auto Parts Rush', 'Urgent auto parts delivery', 'Charlotte', 'NC', 'Jacksonville', 'FL', '2025-08-08', '2025-08-09', 'Dry Van', 720.00, 2.40, 300, 15000, 'posted', 3, 'Time-sensitive delivery, no delays', 'Standard dry van'),
  ('a50e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440004', 'Produce Haul', 'Fresh produce from farm to distribution', 'Denver', 'CO', 'Salt Lake City', 'UT', '2025-08-14', '2025-08-15', 'Refrigerated', 975.00, 2.95, 340, 45000, 'posted', 2, 'Temperature monitoring required', 'GPS tracking enabled');

-- Insert test freight futures
INSERT INTO public.futures (id, created_by, lane_from, lane_to, truck_type, rate_per_mile, estimated_miles, total_commitment, start_date, end_date, status, market_demand, ai_confidence_score)
VALUES 
  ('b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Atlanta, GA', 'Nashville, TN', 'Dry Van', 2.50, 250, 625.00, '2025-09-01', '2025-09-30', 'open', 'High demand expected for Q4 shipping', 0.85),
  ('b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Nashville, TN', 'Memphis, TN', 'Refrigerated', 2.80, 200, 560.00, '2025-08-15', '2025-08-31', 'open', 'Food distribution peak season', 0.92),
  ('b50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Denver, CO', 'Phoenix, AZ', 'Flatbed', 3.10, 600, 1860.00, '2025-08-20', '2025-09-15', 'open', 'Construction material demand surge', 0.78);

-- Insert test precommitments
INSERT INTO public.precommitments (id, broker_id, lane_from, lane_to, truck_type, forecast_rate, miles_estimate, commitment_amount, expires_at, status)
VALUES 
  ('c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Atlanta, GA', 'Miami, FL', 'Dry Van', 2.45, 450, 1102.50, '2025-08-20 23:59:59', 'open'),
  ('c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Phoenix, AZ', 'Los Angeles, CA', 'Flatbed', 3.25, 400, 1300.00, '2025-08-25 23:59:59', 'open'),
  ('c50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Dallas, TX', 'New Orleans, LA', 'Refrigerated', 2.90, 350, 1015.00, '2025-08-18 23:59:59', 'open');

-- Insert test events for analytics
INSERT INTO public.events (id, user_id, event_type, event_data, ip_address, user_agent)
VALUES 
  ('d50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'load_view', '{"load_id": "a50e8400-e29b-41d4-a716-446655440001", "duration_seconds": 45}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
  ('d50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'precommitment_created', '{"precommitment_id": "c50e8400-e29b-41d4-a716-446655440001", "amount": 1102.50}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
  ('d50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'load_posted', '{"load_id": "a50e8400-e29b-41d4-a716-446655440001", "rate": 650.00}', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');

-- Insert test ratings/reviews
INSERT INTO public.ratings (id, booking_id, rater_id, rated_id, rating, communication_rating, timeliness_rating, payment_rating, review)
VALUES 
  ('e50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 5, 5, 5, 5, 'Excellent driver! On-time delivery, great communication throughout the entire process. Would definitely work with again.'),
  ('e50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 4, 4, 5, 4, 'Good broker to work with. Clear instructions and prompt payment. Load was ready as scheduled.'),
  ('e50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 5, 4, 5, 5, 'Professional service, handled heavy freight with care. Delivered exactly on time despite traffic delays.');

-- Insert test messages
INSERT INTO public.messages (id, sender_id, recipient_id, content, message_type)
VALUES 
  ('f50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hi Sarah, I''m interested in the electronics shipment to Nashville. Is this still available?', 'text'),
  ('f50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Yes John! The load is still available. Can you handle pickup tomorrow morning at 8 AM?', 'text'),
  ('f50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Perfect! I can be there at 8 AM. Do you need any special equipment for loading?', 'text'),
  ('f50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Hey Lisa, I see you have a steel coils load going to Vegas. What''s the weight on this one?', 'text'),
  ('f50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Hi Mike! The total weight is 80,000 lbs. We''ll provide all chains and binders. Are you set up for heavy haul?', 'text');