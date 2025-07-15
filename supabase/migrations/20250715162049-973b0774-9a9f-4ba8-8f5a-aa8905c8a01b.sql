-- Create function to find matching loads for a trucker
CREATE OR REPLACE FUNCTION find_matching_loads(
  trucker_vector vector(1536),
  similarity_threshold float DEFAULT 0.8,
  trucker_broker_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  pickup_city text,
  pickup_state text,
  delivery_city text,
  delivery_state text,
  truck_type truck_type,
  rate decimal(10,2),
  distance_miles integer,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.pickup_city,
    l.pickup_state,
    l.delivery_city,
    l.delivery_state,
    l.truck_type,
    l.rate,
    l.distance_miles,
    (1 - (lv.embedding <=> trucker_vector)) as similarity
  FROM public.loads l
  JOIN public.load_vectors lv ON l.id = lv.load_id
  WHERE l.status = 'posted'
    AND l.expires_at > now()
    AND (trucker_broker_id IS NULL OR l.broker_id = trucker_broker_id)
    AND (1 - (lv.embedding <=> trucker_vector)) >= similarity_threshold
  ORDER BY similarity DESC
  LIMIT 20;
END;
$$;

-- Create function to find matching truckers for a load
CREATE OR REPLACE FUNCTION find_matching_truckers(
  load_vector vector(1536),
  similarity_threshold float DEFAULT 0.8,
  load_broker_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  company_name text,
  truck_type truck_type,
  home_base_city text,
  home_base_state text,
  rate_per_mile_min decimal(10,2),
  average_rating decimal(3,2),
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.company_name,
    t.truck_type,
    t.home_base_city,
    t.home_base_state,
    t.rate_per_mile_min,
    t.average_rating,
    (1 - (t.lane_profile_vector <=> load_vector)) as similarity
  FROM public.truckers t
  WHERE t.lane_profile_vector IS NOT NULL
    AND (load_broker_id IS NULL OR t.broker_id = load_broker_id)
    AND (1 - (t.lane_profile_vector <=> load_vector)) >= similarity_threshold
  ORDER BY similarity DESC
  LIMIT 20;
END;
$$;