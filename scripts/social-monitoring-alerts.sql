-- Social Media Monitoring Alerts Table
CREATE TABLE IF NOT EXISTS social_monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  platform VARCHAR(50),
  details JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created ON social_monitoring_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_type ON social_monitoring_alerts(type);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_acknowledged ON social_monitoring_alerts(acknowledged);

-- Enable RLS
ALTER TABLE social_monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Admin access policy
CREATE POLICY "Admin full access to monitoring alerts" ON social_monitoring_alerts
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');