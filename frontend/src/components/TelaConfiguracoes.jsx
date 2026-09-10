import { useState } from 'react'
import { MapPin, Sliders, Check } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

function TelaConfiguracoes() {
  const [localizacao, setLocalizacao] = useLocalStorage('jm_localizacao', 'São Paulo')
  const [raioKm, setRaioKm] = useLocalStorage('jm_raio_km', 25)
  const [salvo, setSalvo] = useState(false)

  function salvar(e) {
    e.preventDefault()
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">Preferências do Sistema</span>
        <h1>Configurações de Busca e Filtros</h1>
        <p className="tela-descricao">
          Defina as preferências regionais que servem de base para a busca de vagas e tendências de mercado.
        </p>
      </header>

      <form
        onSubmit={salvar}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <MapPin size={15} color="var(--accent)" />
            <span>Cidade / Região Padrão</span>
          </label>
          <input
            type="text"
            className="campo-busca-input"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            placeholder="Ex: São Paulo, Rio de Janeiro, Remoto..."
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Usado como parâmetro primário para consultar vagas na Jooble e Adzuna.
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Sliders size={15} color="var(--accent)" />
              <span>Raio de Distância</span>
            </label>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
              {raioKm} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={raioKm}
            onChange={(e) => setRaioKm(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            As preferências são salvas localmente no navegador.
          </span>
          <button type="submit" className="botao-primario">
            {salvo ? (
              <>
                <Check size={16} />
                <span>Salvo!</span>
              </>
            ) : (
              <span>Salvar Preferências</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TelaConfiguracoes
