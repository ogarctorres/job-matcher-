import { useLocalStorage } from '../hooks/useLocalStorage'

function TelaConfiguracoes() {
  const [localizacao, setLocalizacao] = useLocalStorage('jm_localizacao', 'São Paulo')
  const [raioKm, setRaioKm] = useLocalStorage('jm_raio_km', 15)
  const [salvo, setSalvo] = useLocalStorage('jm_salvo', false)

  function salvar(e) {
    e.preventDefault()
    alert('Preferências salvas localmente no navegador!')
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Preferências</p>
        <h1>Configurações de Busca</h1>
        <p className="tela-descricao">
          Ajuste as preferências regionais para personalização dos resultados de busca de vagas e tendências de mercado.
        </p>
      </header>

      <form onSubmit={salvar} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontFamily: 'var(--fonte-dado)' }}>
            LOCALIZAÇÃO PADRÃO
          </label>
          <input
            type="text"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid var(--linha)',
              backgroundColor: 'var(--papel)',
              color: 'var(--tinta)',
              fontFamily: 'var(--fonte-corpo)',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontFamily: 'var(--fonte-dado)' }}>
            RAIO MÁXIMO DE DISTÂNCIA (KM): {raioKm} km
          </label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={raioKm}
            onChange={(e) => setRaioKm(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" className="botao-buscar" style={{ alignSelf: 'flex-start' }}>
          Salvar Configurações
        </button>
      </form>
    </div>
  )
}

export default TelaConfiguracoes
