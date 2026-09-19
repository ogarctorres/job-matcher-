import { useState, useEffect } from 'react'
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import {
  entrarComEmail,
  cadastrarComEmail,
  entrarComGoogle,
} from '../services/supabase'
import LogoVektor from './LogoVektor'

function TelaAuthGate() {
  const [modo, setModo] = useState('login') // 'login' | 'cadastro'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroAuth, setErroAuth] = useState(null)
  const [avisoConfirmacao, setAvisoConfirmacao] = useState(false)

  useEffect(() => {
    setErroAuth(null)
    setAvisoConfirmacao(false)
  }, [modo])

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setErroAuth(null)

    try {
      if (modo === 'login') {
        await entrarComEmail(email.trim(), senha)
        setSucesso(true)
      } else {
        const res = await cadastrarComEmail(email.trim(), senha, nome.trim())
        if (res?.user && !res?.session) {
          setAvisoConfirmacao(true)
        } else {
          setSucesso(true)
        }
      }
    } catch (err) {
      console.error('Erro na autenticação:', err)
      let msg = err.message || 'Erro ao processar autenticação.'
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos. Verifique suas credenciais.'
      } else if (msg.includes('Password should be at least')) {
        msg = 'A senha deve conter no mínimo 6 caracteres.'
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado. Tente entrar na sua conta.'
      }
      setErroAuth(msg)
    } finally {
      setCarregando(false)
    }
  }

  async function handleGoogleLogin() {
    setCarregando(true)
    setErroAuth(null)

    try {
      await entrarComGoogle()
    } catch (err) {
      console.error('Erro Google OAuth:', err)
      setErroAuth(err.message || 'Erro ao iniciar autenticação com Google.')
      setCarregando(false)
    }
  }

  return (
    <div className="auth-gate-container">
      {/* Background Decorativo Sutil estilo Linear/Raycast */}
      <div className="auth-gate-bg-glow" />
      <div className="auth-gate-grid-pattern" />

      {/* Topo do Portal com Logo */}
      <header className="auth-gate-header">
        <div className="auth-gate-logo-wrapper">
          <LogoVektor tamanho={28} />
          <span className="auth-gate-brand-nome">VEKTOR</span>
        </div>
        <div className="auth-gate-badge-status">
          <span className="auth-gate-status-dot" />
          <span>Acesso Restrito • Autenticação Obrigatória</span>
        </div>
      </header>

      {/* Card Central de Autenticação */}
      <main className="auth-gate-card-wrapper">
        <div className="auth-gate-card">
          <div className="auth-gate-card-header">
            <h1 className="auth-gate-titulo">
              {modo === 'login' ? 'Acesse a Plataforma' : 'Crie sua Conta Profissional'}
            </h1>
            <p className="auth-gate-subtitulo">
              {modo === 'login'
                ? 'Entre para consultar seus diagnósticos, vagas e simulações técnicas.'
                : 'Diagnóstico factual de currículos, triagem ATS e preparação para vagas de tecnologia.'}
            </p>
          </div>

          {/* Abas Alternadoras Entrar / Cadastrar */}
          <div className="auth-gate-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'login'}
              className={`auth-gate-tab ${modo === 'login' ? 'ativa' : ''}`}
              onClick={() => setModo('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'cadastro'}
              className={`auth-gate-tab ${modo === 'cadastro' ? 'ativa' : ''}`}
              onClick={() => setModo('cadastro')}
            >
              Criar Conta Grátis
            </button>
          </div>

          {/* Banner de Confirmação por E-mail (Quando o usuário cadastra) */}
          {avisoConfirmacao ? (
            <div className="auth-gate-alerta-sucesso">
              <div className="auth-gate-icone-check">
                <CheckCircle2 size={26} color="var(--success)" />
              </div>
              <h3 className="auth-gate-confirmacao-titulo">Quase pronto! Confirme seu e-mail</h3>
              <p className="auth-gate-confirmacao-texto">
                Enviamos um e-mail de ativação para <strong>{email}</strong>. Abra sua caixa de entrada e clique no link
                oficial para liberar seu acesso instantâneo ao Vektor.
              </p>
              <button
                type="button"
                className="botao-secundario"
                style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
                onClick={() => setModo('login')}
              >
                Voltar para tela de Login
              </button>
            </div>
          ) : (
            <>
              {/* Botão Oficial Google OAuth */}
              <button
                type="button"
                className="auth-gate-botao-google"
                onClick={handleGoogleLogin}
                disabled={carregando}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              {/* Divisor */}
              <div className="auth-gate-divisor">
                <div className="auth-gate-divisor-linha" />
                <span>ou continue com e-mail</span>
                <div className="auth-gate-divisor-linha" />
              </div>

              {/* Mensagem de Erro */}
              {erroAuth && (
                <div className="auth-gate-erro" role="alert">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{erroAuth}</span>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="auth-gate-form">
                {modo === 'cadastro' && (
                  <div className="auth-gate-campo">
                    <label className="auth-gate-label">Nome Completo</label>
                    <div className="auth-gate-input-wrapper">
                      <User size={15} className="auth-gate-input-icone" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Seu Nome Completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="auth-gate-input"
                      />
                    </div>
                  </div>
                )}

                <div className="auth-gate-campo">
                  <label className="auth-gate-label">E-mail Profissional ou Pessoal</label>
                  <div className="auth-gate-input-wrapper">
                    <Mail size={15} className="auth-gate-input-icone" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-gate-input"
                    />
                  </div>
                </div>

                <div className="auth-gate-campo">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="auth-gate-label">Senha</label>
                    {modo === 'login' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Mínimo 6 caracteres
                      </span>
                    )}
                  </div>
                  <div className="auth-gate-input-wrapper">
                    <Lock size={15} className="auth-gate-input-icone" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="auth-gate-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="botao-primario auth-gate-botao-submit"
                  disabled={carregando}
                >
                  {sucesso ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Acesso Concedido</span>
                    </>
                  ) : (
                    <>
                      <span>{carregando ? 'Processando...' : modo === 'login' ? 'Entrar na Plataforma' : 'Criar Minha Conta Grátis'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Rodapé do Card */}
          <footer className="auth-gate-card-footer">
            <div className="auth-gate-seguranca">
              <ShieldCheck size={13} color="var(--success)" />
              <span>Autenticação Supabase • PostgreSQL com RLS ativo</span>
            </div>
            <div className="auth-gate-status-pill">
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ● Conexão Segura Supabase Ativa
              </span>
            </div>
          </footer>
        </div>

        {/* Recursos em Destaque do Vektor */}
        <div className="auth-gate-features-grid">
          <div className="auth-gate-feature-item">
            <Sparkles size={16} color="var(--accent)" />
            <div>
              <span className="feature-titulo">Triagem ATS Factual</span>
              <p className="feature-desc">Mapeamento de aderência a requisitos corporativos sem alucinação de IA.</p>
            </div>
          </div>
          <div className="auth-gate-feature-item">
            <CheckCircle2 size={16} color="var(--success)" />
            <div>
              <span className="feature-titulo">Histórico e Vagas em Tempo Real</span>
              <p className="feature-desc">Cruzamento inteligente com oportunidades de tecnologia no Brasil.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Legal Discreto */}
      <footer className="auth-gate-bottom-footer">
        <span>© 2026 Vektor Carreiras • Diagnóstico Factual para Universitários</span>
        <div className="auth-gate-bottom-links">
          <span>Privacidade</span>
          <span>•</span>
          <span>Termos de Uso</span>
          <span>•</span>
          <span style={{ color: 'var(--success)' }}>● Sistema Operacional</span>
        </div>
      </footer>
    </div>
  )
}

export default TelaAuthGate
