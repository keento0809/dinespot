export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Restaurant {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
  mapboxPlaceId?: string
  createdAt: Date
}

export interface Post {
  id: string
  userId: string
  restaurantId: string
  description?: string
  images: string[]
  likesCount: number
  createdAt: Date
  updatedAt: Date
  user: User
  restaurant: Restaurant
  isLiked?: boolean
}

export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: Date
}

export interface MapboxPlace {
  id: string
  place_name: string
  center: [number, number]
  properties?: {
    address?: string
    category?: string
  }
}