import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get("place_id")

  if (!placeId) {
    return NextResponse.json({ error: "Place ID required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
    url.searchParams.set("place_id", placeId)
    url.searchParams.set("key", apiKey)
    url.searchParams.set("fields", "formatted_address,name")

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === "OK" && data.result) {
      return NextResponse.json({
        formatted_address: data.result.formatted_address || data.result.name,
      })
    }

    return NextResponse.json({ error: "Place not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Server: Error fetching place details:", error)
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 })
  }
}
