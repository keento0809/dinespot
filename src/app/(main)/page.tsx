'use client'

import { useEffect, useState } from 'react'
import { MapView } from '@/components/map/map-view'
import { useAuthStore } from '@/stores/auth-store'
import { usePostsStore } from '@/stores/posts-store'
import { Post } from '@/types'

export default function MainPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const { posts, fetchPosts, isLoading: postsLoading } = usePostsStore()
  const [displayPosts, setDisplayPosts] = useState<Post[]>([])

  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts()
    }
  }, [user, authLoading, fetchPosts])

  useEffect(() => {
    setDisplayPosts(posts)
  }, [posts])

  const handleRestaurantClick = (restaurantId: string, coordinates: [number, number]) => {
    console.log('Restaurant clicked:', restaurantId, coordinates)
    // TODO: Show restaurant details or posts in a sidebar/modal
  }

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <MapView 
        posts={displayPosts}
        onRestaurantClick={handleRestaurantClick}
      />
    </div>
  )
}