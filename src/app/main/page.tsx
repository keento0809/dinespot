'use client'

import { useEffect, useState } from 'react'
import { MapView } from '@/components/map/map-view'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { usePostsStore } from '@/stores/posts-store'
import { Post } from '@/types'

export default function MainPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const { posts, isLoading: postsLoading } = usePostsStore()
  const [displayPosts, setDisplayPosts] = useState<Post[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // TODO: Implement fetchPosts API call when backend is ready
  useEffect(() => {
    if (user && !authLoading) {
      // fetchPosts() - will implement when API is ready
      console.log('User authenticated:', user)
    }
  }, [user, authLoading])

  useEffect(() => {
    setDisplayPosts(posts)
  }, [posts])

  const handleRestaurantClick = (restaurantId: string, coordinates: [number, number]) => {
    console.log('Restaurant clicked:', restaurantId, coordinates)
    // TODO: Show restaurant details or posts in a sidebar/modal
  }

  const handleCreatePost = () => {
    console.log('Create new post clicked')
    // TODO: Open create post modal/form
  }

  const handleShowProfile = () => {
    console.log('Show profile clicked')
    // TODO: Open profile modal/page
  }

  const handleShowSettings = () => {
    console.log('Show settings clicked')
    // TODO: Open settings modal/page
  }

  const handleSidebarCollapseChange = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed)
  }

  if (authLoading || postsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen relative">
      <Sidebar
        onCreatePost={handleCreatePost}
        onShowProfile={handleShowProfile}
        onShowSettings={handleShowSettings}
        onCollapseChange={handleSidebarCollapseChange}
      />
      <div className={`
        absolute top-0 right-0 bottom-0 transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'left-16' : 'left-70'}
        md:${isSidebarCollapsed ? 'left-16' : 'left-70'}
      `}>
        <MapView 
          posts={displayPosts}
          onRestaurantClick={handleRestaurantClick}
        />
      </div>
    </div>
  )
}