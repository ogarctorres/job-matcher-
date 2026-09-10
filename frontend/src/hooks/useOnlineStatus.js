import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [estaOnline, setEstaOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    function atualizarStatus() {
      setEstaOnline(navigator.onLine)
    }

    window.addEventListener('online', atualizarStatus)
    window.addEventListener('offline', atualizarStatus)

    return () => {
      window.removeEventListener('online', atualizarStatus)
      window.removeEventListener('offline', atualizarStatus)
    }
  }, [])

  return estaOnline
}
