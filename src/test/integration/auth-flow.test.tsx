import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/components/auth/auth-provider'
import { useAuthStore } from '@/stores/auth-store'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null }
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({}),
      signOut: vi.fn().mockResolvedValue({})
    }
  })
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
}))

describe('認証フロー統合テスト', () => {
  beforeEach(() => {
    useAuthStore.getState().setUser(null)
    useAuthStore.getState().setLoading(false)
  })

  it('未認証ユーザーの状態管理が正しく動作する', async () => {
    const TestComponent = () => {
      const { user, isLoading } = useAuthStore()
      return (
        <div>
          <div data-testid="user-status">
            {isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated'}
          </div>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('unauthenticated')
    })
  })

  it('認証状態の変更が全体に反映される', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      avatarUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const TestComponent = () => {
      const { user } = useAuthStore()
      const handleSetUser = () => {
        useAuthStore.getState().setUser(mockUser)
      }

      return (
        <div>
          <div data-testid="user-email">
            {user?.email || 'no-email'}
          </div>
          <button onClick={handleSetUser} data-testid="set-user">
            Set User
          </button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const setUserButton = screen.getByTestId('set-user')
    await userEvent.click(setUserButton)

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    })
  })
})