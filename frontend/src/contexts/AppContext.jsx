import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [telaAtiva, setTelaAtiva] = useLocalStorage('vektor_tela_ativa', 'upload')
  const [resultado, setResultado] = useLocalStorage('vektor_resultado', null)
  const [vagaParaAdaptar, setVagaParaAdaptar] = useLocalStorage('vektor_vaga_adaptar', null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [historico, setHistorico] = useState([])
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null)

  function abrirAdaptacaoParaVaga(vaga) {
    setVagaParaAdaptar(vaga)
    setTelaAtiva('adaptar')
  }

  function limparAnaliseAtiva() {
    setResultado(null)
    setVagaParaAdaptar(null)
    setTelaAtiva('upload')
  }

  const value = {
    telaAtiva,
    setTelaAtiva,
    resultado,
    setResultado,
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
    limparAnaliseAtiva,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  return contexto
}
