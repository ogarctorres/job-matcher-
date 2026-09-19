import { CheckCircle2, AlertCircle, ArrowRight, FileCheck, GraduationCap, Code2, FolderGit2, ChevronRight } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import ScoreGauge from './ScoreGauge'

function TelaAvaliacao() {
  const { resultado, setTelaAtiva } = useApp()

  if (!resultado) {
    return (
      <div className="tela">
        <div className="estado-vazio">
          <div className="estado-vazio-icone-box">
            <FileCheck size={24} />
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
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

      {/* Plano de Ação Pedagógico & Próximos Passos de Estudo */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Plano de Ação Pedagógico & Próximos Passos
            </h3>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', backgroundColor: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            Estratégia de Carreira Vektor
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Card 1: Treino no LeetCode */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Code2 size={16} color="var(--accent)" />
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Praticar Testes Técnicos
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Recrutadores de estágio costumam cobrar algoritmos básicos, manipulação de dados e consultas SQL. Exercite sua lógica no nosso módulo interativo.
              </p>
            </div>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setTelaAtiva('desafios')}
              style={{ fontSize: '12px', padding: '6px 12px', borderColor: 'var(--accent-border)' }}
            >
              <span>Ir para LeetCode Universitário</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 2: Portfólio & GitHub */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FolderGit2 size={16} color="var(--success)" />
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Fortalecer Repositórios GitHub
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Para compensar os pontos de melhoria, crie ou documente projetos demonstrando testes automatizados, boas práticas de commit e documentação clara com README.
              </p>
            </div>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setTelaAtiva('vagas')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <span>Ver Stacks em Alta nas Vagas</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Ações inferiores de Navegação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button className="botao-secundario" onClick={() => setTelaAtiva('desafios')}>
          <Code2 size={15} color="var(--accent)" />
          <span>Treinar Código no LeetCode</span>
        </button>

        <button className="botao-primario" onClick={() => setTelaAtiva('vagas')}>
          <span>Explorar Vagas Compatíveis ({vagas_encontradas?.length || 0})</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default TelaAvaliacao
