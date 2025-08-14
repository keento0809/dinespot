'use client'

import { useEffect, useRef, useState } from 'react'
import { mapboxgl } from '@/lib/mapbox'
import { Post } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapViewProps {
  posts: Post[]
  searchResults?: Array<{
    id: string
    name: string
    location: { lat: number; lng: number }
    address: string
    rating?: number
  }>
  onRestaurantClick?: (restaurantId: string, coordinates: [number, number]) => void
  onMapClick?: (coordinates: [number, number]) => void
}

export function MapView({ posts, searchResults, onRestaurantClick, onMapClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Store current callback references
  const callbacksRef = useRef({ onRestaurantClick, onMapClick })
  callbacksRef.current = { onRestaurantClick, onMapClick }

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.6917, 35.6895], // Tokyo
      zoom: 12,
      interactive: true,
    })

    map.current.on('load', () => {
      setIsLoaded(true)
      
      // Add source for restaurant markers
      map.current!.addSource('restaurants', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Add source for search results
      map.current!.addSource('search-results', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: false,
      })

      // Add cluster circles
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'restaurants',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        },
      })

      // Add cluster count labels
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'restaurants',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      })

      // Add individual restaurant markers
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'restaurants',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      })

      // Add search result markers
      map.current!.addLayer({
        id: 'search-results',
        type: 'circle',
        source: 'search-results',
        paint: {
          'circle-color': '#ff6b35',
          'circle-radius': 10,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Handle click on individual restaurants
      map.current!.on('click', 'unclustered-point', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0]
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
          const restaurantId = feature.properties?.restaurantId
          
          if (callbacksRef.current.onRestaurantClick && restaurantId) {
            callbacksRef.current.onRestaurantClick(restaurantId, coordinates)
          }
        }
      })

      // Handle click on search results
      map.current!.on('click', 'search-results', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0]
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
          const restaurantId = feature.properties?.restaurantId
          
          if (callbacksRef.current.onRestaurantClick && restaurantId) {
            callbacksRef.current.onRestaurantClick(restaurantId, coordinates)
          }
        }
      })

      // Handle click on clusters
      map.current!.on('click', 'clusters', (e) => {
        if (e.features && e.features[0]) {
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          })
          const clusterId = features[0].properties?.cluster_id
          const source = map.current!.getSource('restaurants') as mapboxgl.GeoJSONSource
          
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom === null || zoom === undefined) return
            
            map.current!.easeTo({
              center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
              zoom: zoom,
            })
          })
        }
      })

      // Change cursor on hover
      map.current!.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current!.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = ''
      })
      map.current!.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current!.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = ''
      })
      map.current!.on('mouseenter', 'search-results', () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current!.on('mouseleave', 'search-results', () => {
        map.current!.getCanvas().style.cursor = ''
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, []) // Remove callback dependencies to prevent re-rendering

  // Update markers when posts change
  useEffect(() => {
    if (!map.current || !isLoaded) return

    const source = map.current.getSource('restaurants') as mapboxgl.GeoJSONSource
    if (source) {
      const features = posts.map((post) => ({
        type: 'Feature' as const,
        properties: {
          restaurantId: post.restaurant.id,
          restaurantName: post.restaurant.name,
          postCount: 1,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [
            post.restaurant.longitude ? Number(post.restaurant.longitude) : 0,
            post.restaurant.latitude ? Number(post.restaurant.latitude) : 0
          ],
        },
      }))

      source.setData({
        type: 'FeatureCollection',
        features,
      })
    }
  }, [posts, isLoaded])

  // Update search results when they change
  useEffect(() => {
    if (!map.current || !isLoaded) return

    const source = map.current.getSource('search-results') as mapboxgl.GeoJSONSource
    if (source && searchResults) {
      const features = searchResults.map((restaurant) => ({
        type: 'Feature' as const,
        properties: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          address: restaurant.address,
          rating: restaurant.rating,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [restaurant.location.lng, restaurant.location.lat],
        },
      }))

      source.setData({
        type: 'FeatureCollection',
        features,
      })

      // Fit map to show search results
      if (features.length > 0) {
        const coordinates = features.map(f => f.geometry.coordinates as [number, number])
        
        if (coordinates.length === 1) {
          // Single result - center on it
          map.current.flyTo({
            center: coordinates[0],
            zoom: 15,
          })
        } else {
          // Multiple results - fit bounds
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord)
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
          
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15,
          })
        }
      }
    } else if (source) {
      // Clear search results
      source.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
  }, [searchResults, isLoaded])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  )
}