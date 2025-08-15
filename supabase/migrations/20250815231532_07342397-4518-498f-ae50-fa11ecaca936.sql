-- Create broker_applications table for storing application data and verification results
CREATE TABLE public.broker_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Company Information
  company_name TEXT NOT NULL,
  mc_number TEXT,
  dot_number TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  experience TEXT,
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- FMCSA Verification Data
  fmcsa_verified BOOLEAN DEFAULT FALSE,
  fmcsa_status TEXT,
  fmcsa_operating_status TEXT,
  fmcsa_bond_compliant BOOLEAN,
  fmcsa_insurance_compliant BOOLEAN,
  fmcsa_legal_name TEXT,
  fmcsa_dba_name TEXT,
  fmcsa_address TEXT,
  fmcsa_verification_timestamp TIMESTAMP WITH TIME ZONE,
  fmcsa_raw_response JSONB,
  
  -- Admin Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own applications" 
ON public.broker_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" 
ON public.broker_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" 
ON public.broker_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Admins can update all applications" 
ON public.broker_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Service role can manage applications" 
ON public.broker_applications 
FOR ALL 
USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER update_broker_applications_updated_at
BEFORE UPDATE ON public.broker_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for MC numbers for faster lookups
CREATE INDEX idx_broker_applications_mc_number ON public.broker_applications(mc_number);
CREATE INDEX idx_broker_applications_status ON public.broker_applications(status);
CREATE INDEX idx_broker_applications_fmcsa_verified ON public.broker_applications(fmcsa_verified);