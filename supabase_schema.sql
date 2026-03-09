-- Código SQL para criar a tabela Lead no Supabase
-- Cole isso no SQL Editor do Supabase e execute

CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados pessoais
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  
  -- Dados do veículo
  "vehicleBrand" TEXT NOT NULL,
  "vehicleModel" TEXT NOT NULL,
  "vehicleYear" TEXT NOT NULL,
  "km" TEXT NOT NULL,
  
  -- Qualificação
  "urgency" TEXT NOT NULL,           -- hoje, 3dias, 7dias, sem_pressa
  "discountAcceptance" TEXT NOT NULL, -- 10, 15, 20, fipe
  "docsStatus" TEXT NOT NULL,        -- regular, pendencias, nao_sei
  "financeStatus" TEXT NOT NULL,     -- sim, nao
  
  -- Scoring
  "score" INTEGER DEFAULT 0,         -- 0-100
  "tier" TEXT DEFAULT 'cold',          -- hot, warm, cold
  "qualified" BOOLEAN DEFAULT FALSE,
  
  -- Fotos (JSON array de URLs)
  "photos" TEXT DEFAULT '[]',
  
  -- Tracking
  "utmSource" TEXT DEFAULT '',
  "utmMedium" TEXT DEFAULT '',
  "utmCampaign" TEXT DEFAULT '',
  "gclid" TEXT DEFAULT '',
  
  -- Status do lead
  "status" TEXT DEFAULT 'new',       -- new, contacted, negotiating, converted, lost
  "notes" TEXT DEFAULT '',
  
  -- Consentimento LGPD
  "lgpdConsent" BOOLEAN DEFAULT FALSE,
  "lgpdConsentAt" TIMESTAMP WITH TIME ZONE
);

-- Índices úteis para consultas frequentes
CREATE INDEX IF NOT EXISTS "idx_lead_tier" ON "Lead"("tier");
CREATE INDEX IF NOT EXISTS "idx_lead_status" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "idx_lead_score" ON "Lead"("score" DESC);
CREATE INDEX IF NOT EXISTS "idx_lead_created" ON "Lead"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_lead_city" ON "Lead"("city");

-- Trigger para atualizar o updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_lead_updated_at ON "Lead";
CREATE TRIGGER update_lead_updated_at
  BEFORE UPDATE ON "Lead"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissões RLS (Row Level Security) - necessário para Supabase
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (para o formulário funcionar)
CREATE POLICY "Allow public insert" ON "Lead"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Política para leitura (apenas autenticado, se quiser proteger)
-- Você pode remover isso se quiser deixar público para testes
CREATE POLICY "Allow authenticated read" ON "Lead"
  FOR SELECT
  TO PUBLIC
  USING (true);
