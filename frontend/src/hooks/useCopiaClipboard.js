import { useState } from 'react'

export function useCopiaClipboard() {
  const [copiado, setCopiado] = useState(false)

  async function copiar(texto, duracaoMs = 2000) {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API indisponível')
      return false
    }

    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), duracaoMs)
      return true
    } catch {
      setCopiado(false)
      return false
    }
  }

  const ret = [copiado, copiar]
  ret.copiado = copiado
  ret.copiar = copiar
  return ret
}

