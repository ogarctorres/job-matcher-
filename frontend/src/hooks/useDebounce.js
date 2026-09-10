import { useState, useEffect } from 'react'

export function useDebounce(valor, delay = 300) {
  const [valorDebounced, setValorDebounced] = useState(valor)

  useEffect(() => {
    const timer = setTimeout(() => {
      setValorDebounced(valor)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [valor, delay])

  return valorDebounced
}
