import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [telaAtiva, setTelaAtiva] = useState('upload')
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [historico, setHistorico] = useState([])
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null)
  const [vagaParaAdaptar, setVagaParaAdaptar] = useState(null)

  function abrirAdaptacaoParaVaga(vaga) {
    setVagaParaAdaptar(vaga)
    setTelaAtiva('adaptar')
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
