import { useState } from 'react'

export function useToast() {
  const [mensagem, setMensagem] = useState(null)
  const [tipo, setTipo] = useState('info') // 'info', 'sucesso', 'erro'

  function exibirToast(msg, tipoToast = 'info', duracao = 3000) {
    setMensagem(msg)
    setTipo(tipoToast)
    setTimeout(() => {
      setMensagem(null)
    }, duracao)
  }

  return { mensagem, tipo, exibirToast }
}
