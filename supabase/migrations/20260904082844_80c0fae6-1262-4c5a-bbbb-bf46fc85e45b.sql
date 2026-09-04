ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline jsonb NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO public.categories (slug, name, description, sort_order) VALUES
  ('politics', 'Politics', 'Government, parliament, elections, reform and accountability.', 1),
  ('economy', 'Economy', 'Prices, jobs, banking, trade and what they mean for households.', 2),
  ('society', 'Society', 'Everyday life, public services, workers, women, children and communities.', 3),
  ('education', 'Education', 'Schools, universities, students and teachers.', 4),
  ('crime-justice', 'Crime & Justice', 'Policing, courts, corruption cases and public safety.', 5),
  ('climate', 'Climate & Disasters', 'Floods, cyclones, heat, rivers and the response to them.', 6),
  ('technology', 'Technology', 'Internet access, digital rights, startups and public tech.', 7),
  ('international', 'International', 'The world beyond Bangladesh, and what it changes here.', 8),
  ('regions', 'Regions', 'Reporting from every division, not just Dhaka.', 9),
  ('opinion', 'Opinion', 'Analysis and argument, clearly labelled.', 10)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order;

UPDATE public.categories SET sort_order = 90 WHERE slug IN ('national','business','culture');

INSERT INTO public.tags (slug, name) VALUES
  ('dhaka','Dhaka'), ('chattogram','Chattogram'), ('sylhet','Sylhet'), ('rajshahi','Rajshahi'),
  ('khulna','Khulna'), ('barishal','Barishal'), ('rangpur','Rangpur'), ('mymensingh','Mymensingh'),
  ('inflation','Inflation'), ('prices','Prices'), ('bangladesh-bank','Bangladesh Bank'),
  ('rmg','Garment industry'), ('remittances','Remittances'), ('elections','Elections'),
  ('human-rights','Human rights'), ('corruption','Corruption'), ('floods','Floods'),
  ('heatwave','Heat'), ('rohingya','Rohingya'), ('india','India'), ('china','China'),
  ('united-states','United States'), ('workers','Workers'), ('students','Students'),
  ('health','Health'), ('transport','Transport'), ('agriculture','Agriculture')
ON CONFLICT (slug) DO NOTHING;