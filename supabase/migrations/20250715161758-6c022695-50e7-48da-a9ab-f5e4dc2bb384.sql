-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'broker', 'trucker');
CREATE TYPE broker_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE load_status AS ENUM ('posted', 'booked', 'in_transit', 'delivered', 'expired');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE truck_type AS ENUM ('hotshot', 'power_only', 'flatbed', 'dry_van', 'reefer');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'trucker',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brokers table
CREATE TABLE public.brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  mc_number TEXT UNIQUE,
  dot_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  status broker_status NOT NULL DEFAULT 'pending',
  trust_score INTEGER DEFAULT 0,
  total_loads_posted INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  speed_to_book_avg DECIMAL(10,2) DEFAULT 0.00,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Truckers table
CREATE TABLE public.truckers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  company_name TEXT,
  truck_type truck_type NOT NULL,
  equipment_details TEXT,
  preferred_lanes TEXT[],
  home_base_city TEXT,
  home_base_state TEXT,
  max_radius INTEGER DEFAULT 400,
  rate_per_mile_min DECIMAL(10,2),
  total_bookings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  speed_to_book_avg DECIMAL(10,2) DEFAULT 0.00,
  lane_profile_vector vector(1536),
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loads table
CREATE TABLE public.loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pickup_city TEXT NOT NULL,
  pickup_state TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  distance_miles INTEGER,
  truck_type truck_type NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  rate_per_mile DECIMAL(10,2),
  weight_lbs INTEGER,
  equipment_needed TEXT,
  special_requirements TEXT,
  contact_info JSONB,
  status load_status NOT NULL DEFAULT 'posted',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '3 hours'),
  priority_level INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  trucker_id UUID NOT NULL REFERENCES public.truckers(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'pending',
  booked_rate DECIMAL(10,2) NOT NULL,
  pickup_confirmation_time TIMESTAMPTZ,
  delivery_confirmation_time TIMESTAMPTZ,
  documents_signed BOOLEAN DEFAULT false,
  bol_uploaded BOOLEAN DEFAULT false,
  rate_confirmation_signed BOOLEAN DEFAULT false,
  payment_status payment_status DEFAULT 'pending',
  speed_to_book_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  payment_rating INTEGER CHECK (payment_rating >= 1 AND payment_rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Load vectors for AI matching
CREATE TABLE public.load_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Affiliate clicks (Rewardful integration)
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id TEXT NOT NULL,
  clicked_user_id UUID REFERENCES public.users(id),
  conversion_user_id UUID REFERENCES public.users(id),
  conversion_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  commission_amount DECIMAL(10,2),
  click_data JSONB,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events table (logging)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stripe accounts
CREATE TABLE public.stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  onboarding_complete BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  account_type TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Load payments
CREATE TABLE public.load_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  trucker_id UUID REFERENCES public.truckers(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  trucker_amount DECIMAL(10,2),
  broker_fee DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  status payment_status NOT NULL DEFAULT 'pending',
  escrow_released BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_brokers_status ON public.brokers(status);
CREATE INDEX idx_brokers_stripe_account ON public.brokers(stripe_account_id);
CREATE INDEX idx_truckers_broker_id ON public.truckers(broker_id);
CREATE INDEX idx_truckers_truck_type ON public.truckers(truck_type);
CREATE INDEX idx_loads_status ON public.loads(status);
CREATE INDEX idx_loads_broker_id ON public.loads(broker_id);
CREATE INDEX idx_loads_expires_at ON public.loads(expires_at);
CREATE INDEX idx_loads_truck_type ON public.loads(truck_type);
CREATE INDEX idx_bookings_load_id ON public.bookings(load_id);
CREATE INDEX idx_bookings_trucker_id ON public.bookings(trucker_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_ratings_booking_id ON public.ratings(booking_id);
CREATE INDEX idx_load_vectors_load_id ON public.load_vectors(load_id);
CREATE INDEX idx_load_vectors_embedding ON public.load_vectors USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_stripe_accounts_broker_id ON public.stripe_accounts(broker_id);
CREATE INDEX idx_load_payments_load_id ON public.load_payments(load_id);
CREATE INDEX idx_load_payments_status ON public.load_payments(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truckers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for brokers table
CREATE POLICY "Brokers can view own profile" ON public.brokers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Brokers can update own profile" ON public.brokers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all brokers" ON public.brokers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage brokers" ON public.brokers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage brokers" ON public.brokers
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for truckers table
CREATE POLICY "Truckers can view own profile" ON public.truckers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Truckers can update own profile" ON public.truckers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Brokers can view their truckers" ON public.truckers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = truckers.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all truckers" ON public.truckers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage truckers" ON public.truckers
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for loads table
CREATE POLICY "Brokers can manage own loads" ON public.loads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = loads.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Truckers can view loads from their broker" ON public.loads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.truckers t 
      JOIN public.brokers b ON t.broker_id = b.id 
      WHERE t.user_id = auth.uid() AND b.id = loads.broker_id
    )
  );

CREATE POLICY "Admins can view all loads" ON public.loads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage loads" ON public.loads
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for bookings table
CREATE POLICY "Truckers can view own bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.truckers WHERE id = bookings.trucker_id AND user_id = auth.uid())
  );

CREATE POLICY "Truckers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.truckers WHERE id = bookings.trucker_id AND user_id = auth.uid())
  );

CREATE POLICY "Brokers can view bookings for their loads" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = bookings.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Brokers can update bookings for their loads" ON public.bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = bookings.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage bookings" ON public.bookings
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for ratings table
CREATE POLICY "Users can view ratings for their bookings" ON public.ratings
  FOR SELECT USING (
    auth.uid() = rater_id OR auth.uid() = rated_id
  );

CREATE POLICY "Users can create ratings for their bookings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Admins can view all ratings" ON public.ratings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage ratings" ON public.ratings
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for load_vectors table
CREATE POLICY "Service role only for vectors" ON public.load_vectors
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for affiliate_clicks table
CREATE POLICY "Users can view own affiliate data" ON public.affiliate_clicks
  FOR SELECT USING (
    auth.uid() = clicked_user_id OR auth.uid() = conversion_user_id
  );

CREATE POLICY "Admins can view all affiliate data" ON public.affiliate_clicks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage affiliate data" ON public.affiliate_clicks
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for events table
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage events" ON public.events
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for stripe_accounts table
CREATE POLICY "Brokers can view own stripe account" ON public.stripe_accounts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = stripe_accounts.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Brokers can update own stripe account" ON public.stripe_accounts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = stripe_accounts.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Service role can manage stripe accounts" ON public.stripe_accounts
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for load_payments table
CREATE POLICY "Brokers can view payments for their loads" ON public.load_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.brokers WHERE id = load_payments.broker_id AND user_id = auth.uid())
  );

CREATE POLICY "Truckers can view their payments" ON public.load_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.truckers WHERE id = load_payments.trucker_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all payments" ON public.load_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage payments" ON public.load_payments
  FOR ALL USING (auth.role() = 'service_role');

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brokers_updated_at
  BEFORE UPDATE ON public.brokers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_truckers_updated_at
  BEFORE UPDATE ON public.truckers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loads_updated_at
  BEFORE UPDATE ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stripe_accounts_updated_at
  BEFORE UPDATE ON public.stripe_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_load_payments_updated_at
  BEFORE UPDATE ON public.load_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'trucker')::user_role
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-expire loads
CREATE OR REPLACE FUNCTION public.expire_old_loads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.loads 
  SET status = 'expired'
  WHERE status = 'posted' 
    AND expires_at < now();
END;
$$;

-- Schedule the function to run every 30 minutes
SELECT cron.schedule(
  'expire-old-loads',
  '*/30 * * * *',
  'SELECT public.expire_old_loads();'
);