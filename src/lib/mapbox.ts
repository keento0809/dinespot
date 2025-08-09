import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

export { mapboxgl }

export interface MapboxPlace {
  id: string
  place_name: string
  center: [number, number]
  properties?: {
    address?: string
    category?: string
  }
}

export const searchPlaces = async (query: string): Promise<MapboxPlace[]> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${mapboxgl.accessToken}&types=poi&limit=10`
    )
    const data = await response.json()
    return data.features || []
  } catch (error) {
    console.error('Error searching places:', error)
    return []
  }
}

export const getPlaceDetails = async (
  placeId: string
): Promise<MapboxPlace | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${placeId}.json?access_token=${mapboxgl.accessToken}`
    )
    const data = await response.json()
    return data.features?.[0] || null
  } catch (error) {
    console.error('Error getting place details:', error)
    return null
  }
}