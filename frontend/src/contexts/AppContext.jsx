import { createContext, useContext, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  supabase,
  isSupabaseConfigured,
  obterPerfil,
  deslogar,
  salvarAnaliseCurriculo,
  buscarHistoricoDoBanco,
} from '../services/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [telaAtiva, setTelaAtiva] = useState(() => {
    try {
      window.localStorage.removeItem('vektor_tela_ativa')
      const sessao = window.sessionStorage.getItem('vektor_tela_ativa')
      return sessao ? JSON.parse(sessao) : 'upload'
    } catch {
      return 'upload'
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem('vektor_tela_ativa', JSON.stringify(telaAtiva))
    } catch {
      // Ignora erro
    }
  }, [telaAtiva])

  const [resultado, setResultadoState] = useLocalStorage('vektor_resultado', null)
  const [vagaParaAdaptar, setVagaParaAdaptar] = useLocalStorage('vektor_vaga_adaptar', null)
  const [vagaParaDesafio, setVagaParaDesafio] = useLocalStorage('vektor_vaga_desafio', null)
  const [usuario, setUsuario] = useLocalStorage('vektor_usuario', null)
  const [modalAuthAberta, setModalAuthAberta] = useState(false)
  const [modoAuth, setModoAuth] = useState('login')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [historico, setHistorico] = useState([])
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null)

  // Salva no estado local e persiste automaticamente no Supabase (se autenticado)
  function setResultado(novoResultado) {
    setResultadoState(novoResultado)
    if (novoResultado && usuario?.id && isSupabaseConfigured) {
      salvarAnaliseCurriculo(usuario.id, novoResultado).then((relatorioSalvo) => {
        if (relatorioSalvo) {
          setHistorico((prev) => [relatorioSalvo, ...prev.filter((r) => r.id !== relatorioSalvo.id)])
        }
      })
    }
  }

  // Sincronização em tempo real de sessão com Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    let montado = true

    async function sincronizarSessao() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!montado) return
        if (session?.user) {
          const perfil = await obterPerfil(session.user.id)
          const usuarioSupabase = {
            id: session.user.id,
            email: session.user.email,
            nome: perfil?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar: (perfil?.full_name || session.user.email || 'VK').slice(0, 2).toUpperCase(),
            avatarUrl: perfil?.avatar_url || session.user.user_metadata?.avatar_url,
            plano: perfil?.plan || 'Gratuito',
            membroDesde: new Date(session.user.created_at).getFullYear(),
          }
          setUsuario(usuarioSupabase)

          // Carrega histórico relacional do usuário
          const relatorios = await buscarHistoricoDoBanco(session.user.id)
          if (montado && relatorios?.length > 0) {
            setHistorico(relatorios)
          }
        }
      } catch (err) {
        console.warn('Aviso na sincronização com Supabase:', err)
      }
    }

    sincronizarSessao()

    // Listener para eventos de login, logout e OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evento, session) => {
      if (!montado) return
      if (session?.user) {
        const perfil = await obterPerfil(session.user.id)
        const usuarioSupabase = {
          id: session.user.id,
          email: session.user.email,
          nome: perfil?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar: (perfil?.full_name || session.user.email || 'VK').slice(0, 2).toUpperCase(),
          avatarUrl: perfil?.avatar_url || session.user.user_metadata?.avatar_url,
          plano: perfil?.plan || 'Gratuito',
          membroDesde: new Date(session.user.created_at).getFullYear(),
        }
        setUsuario(usuarioSupabase)
      } else if (evento === 'SIGNED_OUT') {
        setUsuario(null)
      }
    })

    return () => {
      montado = false
      subscription?.unsubscribe()
    }
  }, [setUsuario])

  function abrirModalAuth(modo = 'login') {
    setModoAuth(modo)
    setModalAuthAberta(true)
  }

  function fecharModalAuth() {
    setModalAuthAberta(false)
  }

  function fazerLogin(dados = {}) {
    if (!dados || (!dados.email && !dados.nome)) return null
    const nome = dados.nome || dados.email?.split('@')[0] || 'Usuário'
    const email = dados.email || ''
    const usuarioLogado = {
      nome,
      email,
      avatar: (nome || 'VK').slice(0, 2).toUpperCase(),
      plano: dados.plano || 'Gratuito',
      membroDesde: '2026',
    }
    setUsuario(usuarioLogado)
    setModalAuthAberta(false)
    return usuarioLogado
  }

  async function fazerLogout() {
    try {
      if (isSupabaseConfigured) {
        await deslogar()
      }
    } catch (err) {
      console.warn('Erro ao deslogar do Supabase:', err)
    } finally {
      setUsuario(null)
    }
  }

  function abrirAdaptacaoParaVaga(vaga) {
    setVagaParaAdaptar(vaga)
    setTelaAtiva('adaptar')
  }

  function abrirDesafiosParaVaga(vaga) {
    setVagaParaDesafio(vaga)
    setTelaAtiva('desafios')
  }

  function limparAnaliseAtiva() {
    setResultado(null)
    setVagaParaAdaptar(null)
    setVagaParaDesafio(null)
    setTelaAtiva('upload')
  }

  const value = {
    telaAtiva,
    setTelaAtiva,
    resultado,
    setResultado,
    usuario,
    setUsuario,
    modalAuthAberta,
    setModalAuthAberta,
    modoAuth,
    setModoAuth,
    abrirModalAuth,
    fecharModalAuth,
    fazerLogin,
    fazerLogout,
    carregando,
    setCarregando,
    erro,
    setErro,
    historico,
    setHistorico,
    analiseSelecionada,
    setAnaliseSelecionada,
    vagaParaAdaptar,
    setVagaParaAdaptar,
    abrirAdaptacaoParaVaga,
    vagaParaDesafio,
    setVagaParaDesafio,
    abrirDesafiosParaVaga,
    limparAnaliseAtiva,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  return contexto
}
