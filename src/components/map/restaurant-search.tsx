'use client'

import { useState, useEffect, useCallback } from 'react'
import { searchRestaurantsByText } from '@/lib/google-places'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Star, X } from 'lucide-react'

interface RestaurantSearchResult {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number }
  rating?: number
  priceLevel?: number
  types?: string[]
  isOpen?: boolean
  website?: string
}

interface RestaurantSearchProps {
  onResultsChange: (results: RestaurantSearchResult[]) => void
  currentLocation?: { latitude: number; longitude: number }
  onClose?: () => void
}

export function RestaurantSearch({ onResultsChange, currentLocation, onClose }: RestaurantSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RestaurantSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handle_search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      onResultsChange([])
      return
    }

    setIsLoading(true)
    try {
      const restaurants = await searchRestaurantsByText(searchQuery, currentLocation)
      setResults(restaurants)
      onResultsChange(restaurants)
    } catch (error) {
      console.error('レストラン検索エラー:', error)
      setResults([])
      onResultsChange([])
    } finally {
      setIsLoading(false)
    }
  }, [currentLocation, onResultsChange])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handle_search(query)
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [query, handle_search])

  const clear_search = () => {
    setQuery('')
    setResults([])
    onResultsChange([])
  }

  const handle_result_click = (restaurant: RestaurantSearchResult) => {
    // Focus on single restaurant
    onResultsChange([restaurant])
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4">
      <Card className="w-full bg-white shadow-2xl border-0 rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">レストランを検索</h3>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="レストランを検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                </div>
              )}
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  {results.length}件の結果
                </span>
                <Button
                  onClick={clear_search}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  クリア
                </Button>
              </div>
            </div>
          )}

          {query.trim() && !isLoading && results.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">「{query}」の検索結果が見つかりませんでした</p>
              <p className="text-xs text-gray-400 mt-1">別のキーワードで検索してみてください</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => handle_result_click(restaurant)}
                  className="w-full p-6 text-left hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-base mb-1 truncate">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {restaurant.address}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {restaurant.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                            <span className="text-amber-700 font-medium text-sm">{restaurant.rating}</span>
                          </div>
                        )}
                        {restaurant.priceLevel && (
                          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            <span className="text-gray-700 font-medium text-sm">
                              {'¥'.repeat(restaurant.priceLevel)}
                            </span>
                          </div>
                        )}
                        {restaurant.isOpen !== undefined && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            restaurant.isOpen 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {restaurant.isOpen ? '営業中' : '閉店中'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}