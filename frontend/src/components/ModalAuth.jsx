import { useState, useEffect } from 'react'
import { X, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import LogoVektor from './LogoVektor'

function ModalAuth() {
  const { modalAuthAberta, fecharModalAuth, modoAuth, setModoAuth, fazerLogin } = useApp()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (modalAuthAberta) {
      setSucesso(false)
      setCarregando(false)
    }
  }, [modalAuthAberta])

  if (!modalAuthAberta) return null

  function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)

    setTimeout(() => {
      fazerLogin({
        nome: nome.trim() || (modoAuth === 'login' ? 'Lucas Mendes' : 'Estudante Vektor'),
        email: email.trim() || 'estudante@vektor.com',
        plano: 'Gratuito',
      })
      setSucesso(true)
      setTimeout(() => {
        fecharModalAuth()
      }, 700)
    }, 600)
  }

  function handleGoogleLogin() {
    setCarregando(true)
    setTimeout(() => {
      fazerLogin({
        nome: 'Lucas Mendes',
        email: 'lucas.mendes@gmail.com',
        avatar: 'LM',
        plano: 'Gratuito',
      })
      setSucesso(true)
      setTimeout(() => {
        fecharModalAuth()
      }, 600)
    }, 500)
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={fecharModalAuth}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 9, 11, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div
        className="modal-auth-conteudo"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 30px',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
        }}
      >
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={fecharModalAuth}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Fechar janela de autenticação"
        >
          <X size={18} />
        </button>

        {/* Topo / Logo & Título */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <LogoVektor tamanho={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            {modoAuth === 'login' ? 'Acesse sua conta Vektor' : 'Criar conta profissional'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            {modoAuth === 'login'
              ? 'Consulte seus diagnósticos, vagas salvas e treinos técnicos.'
              : 'Salve o histórico do seu currículo e desbloqueie relatórios completos.'}
          </p>
        </div>

        {/* Login com Google (1 clique rápido) */}
        <button
          type="button"
          className="botao-secundario"
          onClick={handleGoogleLogin}
          disabled={carregando}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '18px 0',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <span>ou e-mail</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* Formulário de Autenticação */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {modoAuth === 'cadastro' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Nome Completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  required
                  placeholder="Lucas Mendes"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              E-mail Institucional ou Pessoal
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="email"
                required
                placeholder="seu.email@universidade.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="botao-primario"
            disabled={carregando}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '13.5px',
              fontWeight: 600,
              marginTop: '4px',
              justifyContent: 'center',
            }}
          >
            {sucesso ? (
              <>
                <CheckCircle2 size={16} />
                <span>Autenticado com Sucesso</span>
              </>
            ) : (
              <>
                <span>{modoAuth === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Gratuita'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé / Alternância entre Login e Cadastro */}
        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)' }}>
          {modoAuth === 'login' ? (
            <span>
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setModoAuth('cadastro')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cadastre-se grátis
              </button>
            </span>
          ) : (
            <span>
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setModoAuth('login')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Fazer login
              </button>
            </span>
          )}
        </div>

        {/* Garantia de Privacidade */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
          <ShieldCheck size={13} color="var(--success)" />
          <span>Seus dados são criptografados e estritamente confidenciais.</span>
        </div>
      </div>
    </div>
  )
}

export default ModalAuth
