-- Ensure pgcrypto exists
create extension if not exists "pgcrypto";

-- Fix UUID defaults to explicitly use Supabase extensions schema
ALTER TABLE public.profiles 
  ALTER COLUMN id SET DEFAULT extensions.gen_random_uuid();

ALTER TABLE public.health_logs 
  ALTER COLUMN id SET DEFAULT extensions.gen_random_uuid();

ALTER TABLE public.sleep_entries 
  ALTER COLUMN id SET DEFAULT extensions.gen_random_uuid();

ALTER TABLE public.doctor_access_keys 
  ALTER COLUMN id SET DEFAULT extensions.gen_random_uuid();

ALTER TABLE public.ai_health_reports 
  ALTER COLUMN id SET DEFAULT extensions.gen_random_uuid();


-- Drop broken functions (this drops triggers too)
DROP FUNCTION IF EXISTS public.generate_health_id CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;


-- Recreate correct functions (NO search_path)
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION public.generate_health_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.decentralized_health_id = 'DID-' || nextval('public.health_id_seq');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


CREATE TRIGGER generate_profile_health_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_health_id();
