import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Missing GOOGLE_MAPS_API_KEY environment variable")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
    )

    const data = await response.json()

    if (data.status !== "OK" || !data.results.length) {
      return NextResponse.json({ error: "Could not determine location" }, { status: 400 })
    }

    const address = data.results[0].formatted_address
    return NextResponse.json({ address })
  } catch (error) {
    console.error("Error in geocode API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
