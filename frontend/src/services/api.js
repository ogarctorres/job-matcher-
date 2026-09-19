/**
 * Cliente HTTP centralizado para consumo da API do Job Matcher.
 */

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
// Remove qualquer barra no final para evitar //curriculo (que gera 404 Not Found)
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

async function request(endpoint, options = {}) {
  const caminhoLimpo = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${caminhoLimpo}`
  const headers = options.headers || {}

  // Sincroniza preferências salvas em TelaConfiguracoes (BUG-07)
  try {
    const locSalva = window.localStorage.getItem('jm_localizacao')
    if (locSalva) {
      const locFormatada = JSON.parse(locSalva)
      if (locFormatada && !headers['X-Localizacao']) {
        headers['X-Localizacao'] = String(locFormatada)
      }
    }
    const raioSalvo = window.localStorage.getItem('jm_raio_km')
    if (raioSalvo) {
      const raioFormatado = JSON.parse(raioSalvo)
      if (raioFormatado && !headers['X-Raio-Km']) {
        headers['X-Raio-Km'] = String(raioFormatado)
      }
    }
  } catch {
    // Ignora restrições ou erros de leitura do localStorage
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let mensagemErro = 'Erro na requisição'
    try {
      const dadosErro = await response.json()
      mensagemErro = dadosErro.detail || dadosErro.message || mensagemErro
    } catch {
      // Falha ao parsear JSON
    }
    throw new Error(mensagemErro)
  }

  return response.json()
}

export const api = {
  // Currículo
  carregarDemo: () => request('/curriculo/demo'),

  enviarCurriculo: (arquivo, localizacao) => {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    const loc = localizacao || (() => {
      try {
        const item = window.localStorage.getItem('jm_localizacao')
        return item ? JSON.parse(item) : null
      } catch {
        return null
      }
    })()
    if (loc) {
      formData.append('localizacao', String(loc))
    }
    return request('/curriculo', { method: 'POST', body: formData })
  },

  gerarSugestao: (dadosCurriculo, vaga) => {
    return request('/sugestao-vaga', {
      method: 'POST',
      body: JSON.stringify({ dados_curriculo: dadosCurriculo, vaga }),
    })
  },

  gerarCarta: (dadosCurriculo, vaga) => {
    return request('/carta', {
      method: 'POST',
      body: JSON.stringify({ dados_curriculo: dadosCurriculo, vaga }),
    })
  },

  adaptarCurriculo: ({ analiseId, textoCurriculo, dadosCurriculo, descricaoVaga, tituloVaga, modoGenerico }) => {
    return request('/adaptar-curriculo', {
      method: 'POST',
      body: JSON.stringify({
        analise_id: analiseId || null,
        texto_curriculo: textoCurriculo,
        dados_curriculo: dadosCurriculo,
        descricao_vaga: descricaoVaga,
        titulo_vaga: tituloVaga,
        modo_generico: modoGenerico,
      }),
    })
  },

  gerarCurriculoGenerico: ({ analiseId, textoCurriculo, dadosCurriculo }) => {
    return request('/gerar-curriculo-generico', {
      method: 'POST',
      body: JSON.stringify({
        analise_id: analiseId || null,
        texto_curriculo: textoCurriculo,
        dados_curriculo: dadosCurriculo,
      }),
    })
  },

  // Histórico de Análises
  listarHistorico: () => request('/historico/'),
  detalheAnalise: (id) => request(`/historico/${id}`),
  deletarAnalise: (id) => request(`/historico/${id}`, { method: 'DELETE' }),

  // Histórico de Currículos Adaptados
  listarAdaptacoes: (analiseId) => request(`/adaptar-curriculo/historico/${analiseId}`),
  obterAdaptacao: (id) => request(`/adaptar-curriculo/${id}`),
  deletarAdaptacao: (id) => request(`/adaptar-curriculo/${id}`, { method: 'DELETE' }),

  // Dashboard & Tendências
  obterEstatisticas: () => request('/estatisticas/'),
  obterTendencias: (termo, localizacao) => {
    const loc = localizacao || (() => {
      try {
        const item = window.localStorage.getItem('jm_localizacao')
        return item ? JSON.parse(item) : null
      } catch {
        return null
      }
    })()
    const params = new URLSearchParams()
    if (termo) params.append('termo', termo)
    if (loc) params.append('localizacao', loc)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return request(`/tendencias/${queryString}`)
  },

  // Busca Dinâmica de Vagas no Mercado
  buscarVagasMercado: (termo, localizacao, dadosCurriculo) => {
    return request('/vagas/buscar', {
      method: 'POST',
      body: JSON.stringify({
        termo,
        localizacao: localizacao || null,
        dados_curriculo: dadosCurriculo || null,
      }),
    })
  },

  // Desafios Técnicos & LeetCode do Estudante
  obterTrilhasDesafios: () => request('/desafios/trilhas'),
  gerarDesafiosVaga: ({ tituloVaga, stack, descricaoVaga }) => {
    return request('/desafios/gerar', {
      method: 'POST',
      body: JSON.stringify({
        titulo_vaga: tituloVaga || null,
        stack: stack || null,
        descricao_vaga: descricaoVaga || null,
      }),
    })
  },

  // Health
  checarSaude: () => request('/health'),
}

