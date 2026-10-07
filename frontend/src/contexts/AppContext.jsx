import { createContext, useContext, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { obterSessaoAtual, deslogar } from '../services/auth'

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
  const [vagaParaRoadmap, setVagaParaRoadmap] = useLocalStorage('vektor_vaga_roadmap', null)
  const [usuario, setUsuario] = useLocalStorage('vektor_usuario', null)
  const [modalAuthAberta, setModalAuthAberta] = useState(false)
  const [modoAuth, setModoAuth] = useState('login')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [historico, setHistorico] = useState([])
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null)

  // Salva no estado local e persiste automaticamente
  function setResultado(novoResultado) {
    setResultadoState(novoResultado)
  }

  const [carregandoSessao, setCarregandoSessao] = useState(true)
  const [estaDesbloqueando, setEstaDesbloqueando] = useState(false)

  // Sincronização de sessão nativa e local
  useEffect(() => {
    let montado = true

    async function sincronizarSessao() {
      try {
        const sessao = await obterSessaoAtual()
        if (!montado) return
        if (sessao?.usuario) {
          setUsuario(sessao.usuario)
        }
      } catch (err) {
        console.warn('Aviso ao sincronizar sessão:', err)
      } finally {
        if (montado) {
          setCarregandoSessao(false)
        }
      }
    }

    sincronizarSessao()

    return () => {
      montado = false
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
      await deslogar()
    } catch (err) {
      console.warn('Erro ao encerrar sessão:', err)
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

  function abrirRoadmapParaVaga(vaga) {
    setVagaParaRoadmap(vaga)
    setTelaAtiva('roadmap')
  }

  function limparAnaliseAtiva() {
    setResultado(null)
    setVagaParaAdaptar(null)
    setVagaParaDesafio(null)
    setVagaParaRoadmap(null)
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
    vagaParaRoadmap,
    setVagaParaRoadmap,
    abrirRoadmapParaVaga,
    limparAnaliseAtiva,
    carregandoSessao,
    estaDesbloqueando,
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
