import { createClient } from '@supabase/supabase-js'

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  const localUrl = typeof window !== 'undefined' ? window.localStorage.getItem('vektor_supabase_url') || '' : ''
  const localKey = typeof window !== 'undefined' ? window.localStorage.getItem('vektor_supabase_key') || '' : ''

  const url = (envUrl && !envUrl.includes('placeholder') && !envUrl.includes('seu-projeto') ? envUrl : localUrl)?.trim()
  const key = (envKey && !envKey.includes('placeholder') && !envKey.includes('sua-chave') ? envKey : localKey)?.trim()

  const isConfigured = Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co')
  )

  return { url, key, isConfigured }
}

const creds = getSupabaseCredentials()
export const isSupabaseConfigured = creds.isConfigured

export const supabase = isSupabaseConfigured
  ? createClient(creds.url, creds.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Salva credenciais do Supabase no navegador e reinicia o cliente
 */
export function salvarConfiguracaoSupabase(url, key) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('vektor_supabase_url', (url || '').trim())
    window.localStorage.setItem('vektor_supabase_key', (key || '').trim())
    window.location.reload()
  }
}

/**
 * Limpa credenciais locais
 */
export function limparConfiguracaoSupabase() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('vektor_supabase_url')
    window.localStorage.removeItem('vektor_supabase_key')
    window.location.reload()
  }
}

/**
 * Autentica o usuário com e-mail e senha no Supabase
 */
export async function entrarComEmail(email, senha) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não conectado. Configure sua URL e Chave Anon para realizar login real.')
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  })
  if (error) throw error
  return data
}

/**
 * Cadastra um novo usuário com e-mail, senha e nome completo,
 * disparando o envio de e-mail de confirmação real pelo Supabase.
 */
export async function cadastrarComEmail(email, senha, nomeCompleto) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não conectado. Configure sua URL e Chave Anon para cadastrar sua conta.')
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
    options: {
      data: {
        full_name: (nomeCompleto || '').trim(),
        plan: 'Gratuito',
      },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    },
  })
  if (error) throw error
  return data
}

/**
 * Inicia o fluxo de autenticação com Google OAuth oficial
 */
export async function entrarComGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não conectado. Configure o Supabase para utilizar Google OAuth.')
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
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
