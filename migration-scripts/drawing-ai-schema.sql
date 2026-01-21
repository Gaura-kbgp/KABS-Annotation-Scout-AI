-- Drawing Suggestion AI Schema
-- Tables for NKBA rules, reference materials, and drawing analysis

-- NKBA Rules and Guidelines
CREATE TABLE IF NOT EXISTS nkba_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL, -- e.g., 'clearances', 'work_triangle', 'appliances'
  rule_code VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'NKBA-31', 'NKBA-32'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_value NUMERIC, -- For dimensional requirements
  max_value NUMERIC,
  unit VARCHAR(20), -- 'inches', 'feet', 'mm'
  severity VARCHAR(20) DEFAULT 'warning', -- 'critical', 'warning', 'suggestion'
  pdf_reference TEXT, -- Reference to uploaded NKBA PDF
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Reference Images for NKBA Rules
CREATE TABLE IF NOT EXISTS nkba_reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES nkba_rules(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NKBA PDF Documents
CREATE TABLE IF NOT EXISTS nkba_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  version VARCHAR(50),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drawing Analysis Sessions
CREATE TABLE IF NOT EXISTS drawing_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name VARCHAR(255),
  pdf_url TEXT NOT NULL,
  analysis_type VARCHAR(50) DEFAULT 'nkba_validation', -- 'nkba_validation', 'pricing'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drawing Violations/Suggestions
CREATE TABLE IF NOT EXISTS drawing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES drawing_analysis(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES nkba_rules(id),
  cabinet_code VARCHAR(100), -- Cabinet code where issue was found
  location_description TEXT, -- Human-readable location
  issue_type VARCHAR(50), -- 'violation', 'warning', 'suggestion'
  severity VARCHAR(20), -- 'critical', 'warning', 'info'
  current_value NUMERIC,
  required_value NUMERIC,
  unit VARCHAR(20),
  suggestion_text TEXT NOT NULL,
  ai_confidence NUMERIC(3,2), -- 0.00 to 1.00
  page_number INTEGER,
  coordinates JSONB, -- {x, y, width, height} for highlighting
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users (for NKBA content management)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin'
  permissions JSONB DEFAULT '{"manage_rules": true, "manage_documents": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nkba_rules_category ON nkba_rules(category);
CREATE INDEX IF NOT EXISTS idx_nkba_rules_code ON nkba_rules(rule_code);
CREATE INDEX IF NOT EXISTS idx_drawing_analysis_user ON drawing_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_drawing_analysis_status ON drawing_analysis(status);
CREATE INDEX IF NOT EXISTS idx_drawing_suggestions_analysis ON drawing_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_drawing_suggestions_severity ON drawing_suggestions(severity);

-- Row Level Security (RLS) Policies
ALTER TABLE nkba_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE nkba_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE nkba_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- NKBA Rules: Read by all authenticated users, write by admins only
CREATE POLICY "Anyone can view NKBA rules" ON nkba_rules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage NKBA rules" ON nkba_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Reference Images: Same as rules
CREATE POLICY "Anyone can view reference images" ON nkba_reference_images
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage reference images" ON nkba_reference_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- NKBA Documents: Same as rules
CREATE POLICY "Anyone can view NKBA documents" ON nkba_documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage NKBA documents" ON nkba_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Drawing Analysis: Users can only see their own
CREATE POLICY "Users can view own analysis" ON drawing_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analysis" ON drawing_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" ON drawing_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- Drawing Suggestions: Users can see suggestions for their analyses
CREATE POLICY "Users can view own suggestions" ON drawing_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drawing_analysis 
      WHERE drawing_analysis.id = drawing_suggestions.analysis_id 
      AND drawing_analysis.user_id = auth.uid()
    )
  );

-- Admin Users: Only viewable by admins
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Insert some default NKBA rules
INSERT INTO nkba_rules (category, rule_code, title, description, min_value, unit, severity) VALUES
  ('clearances', 'NKBA-31', 'Work Aisle Width', 'In a kitchen with one cook, the work aisle should be at least 42 inches wide. In kitchens with multiple cooks, 48 inches is recommended.', 42, 'inches', 'warning'),
  ('clearances', 'NKBA-32', 'Walkway Width', 'Walkways should be at least 36 inches wide.', 36, 'inches', 'warning'),
  ('work_triangle', 'NKBA-41', 'Work Triangle Distance', 'The sum of the three sides of the work triangle should not exceed 26 feet.', NULL, 'feet', 'suggestion'),
  ('work_triangle', 'NKBA-42', 'Work Triangle Minimum', 'No single leg of the work triangle should be less than 4 feet.', 4, 'feet', 'warning'),
  ('appliances', 'NKBA-21', 'Landing Space - Refrigerator', 'Provide at least 15 inches of landing space on the handle side of the refrigerator.', 15, 'inches', 'warning'),
  ('appliances', 'NKBA-22', 'Landing Space - Cooktop', 'Provide at least 12 inches of landing space on one side and 15 inches on the other side of the cooktop.', 12, 'inches', 'critical'),
  ('appliances', 'NKBA-23', 'Landing Space - Sink', 'Provide at least 24 inches of landing space to one side of the sink and 18 inches on the other side.', 18, 'inches', 'warning')
ON CONFLICT (rule_code) DO NOTHING;
