-- Create precommitments table for freight futures
CREATE TABLE IF NOT EXISTS public.precommitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL,
  lane_from TEXT NOT NULL,
  lane_to TEXT NOT NULL,
  truck_type truck_type NOT NULL,
  forecast_rate NUMERIC NOT NULL, -- $ per mile
  miles_estimate INTEGER NOT NULL,
  commitment_amount NUMERIC NOT NULL, -- escrowed
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_by UUID,
  accepted_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('open', 'accepted', 'expired')) DEFAULT 'open'
);

-- Add foreign key constraints
ALTER TABLE public.precommitments 
ADD CONSTRAINT precommitments_broker_id_fkey 
FOREIGN KEY (broker_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.precommitments 
ADD CONSTRAINT precommitments_accepted_by_fkey 
FOREIGN KEY (accepted_by) REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE public.precommitments ENABLE ROW LEVEL SECURITY;

-- Policy: Only broker can insert precommitments
CREATE POLICY "Only broker can insert precommitments"
  ON public.precommitments FOR INSERT
  WITH CHECK (auth.uid() = broker_id);

-- Policy: Truckers can view open precommitments
CREATE POLICY "Truckers can view open precommitments"
  ON public.precommitments FOR SELECT
  USING (
    status = 'open' AND (
      EXISTS (SELECT 1 FROM public.truckers t WHERE t.user_id = auth.uid())
    )
  );

-- Policy: Brokers can view their own precommitments
CREATE POLICY "Brokers can view own precommitments"
  ON public.precommitments FOR SELECT
  USING (auth.uid() = broker_id);

-- Policy: Truckers can accept precommitments
CREATE POLICY "Truckers can accept precommitments"
  ON public.precommitments FOR UPDATE
  USING (
    status = 'open' AND 
    EXISTS (SELECT 1 FROM public.truckers t WHERE t.user_id = auth.uid())
  );

-- Policy: Service role can manage precommitments
CREATE POLICY "Service role can manage precommitments"
  ON public.precommitments FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for performance
CREATE INDEX idx_precommitments_status_expires ON public.precommitments(status, expires_at);
CREATE INDEX idx_precommitments_broker_id ON public.precommitments(broker_id);
CREATE INDEX idx_precommitments_accepted_by ON public.precommitments(accepted_by);