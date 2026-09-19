-- ==============================================================================
-- VEKTOR CARREIRAS - SCHEMA DO BANCO DE DADOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Instruções de Execução:
-- 1. Acesse o painel do seu projeto no Supabase: https://supabase.com/dashboard
-- 2. No menu lateral, clique em "SQL Editor"
-- 3. Cole este script completo e clique em "Run" (Executar)
-- ==============================================================================

-- 1. Tabela de Perfis de Usuário (vinculada à tabela nativa auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'Gratuito',
  institution TEXT,
  graduation_forecast TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabela de Relatórios de Análise de Currículo (Diagnóstico Factual & Vagas)
CREATE TABLE IF NOT EXISTS public.analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  candidate_name TEXT,
  target_role TEXT,
  overall_score INTEGER,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  strong_points JSONB DEFAULT '[]'::jsonb,
  improvement_points JSONB DEFAULT '[]'::jsonb,
  matched_jobs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Habilitação de Segurança por Linha (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela public.profiles
CREATE POLICY "Usuários podem visualizar apenas seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Permite inserção pelo próprio usuário no cadastro"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas de RLS para a tabela public.analysis_reports
CREATE POLICY "Usuários podem visualizar apenas suas próprias análises"
  ON public.analysis_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem salvar apenas análises vinculadas a seu ID"
  ON public.analysis_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias análises"
  ON public.analysis_reports FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Função e Trigger para criação automática de perfil ao registrar novo usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Estudante Vektor'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    'Gratuito'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador no evento de criação de novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_id ON public.analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_created_at ON public.analysis_reports(created_at DESC);
