'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Você pode enviar esse erro para um serviço de logging
    // console.error('App error boundary:', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg space-y-3 text-center">
          <h2 className="text-xl font-semibold">Ocorreu um erro no aplicativo</h2>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Um erro inesperado ocorreu. Tente novamente.'}
          </p>
          {error?.digest && (
            <p className="text-xs text-muted-foreground">Código: {error.digest}</p>
          )}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button onClick={() => reset()}>Tentar novamente</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>Voltar ao início</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
