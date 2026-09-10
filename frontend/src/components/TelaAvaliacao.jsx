import { CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import ScoreGauge from './ScoreGauge'

function TelaAvaliacao() {
  const { resultado, setTelaAtiva } = useApp()

  if (!resultado) {
    return (
      <div className="tela">
        <div className="estado-vazio">
          <div className="estado-vazio-icone-box">
            <Sparkles size={24} />
          </div>
          <h2>Nenhuma análise disponível</h2>
          <p>Faça o upload do seu currículo para gerar o diagnóstico de compatibilidade.</p>
          <button className="botao-primario" onClick={() => setTelaAtiva('upload')}>
            Enviar Currículo
          </button>
        </div>
      </div>
    )
  }

  const { avaliacao, vagas_encontradas } = resultado

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">Diagnóstico Concluído</span>
        <h1>Raio-X do seu Perfil Técnico</h1>
        <p className="tela-descricao">
          Avaliação baseada nos padrões de contratação para posições de entrada e estágio em tecnologia.
        </p>
      </header>

      {/* Card Principal de Pontuação */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '28px',
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nível Geral de Aderência
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '6px 0 10px', color: 'var(--text-primary)' }}>
            {avaliacao.nota_geral >= 75 ? 'Excelente Potencial para Estágio' : avaliacao.nota_geral >= 50 ? 'Bom Perfil em Desenvolvimento' : 'Perfil Inicial / Requer Projetos'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            {avaliacao.comentario_geral}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScoreGauge score={avaliacao.nota_geral} tamanho={88} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            Nota do Recrutador
          </span>
        </div>
      </div>

      {/* Grid de Pontos Fortes e Melhorias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Pontos Fortes */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Pontos Fortes Identificados</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {avaliacao.pontos_fortes.map((item, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '13.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  paddingLeft: '14px',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--success)',
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Pontos de Melhoria */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={18} color="var(--warning)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Oportunidades de Evolução</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {avaliacao.pontos_melhoria.map((item, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '13.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  paddingLeft: '14px',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--warning)',
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ação para ver vagas */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="botao-primario" onClick={() => setTelaAtiva('vagas')}>
          <span>Explorar Vagas Compatíveis ({vagas_encontradas?.length || 0})</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default TelaAvaliacao
