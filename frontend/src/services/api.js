/**
 * Cliente HTTP centralizado para consumo da API do Job Matcher.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = options.headers || {}

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
  enviarCurriculo: (arquivo) => {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
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

  // Histórico
  listarHistorico: () => request('/historico/'),
  detalheAnalise: (id) => request(`/historico/${id}`),
  deletarAnalise: (id) => request(`/historico/${id}`, { method: 'DELETE' }),

  // Dashboard & Tendências
  obterEstatisticas: () => request('/estatisticas/'),
  obterTendencias: (termo, localizacao) => {
    const params = new URLSearchParams()
    if (termo) params.append('termo', termo)
    if (localizacao) params.append('localizacao', localizacao)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return request(`/tendencias/${queryString}`)
  },

  // Health
  checarSaude: () => request('/health'),
}
