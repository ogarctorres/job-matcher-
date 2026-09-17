import { api } from '../services/api'

function BotaoDeletarAnalise({ id, onSucesso }) {
  async function executarDelecao(e) {
    e.stopPropagation()
    if (!window.confirm('Tem certeza que deseja excluir esta análise permanentemente?')) {
      return
    }

    try {
      await api.deletarAnalise(id)
      if (onSucesso) onSucesso(id)
    } catch (erro) {
      alert('Erro ao excluir: ' + erro.message)
    }
  }

  return (
    <button
      onClick={executarDelecao}
      title="Excluir análise"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        fontSize: '15px',
        color: 'var(--tinta-suave)',
        borderRadius: '3px',
      }}
    >
      🗑️
    </button>
  )
}

export default BotaoDeletarAnalise
