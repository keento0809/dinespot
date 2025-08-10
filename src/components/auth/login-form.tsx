'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const { signIn, error, clearError } = useAuth()
  const searchParams = useSearchParams()
  const [callbackError, setCallbackError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam === 'callback_failed') {
      setCallbackError('ログインの完了に失敗しました。もう一度お試しください。')
    }
  }, [searchParams])

  const displayError = error || callbackError

  const handleClearError = () => {
    clearError()
    setCallbackError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">DineSpot</CardTitle>
          <CardDescription>
            外食体験を記録・共有しましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayError && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
              {displayError}
              <button 
                onClick={handleClearError}
                className="ml-2 text-red-600 underline hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}
          <Button
            onClick={signIn}
            className="w-full"
            size="lg"
          >
            Googleでログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}