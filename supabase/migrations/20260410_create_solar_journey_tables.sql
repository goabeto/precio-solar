-- Precio Solar tables
-- Run this in Supabase Dashboard > SQL Editor
-- Project: azvllkugzqaxlzibkpdm

CREATE TABLE IF NOT EXISTS solar_journey_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text,
  postal_code text,
  city text,
  region text,
  monthly_bill numeric,
  system_size_kwp numeric,
  panel_count integer,
  estimated_cost numeric,
  subsidy_amount numeric,
  net_cost numeric,
  monthly_saving numeric,
  include_battery boolean DEFAULT false,
  source text DEFAULT 'calculator',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solar_journey_cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token text,
  display_name text,
  phone text,
  email text,
  postal_code text,
  city text,
  region text,
  address text,
  is_owner text,
  is_private text,
  allow_visit text,
  timeline text,
  has_existing_proposal text,
  comments text,
  system_size_kwp numeric,
  panel_count integer,
  estimated_cost numeric,
  subsidy_amount numeric,
  net_cost numeric,
  monthly_bill numeric,
  monthly_saving numeric,
  include_battery boolean DEFAULT false,
  financing_preference text,
  selected_installers jsonb,
  consent_whatsapp boolean DEFAULT false,
  consent_share_data boolean DEFAULT false,
  consent_terms boolean DEFAULT false,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solar_journey_proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  postal_code text,
  city text,
  region text,
  quoted_price numeric,
  system_size_kwp numeric,
  panel_count integer,
  panel_brand text,
  inverter_brand text,
  include_battery boolean DEFAULT false,
  battery_kwh numeric,
  subsidy_included text,
  financing_tae numeric,
  financing_monthly numeric,
  financing_term_months integer,
  price_score text,
  financing_score text,
  overall_rating text,
  market_avg numeric,
  market_min numeric,
  market_max numeric,
  best_subsidy_amount numeric,
  file_urls text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solar_journey_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid REFERENCES solar_journey_cases(id),
  listing_id uuid,
  listing_name text,
  status text DEFAULT 'open',
  initial_message text,
  installer_responded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solar_journey_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid REFERENCES solar_journey_chats(id),
  sender_type text CHECK (sender_type IN ('user', 'installer', 'system', 'bot')),
  body text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Disable RLS for service role access (solar journey tables are internal)
ALTER TABLE solar_journey_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_journey_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_journey_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_journey_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_journey_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON solar_journey_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON solar_journey_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON solar_journey_proposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON solar_journey_chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON solar_journey_messages FOR ALL USING (true) WITH CHECK (true);
