'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/components/auth/auth-provider'
import { useAuthStore } from '@/stores/auth-store'
import { 
  MapPin, 
  Plus, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Heart,
  Search,
  Bookmark
} from 'lucide-react'

interface SidebarProps {
  onCreatePost?: () => void
  onShowProfile?: () => void
  onShowSettings?: () => void
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function Sidebar({ onCreatePost, onShowProfile, onShowSettings, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const { signOut } = useAuth()
  const { user } = useAuthStore()

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    onCollapseChange?.(collapsed)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // Redirect to login page after successful logout
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const sidebarItems = [
    {
      icon: Plus,
      label: '新しい投稿',
      action: onCreatePost,
      primary: true,
    },
    {
      icon: Search,
      label: '検索',
      action: () => console.log('Search clicked'),
    },
    {
      icon: Bookmark,
      label: 'お気に入り',
      action: () => console.log('Favorites clicked'),
    },
    {
      icon: Heart,
      label: 'いいね済み',
      action: () => console.log('Liked posts clicked'),
    },
    {
      icon: User,
      label: 'プロフィール',
      action: onShowProfile,
    },
    {
      icon: Settings,
      label: '設定',
      action: onShowSettings,
    },
  ]

  return (
    <>
      {/* Overlay for mobile when expanded */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => handleCollapse(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-70'}
        md:relative md:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DineSpot
              </h1>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapse(!isCollapsed)}
            className="shrink-0 hover:bg-gray-100/80"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>

        {/* User Profile Section */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatarUrl} alt={user.displayName || user.email} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-lg">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate">
                  {user.displayName || 'ユーザー'}
                </h2>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={item.action}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group
                  ${item.primary 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${item.primary ? '' : 'group-hover:scale-110'} transition-transform`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
              text-red-600 hover:bg-red-50 hover:text-red-700 group
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="text-sm font-medium">ログアウト</span>}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button (when collapsed) */}
      {isCollapsed && (
        <Button
          variant="default"
          size="icon"
          onClick={() => handleCollapse(false)}
          className="fixed top-4 left-4 z-40 md:hidden bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 hover:bg-white"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
      )}
    </>
  )
}