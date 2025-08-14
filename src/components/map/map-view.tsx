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
  onRestaurantClick?: (restaurantId: string, coordinates: [number, number], screenPosition: { x: number, y: number }) => void
  onMapClick?: (coordinates: [number, number], screenPosition: { x: number, y: number }) => void
}

export function MapView({ posts, searchResults, onRestaurantClick, onMapClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

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

      // Handle click on individual restaurants
      map.current!.on('click', 'unclustered-point', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0]
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
          const restaurantId = feature.properties?.restaurantId
          const screenPosition = { x: e.point.x, y: e.point.y }
          
          if (onRestaurantClick && restaurantId) {
            onRestaurantClick(restaurantId, coordinates, screenPosition)
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
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onRestaurantClick])

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

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  )
}