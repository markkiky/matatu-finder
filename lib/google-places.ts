export interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export interface PlacesAutocompleteResponse {
  predictions: PlacePrediction[]
  status: string
}

export async function getPlacePredictions(input: string): Promise<PlacePrediction[]> {
  if (!input.trim() || input.length < 2) {
    return []
  }

  try {
    console.log("[v0] Fetching place predictions for:", input)

    const url = new URL("/api/places/autocomplete", window.location.origin)
    url.searchParams.set("input", input)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log("[v0] Found predictions:", data.predictions?.length || 0)

    return data.predictions || []
  } catch (error) {
    console.error("[v0] Error fetching place predictions:", error)
    return []
  }
}

export async function getPlaceDetails(placeId: string): Promise<string | null> {
  try {
    const url = new URL("/api/places/details", window.location.origin)
    url.searchParams.set("place_id", placeId)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (response.ok && data.formatted_address) {
      return data.formatted_address
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching place details:", error)
    return null
  }
}
