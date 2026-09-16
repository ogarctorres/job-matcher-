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

  adaptarCurriculo: ({ textoCurriculo, dadosCurriculo, descricaoVaga, tituloVaga, modoGenerico }) => {
    return request('/adaptar-curriculo', {
      method: 'POST',
      body: JSON.stringify({
        texto_curriculo: textoCurriculo,
        dados_curriculo: dadosCurriculo,
        descricao_vaga: descricaoVaga,
        titulo_vaga: tituloVaga,
        modo_generico: modoGenerico,
      }),
    })
  },

  gerarCurriculoGenerico: ({ textoCurriculo, dadosCurriculo }) => {
    return request('/gerar-curriculo-generico', {
      method: 'POST',
      body: JSON.stringify({
        texto_curriculo: textoCurriculo,
        dados_curriculo: dadosCurriculo,
      }),
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
