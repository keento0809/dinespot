'use client'

import { createContext, useContext, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { User } from '@/types'

const AuthContext = createContext<{
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}>({
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          displayName: session.user.user_metadata?.display_name,
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(session.user.updated_at || session.user.created_at),
        }
        setUser(user)
      }
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          displayName: session.user.user_metadata?.display_name,
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(session.user.updated_at || session.user.created_at),
        }
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, supabase.auth])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}