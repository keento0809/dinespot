'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapView } from '@/components/map/map-view'
import { RestaurantSearch } from '@/components/map/restaurant-search'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { usePostsStore } from '@/stores/posts-store'
import { Post } from '@/types'
import { findRestaurantAtLocation } from '@/lib/google-places'

export default function MainPage() {
  const { isLoading: authLoading } = useAuthStore()
  const { posts, isLoading: postsLoading } = usePostsStore()
  const [displayPosts, setDisplayPosts] = useState<Post[]>([])
  // const [selectedRestaurant, setSelectedRestaurant] = useState<{
  //   restaurant: {
  //     id: string
  //     name: string
  //     address?: string
  //   }
  //   position: {
  //     x: number
  //     y: number
  //   }
  //   coordinates: [number, number]
  // } | null>(null)
  // const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      name: string
      location: { lat: number; lng: number }
      address: string
      rating?: number
    }>
  >([])
  const [currentLocation, setCurrentLocation] = useState<
    { latitude: number; longitude: number } | undefined
  >()
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  // Get user's current location for search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('Could not get current location:', error)
        }
      )
    }
  }, [])

  // TODO: Implement fetchPosts API call when backend is ready
  // useEffect(() => {
  //   if (user && !authLoading) {
  //     // fetchPosts() - will implement when API is ready
  //     console.log('User authenticated:', user)
  //   }
  // }, [user, authLoading])

  useEffect(() => {
    setDisplayPosts(posts)
  }, [posts])

  const handleRestaurantClick = useCallback(
    (
      restaurantId: string,
      coordinates: [number, number],
      screenPosition: { x: number; y: number }
    ) => {
      const restaurant = displayPosts.find(
        (post) => post.restaurant.id === restaurantId
      )?.restaurant
      if (restaurant) {
        console.log('Restaurant clicked:', restaurant, coordinates, screenPosition)
        // TODO: Show restaurant tooltip when component is available
      }
    },
    [displayPosts]
  )

  // const handleAddPost = () => {
  //   setIsCreatePostDialogOpen(true)
  //   setSelectedRestaurant(null)
  // }

  // const handleSeePosts = () => {
  //   console.log(
  //     'Show posts for restaurant:',
  //     selectedRestaurant?.restaurant.id
  //   )
  //   // TODO: Implement show posts functionality
  //   setSelectedRestaurant(null)
  // }

  // const handleCloseTooltip = () => {
  //   setSelectedRestaurant(null)
  // }

  const handleCreatePost = () => {
    console.log('Create post clicked')
    // TODO: Implement create post functionality
  }

  const handleShowProfile = () => {
    console.log('Show profile')
    // TODO: Implement show profile functionality
  }

  const handleShowSettings = () => {
    console.log('Show settings')
    // TODO: Implement show settings functionality
  }

  const handleShowSearch = () => {
    setIsSearchVisible(!isSearchVisible)
  }

  const handleSidebarCollapseChange = () => {
    // Optional callback for sidebar collapse changes
  }

  const handleMapClick = useCallback(
    async (
      coordinates: [number, number],
      screenPosition: { x: number; y: number }
    ) => {
      console.log('=== MAP CLICKED ===')
      console.log('Coordinates:', coordinates)

      try {
        // Use Google Places API to find restaurants at the clicked location
        const restaurant = await findRestaurantAtLocation(
          coordinates[1],
          coordinates[0]
        )

        if (restaurant) {
          console.log(
            '=== FOUND RESTAURANT WITH GOOGLE PLACES ===',
            restaurant
          )
          // TODO: Show restaurant info when tooltip component is available
          return
        }

        console.log('=== NO RESTAURANT FOUND, USING GENERIC LOCATION ===')

        // Fallback: Try reverse geocoding for address information
        const reverseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1`
        console.log('Fallback to reverse geocoding for address:', reverseUrl)

        const reverseResponse = await fetch(reverseUrl)

        if (reverseResponse.ok) {
          const reverseData = await reverseResponse.json()

          if (reverseData.features && reverseData.features.length > 0) {
            const location = reverseData.features[0]
            const genericLocation = {
              id: `location_${Date.now()}`,
              name: 'New Location',
              address:
                location.place_name ||
                `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
            }

            console.log(
              '=== USING REVERSE GEOCODED LOCATION ===',
              genericLocation
            )
            // TODO: Show location info when tooltip component is available
            return
          }
        }
      } catch (error) {
        console.error('Error in map click handler:', error)
      }

      // Final fallback: coordinates only
      console.log('=== FALLBACK TO COORDINATES ONLY ===')
      const fallbackLocation = {
        id: `coordinates_${Date.now()}`,
        name: 'New Location',
        address: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
      }
      console.log('Fallback location:', fallbackLocation)
      // TODO: Show location info when tooltip component is available
    },
    []
  )

  // TODO: Add restaurant tooltip and post dialog when components are available

  if (authLoading || postsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex">
      <Sidebar
        onCreatePost={handleCreatePost}
        onShowProfile={handleShowProfile}
        onShowSettings={handleShowSettings}
        onShowSearch={handleShowSearch}
        onCollapseChange={handleSidebarCollapseChange}
      />

      <div className="flex-1 relative">
        <MapView
          posts={displayPosts}
          searchResults={searchResults}
          onRestaurantClick={handleRestaurantClick}
          onMapClick={handleMapClick}
        />

        {isSearchVisible && (
          <RestaurantSearch
            onResultsChange={setSearchResults}
            currentLocation={currentLocation}
            onClose={() => setIsSearchVisible(false)}
          />
        )}
      </div>
    </div>
  )
}