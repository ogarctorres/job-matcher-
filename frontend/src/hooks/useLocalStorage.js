import { useState, useEffect } from 'react'

export function useLocalStorage(chave, valorInicial) {
  const [valorArmazenado, setValorArmazenado] = useState(() => {
    try {
      const item = window.localStorage.getItem(chave)
      return item ? JSON.parse(item) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(chave, JSON.stringify(valorArmazenado))
    } catch {
      // Ignora erro de cota de armazenamento
    }
  }, [chave, valorArmazenado])

  return [valorArmazenado, setValorArmazenado]
}
