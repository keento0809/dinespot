interface GooglePlacesRestaurant {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  priceLevel?: number;
  types?: string[];
  isOpen?: boolean;
  website?: string;
}

interface GooglePlacesResponse {
  places: Array<{
    id: string;
    displayName: {
      text: string;
      languageCode: string;
    };
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
    rating?: number;
    priceLevel?: string;
    types?: string[];
    regularOpeningHours?: {
      openNow?: boolean;
    };
    websiteUri?: string;
  }>;
}

export async function searchNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusMeters: number = 500
): Promise<GooglePlacesRestaurant[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error("Google Places API key not configured");
    throw new Error("Google Places API key not configured");
  }


  const requestBody = {
    includedTypes: ["restaurant"],
    maxResultCount: 10,
    locationRestriction: {
      circle: {
        center: {
          latitude,
          longitude,
        },
        radius: radiusMeters,
      },
    },
  };

  const requestHeaders = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask":
      "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.regularOpeningHours.openNow,places.websiteUri",
  };

  try {
    console.log("Searching for restaurants near:", {
      latitude,
      longitude,
      radiusMeters,
    });

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Places API error:", response.status, errorText);
      throw new Error(
        `Google Places API error: ${response.status} ${errorText}`
      );
    }

    const data: GooglePlacesResponse = await response.json();
    console.log("Google Places API response:", data);

    // Transform the response to our internal format
    const restaurants: GooglePlacesRestaurant[] =
      data.places?.map((place) => ({
        id: place.id,
        name: place.displayName?.text || "Unknown Restaurant",
        address: place.formattedAddress || "Address not available",
        location: {
          lat: place.location?.latitude || latitude,
          lng: place.location?.longitude || longitude,
        },
        rating: place.rating,
        priceLevel:
          place.priceLevel === "PRICE_LEVEL_EXPENSIVE"
            ? 3
            : place.priceLevel === "PRICE_LEVEL_MODERATE"
              ? 2
              : place.priceLevel === "PRICE_LEVEL_INEXPENSIVE"
                ? 1
                : undefined,
        types: place.types,
        isOpen: place.regularOpeningHours?.openNow,
        website: place.websiteUri,
      })) || [];

    console.log("Transformed restaurants:", restaurants);
    return restaurants;
  } catch (error) {
    console.error("Error searching nearby restaurants:", error);
    throw error;
  }
}

export async function searchRestaurantsByText(
  query: string,
  location?: { latitude: number; longitude: number },
  radiusMeters: number = 5000
): Promise<GooglePlacesRestaurant[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error("Google Places API key not configured");
    throw new Error("Google Places API key not configured");
  }

  const requestBody: {
    textQuery: string;
    includedType: string;
    maxResultCount: number;
    locationBias?: {
      circle: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  } = {
    textQuery: query,
    includedType: "restaurant",
    maxResultCount: 20,
  };

  if (location) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        radius: radiusMeters,
      },
    };
  }

  const requestHeaders = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask":
      "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.regularOpeningHours.openNow,places.websiteUri",
  };

  try {
    console.log("Searching for restaurants with text:", { query, location, radiusMeters });

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Places API error:", response.status, errorText);
      throw new Error(
        `Google Places API error: ${response.status} ${errorText}`
      );
    }

    const data: GooglePlacesResponse = await response.json();
    console.log("Google Places text search response:", data);

    const restaurants: GooglePlacesRestaurant[] =
      data.places?.map((place) => ({
        id: place.id,
        name: place.displayName?.text || "Unknown Restaurant",
        address: place.formattedAddress || "Address not available",
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
        rating: place.rating,
        priceLevel:
          place.priceLevel === "PRICE_LEVEL_EXPENSIVE"
            ? 3
            : place.priceLevel === "PRICE_LEVEL_MODERATE"
              ? 2
              : place.priceLevel === "PRICE_LEVEL_INEXPENSIVE"
                ? 1
                : undefined,
        types: place.types,
        isOpen: place.regularOpeningHours?.openNow,
        website: place.websiteUri,
      })) || [];

    console.log("Transformed text search restaurants:", restaurants);
    return restaurants;
  } catch (error) {
    console.error("Error searching restaurants by text:", error);
    throw error;
  }
}

export async function findRestaurantAtLocation(
  latitude: number,
  longitude: number
): Promise<GooglePlacesRestaurant | null> {
  try {
    const restaurants = await searchNearbyRestaurants(latitude, longitude, 50);

    if (restaurants.length > 0) {
      return restaurants[0];
    }

    const widerSearch = await searchNearbyRestaurants(latitude, longitude, 200);

    if (widerSearch.length > 0) {
      const closest = widerSearch.reduce((prev, curr) => {
        const prevDistance = Math.sqrt(
          Math.pow(prev.location.lat - latitude, 2) +
            Math.pow(prev.location.lng - longitude, 2)
        );
        const currDistance = Math.sqrt(
          Math.pow(curr.location.lat - latitude, 2) +
            Math.pow(curr.location.lng - longitude, 2)
        );
        return prevDistance < currDistance ? prev : curr;
      });

      return closest;
    }

    return null;
  } catch (error) {
    console.error("Error finding restaurant at location:", error);
    return null;
  }
}