import { type NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.error("[v0] Google Maps API key not found")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    console.log("[v0] Server: Fetching place predictions for:", input)

    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json")
    url.searchParams.set("input", input)
    url.searchParams.set("key", apiKey)
    url.searchParams.set("components", "country:ke") // Restrict to Kenya
    url.searchParams.set("types", "establishment|geocode") // Include both places and addresses
    url.searchParams.set("language", "en")

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PlacesAutocompleteResponse = await response.json()

    console.log("[v0] Server: Places API response status:", data.status)
    console.log("[v0] Server: Found predictions:", data.predictions?.length || 0)

    if (data.status === "OK" && data.predictions) {
      return NextResponse.json({
        predictions: data.predictions.slice(0, 5), // Limit to 5 suggestions
      })
    } else if (data.status === "ZERO_RESULTS") {
      return NextResponse.json({ predictions: [] })
    } else {
      console.error("[v0] Server: Places API error:", data.status)
      return NextResponse.json({ predictions: [] })
    }
  } catch (error) {
    console.error("[v0] Server: Error fetching place predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
