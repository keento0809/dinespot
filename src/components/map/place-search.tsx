'use client'

import { useState } from 'react'
import { searchPlaces, MapboxPlace } from '@/lib/mapbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

interface PlaceSearchProps {
  onPlaceSelect: (place: MapboxPlace) => void
}

export function PlaceSearch({ onPlaceSelect }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MapboxPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handle_search = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const places = await searchPlaces(query)
      setResults(places)
    } catch (error) {
      console.error('検索エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handle_place_select = (place: MapboxPlace) => {
    onPlaceSelect(place)
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="お店を検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handle_search()}
          className="flex-1"
        />
        <Button
          onClick={handle_search}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? '検索中...' : '検索'}
        </Button>
      </div>

      {results.length > 0 && (
        <Card className="absolute top-full z-10 mt-2 w-full">
          <CardContent className="p-0">
            {results.map((place) => (
              <button
                key={place.id}
                onClick={() => handle_place_select(place)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{place.place_name}</div>
                  {place.properties?.address && (
                    <div className="text-sm text-gray-500">
                      {place.properties.address}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}