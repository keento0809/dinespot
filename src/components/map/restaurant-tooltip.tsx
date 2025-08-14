'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Star, X } from 'lucide-react'

interface RestaurantTooltipProps {
  restaurant: {
    id: string
    name: string
    address?: string
    rating?: number
  }
  position: {
    x: number
    y: number
  }
  onClose: () => void
  onAddPost?: () => void
  onSeePosts?: () => void
}

export function RestaurantTooltip({ 
  restaurant, 
  position, 
  onClose, 
  onAddPost,
  onSeePosts 
}: RestaurantTooltipProps) {
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  useEffect(() => {
    const checkBounds = () => {
      const tooltipWidth = 320
      const tooltipHeight = 200
      const padding = 16

      let x = position.x
      let y = position.y

      // Adjust horizontal position if tooltip would go off screen
      if (x + tooltipWidth > window.innerWidth - padding) {
        x = window.innerWidth - tooltipWidth - padding
      }
      if (x < padding) {
        x = padding
      }

      // Adjust vertical position if tooltip would go off screen
      if (y + tooltipHeight > window.innerHeight - padding) {
        y = position.y - tooltipHeight - 20 // Show above the point
      }
      if (y < padding) {
        y = padding
      }

      setAdjustedPosition({ x, y })
    }

    checkBounds()
    window.addEventListener('resize', checkBounds)
    return () => window.removeEventListener('resize', checkBounds)
  }, [position])

  return (
    <div
      className="fixed z-[2000] pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <Card className="w-80 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden pointer-events-auto"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                    {restaurant.name}
                  </h3>
                  {restaurant.address && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {restaurant.address}
                    </p>
                  )}
                  {restaurant.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 w-fit">
                      <Star className="h-3 w-3 text-amber-500 fill-current" />
                      <span className="text-amber-700 font-medium text-xs">{restaurant.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex gap-2">
              {onAddPost && (
                <Button
                  onClick={onAddPost}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  投稿を追加
                </Button>
              )}
              {onSeePosts && (
                <Button
                  onClick={onSeePosts}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  投稿を見る
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}