export interface TransitDetails {
  line?: {
    name?: string
    shortName?: string
    color?: string
    agencies?: Array<{ name: string }>
  }
  departureStop?: {
    name: string
    location?: { latitude: number; longitude: number }
  }
  arrivalStop?: {
    name: string
    location?: { latitude: number; longitude: number }
  }
  departureTime?: string
  arrivalTime?: string
  headsign?: string
  numStops?: number
  frequency?: string
}

export interface RouteStep {
  instruction: string
  distance: string
  duration: string
  travelMode: string
  icon: string
  transitDetails?: TransitDetails
}

export interface MatatuRoute {
  stage: string
  routes: string[]
  fare: string
  time: string
  tips: string
  steps: RouteStep[]
  alternatives: Array<{
    stage: string
    routes: string[]
    fare: string
    time: string
  }>
}

export async function findMatatuRoute(from: string, to: string): Promise<MatatuRoute | null> {
  try {
    console.log("[v0] Finding route from:", from, "to:", to)

    const response = await fetch("/api/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Routes API error:", errorData)
      throw new Error(errorData.error || "Failed to get route data")
    }

    const routeData = await response.json()
    console.log("[v0] Route data received:", routeData)

    return routeData
  } catch (error) {
    console.error("[v0] Error finding matatu route:", error)
    throw error
  }
}

export async function getCurrentLocation(): Promise<string | null> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      })
    })

    const { latitude, longitude } = position.coords
    console.log("[v0] Got coordinates:", latitude, longitude)

    const response = await fetch("/api/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Geocode API error:", errorData)
      return `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
    }

    const data = await response.json()
    return data.address || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
  } catch (error) {
    console.error("Error getting current location:", error)
    return null
  }
}
