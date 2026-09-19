import { useState, useEffect } from 'react'
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import {
  entrarComEmail,
  cadastrarComEmail,
  entrarComGoogle,
} from '../services/supabase'
import LogoVektor from './LogoVektor'

function ModalAuth() {
  const { modalAuthAberta, fecharModalAuth, modoAuth, setModoAuth } = useApp()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroAuth, setErroAuth] = useState(null)
  const [avisoConfirmacao, setAvisoConfirmacao] = useState(false)

  useEffect(() => {
    if (modalAuthAberta) {
      setSucesso(false)
      setCarregando(false)
      setErroAuth(null)
      setAvisoConfirmacao(false)
    }
  }, [modalAuthAberta, modoAuth])

  if (!modalAuthAberta) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setErroAuth(null)

    try {
      if (modoAuth === 'login') {
        await entrarComEmail(email.trim(), senha)
        setSucesso(true)
        setTimeout(() => fecharModalAuth(), 600)
      } else {
        const res = await cadastrarComEmail(email.trim(), senha, nome.trim())
        if (res?.user && !res?.session) {
          setAvisoConfirmacao(true)
        } else {
          setSucesso(true)
          setTimeout(() => fecharModalAuth(), 700)
        }
      }
    } catch (err) {
      console.error('Erro na autenticação Supabase:', err)
      let msg = err.message || 'Erro ao processar autenticação.'
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos. Verifique seus dados.'
      } else if (msg.includes('Password should be at least')) {
        msg = 'A senha deve conter no mínimo 6 caracteres.'
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado. Tente fazer login.'
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

        {/* Alerta de Confirmação por E-mail (Supabase) */}
        {avisoConfirmacao ? (
          <div
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 20px',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <CheckCircle2 size={24} color="var(--success)" />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Quase pronto! Confirme seu e-mail
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.45' }}>
              Enviamos um e-mail de ativação para <strong>{email}</strong>. Abra sua caixa de entrada e clique no link para liberar seu acesso à plataforma.
            </p>
            <button
              type="button"
              className="botao-secundario"
              onClick={fecharModalAuth}
              style={{
                width: '100%',
                padding: '9px 16px',
                fontSize: '13px',
                justifyContent: 'center',
              }}
            >
              Entendido, vou verificar meu e-mail
            </button>
          </div>
        ) : (
          <>
            {/* Login com Google OAuth */}
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

            {/* Mensagem de Erro */}
            {erroAuth && (
              <div
                style={{
                  backgroundColor: 'var(--danger-subtle)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{erroAuth}</span>
              </div>
            )}

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
                      placeholder="Ex: Seu Nome Completo"
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
                  E-mail Profissional ou Pessoal
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
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
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
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
                    <span>{carregando ? 'Processando...' : modoAuth === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Gratuita'}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

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

        {/* Status da Conexão Supabase & Segurança */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              ● Supabase Auth & RLS Ativos
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '10.5px' }}>
            <ShieldCheck size={12} color="var(--success)" />
            <span>Credenciais isoladas e criptografadas.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalAuth
