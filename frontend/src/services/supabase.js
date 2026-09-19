import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Autentica o usuário com e-mail e senha no Supabase
 */
export async function entrarComEmail(email, senha) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.')
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })
  if (error) throw error
  return data
}

/**
 * Cadastra um novo usuário com e-mail, senha e nome completo
 */
export async function cadastrarComEmail(email, senha, nomeCompleto) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.')
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        full_name: nomeCompleto,
        plan: 'Gratuito',
      },
    },
  })
  if (error) throw error
  return data
}

/**
 * Inicia o fluxo de autenticação com Google OAuth
 */
export async function entrarComGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.')
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  })
  if (error) throw error
  return data
}

/**
 * Encerra a sessão do usuário
 */
export async function deslogar() {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Obtém o perfil sincronizado da tabela 'profiles'
 */
export async function obterPerfil(userId) {
  if (!isSupabaseConfigured || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Aviso ao consultar perfil:', error.message)
    return null
  }
  return data
}

/**
 * Salva uma análise de currículo no banco de dados relacional
 */
export async function salvarAnaliseCurriculo(userId, resultado) {
  if (!isSupabaseConfigured || !userId || !resultado) return null

  try {
    const { data, error } = await supabase
      .from('analysis_reports')
      .insert({
        user_id: userId,
        target_role: resultado.dados_curriculo?.cargo_objetivo || 'Estágio em Tecnologia',
        candidate_name: resultado.dados_curriculo?.nome || 'Candidato',
        overall_score: resultado.avaliacao?.nota_geral || 0,
        parsed_data: resultado.dados_curriculo || {},
        strong_points: resultado.avaliacao?.pontos_fortes || [],
        improvement_points: resultado.avaliacao?.pontos_melhoria || [],
        matched_jobs: resultado.vagas_encontradas || [],
      })
      .select()
      .single()

    if (error) {
      console.warn('Aviso ao persistir análise no Supabase:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.warn('Erro ao salvar relatório:', err)
    return null
  }
}

/**
 * Busca o histórico de análises do usuário autenticado
 */
export async function buscarHistoricoDoBanco(userId) {
  if (!isSupabaseConfigured || !userId) return []

  try {
    const { data, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Erro ao carregar histórico:', err)
    return []
  }
}
