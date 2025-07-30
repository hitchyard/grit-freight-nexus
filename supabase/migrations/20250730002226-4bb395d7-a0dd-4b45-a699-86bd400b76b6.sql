-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dot_number TEXT,
  mc_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  company_type TEXT CHECK (company_type IN ('broker', 'carrier')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_id UUID,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'trucker' CHECK (role IN ('trucker', 'broker', 'admin')),
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create futures table
CREATE TABLE public.futures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lane_from TEXT NOT NULL,
  lane_to TEXT NOT NULL,
  truck_type TEXT NOT NULL,
  rate_per_mile NUMERIC NOT NULL,
  estimated_miles INTEGER NOT NULL,
  total_commitment NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed', 'cancelled')),
  created_by UUID NOT NULL,
  matched_with UUID,
  ai_confidence_score NUMERIC DEFAULT 0,
  market_demand TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  future_id UUID,
  broker_id UUID NOT NULL,
  trucker_id UUID NOT NULL,
  total_amount NUMERIC NOT NULL,
  trucker_amount NUMERIC NOT NULL,
  broker_amount NUMERIC NOT NULL,
  platform_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'executed', 'cancelled')),
  contract_terms JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT,
  escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.futures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their company" ON public.companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.company_id = companies.id AND profiles.user_id = auth.uid())
);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for futures
CREATE POLICY "Users can view open futures" ON public.futures FOR SELECT USING (status = 'open' OR created_by = auth.uid() OR matched_with = auth.uid());
CREATE POLICY "Authenticated users can create futures" ON public.futures FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their futures" ON public.futures FOR UPDATE USING (created_by = auth.uid() OR matched_with = auth.uid());

-- RLS Policies for contracts
CREATE POLICY "Users can view their contracts" ON public.contracts FOR SELECT USING (broker_id = auth.uid() OR trucker_id = auth.uid());
CREATE POLICY "Service role can manage contracts" ON public.contracts FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for payouts
CREATE POLICY "Users can view their payouts" ON public.payouts FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Service role can manage payouts" ON public.payouts FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_futures_status ON public.futures(status);
CREATE INDEX idx_futures_created_by ON public.futures(created_by);
CREATE INDEX idx_contracts_broker_id ON public.contracts(broker_id);
CREATE INDEX idx_contracts_trucker_id ON public.contracts(trucker_id);
CREATE INDEX idx_messages_contract_id ON public.messages(contract_id);

-- Create updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_futures_updated_at BEFORE UPDATE ON public.futures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate commission splits
CREATE OR REPLACE FUNCTION public.calculate_commission_split(total_amount NUMERIC)
RETURNS TABLE(trucker_amount NUMERIC, broker_amount NUMERIC, platform_amount NUMERIC) AS $$
BEGIN
  RETURN QUERY SELECT
    total_amount * 0.80,  -- 80% to trucker
    total_amount * 0.10,  -- 10% to broker
    total_amount * 0.10;  -- 10% to platform
END;
$$ LANGUAGE plpgsql;