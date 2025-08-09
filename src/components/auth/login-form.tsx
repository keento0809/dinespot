'use client'

import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const { signIn } = useAuth()

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