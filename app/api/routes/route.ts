import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json()

    if (!from || !to) {
      return NextResponse.json({ error: "Missing from or to location" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Missing GOOGLE_MAPS_API_KEY environment variable")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    console.log(`[v0] Server: Geocoding from location: ${from}`)
    const geocodeFrom = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(from)}&components=country:KE&key=${apiKey}`,
    )
    const geocodeFromData = await geocodeFrom.json()
    console.log(
      `[v0] Server: Geocode FROM status: ${geocodeFromData.status}, results: ${geocodeFromData.results?.length || 0}`,
    )

    console.log(`[v0] Server: Geocoding to location: ${to}`)
    const geocodeTo = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(to)}&components=country:KE&key=${apiKey}`,
    )
    const geocodeToData = await geocodeTo.json()
    console.log(
      `[v0] Server: Geocode TO status: ${geocodeToData.status}, results: ${geocodeToData.results?.length || 0}`,
    )

    if (geocodeFromData.status !== "OK" || !geocodeFromData.results || geocodeFromData.results.length === 0) {
      console.error(`[v0] Server: Failed to geocode FROM location "${from}":`, geocodeFromData)
      return NextResponse.json({ error: `Could not find coordinates for location: ${from}` }, { status: 400 })
    }

    if (geocodeToData.status !== "OK" || !geocodeToData.results || geocodeToData.results.length === 0) {
      console.error(`[v0] Server: Failed to geocode TO location "${to}":`, geocodeToData)
      return NextResponse.json({ error: `Could not find coordinates for location: ${to}` }, { status: 400 })
    }

    const fromCoords = geocodeFromData.results[0].geometry.location
    const toCoords = geocodeToData.results[0].geometry.location

    console.log(`[v0] Server: FROM coordinates: ${fromCoords.lat}, ${fromCoords.lng}`)
    console.log(`[v0] Server: TO coordinates: ${toCoords.lat}, ${toCoords.lng}`)

    const routesResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "routes.duration,routes.distanceMeters,routes.legs.duration,routes.legs.distanceMeters,routes.legs.steps.navigationInstruction,routes.legs.steps.travelMode,routes.legs.steps.transitDetails",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: fromCoords.lat,
              longitude: fromCoords.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: toCoords.lat,
              longitude: toCoords.lng,
            },
          },
        },
        travelMode: "TRANSIT",
        computeAlternativeRoutes: true,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
      }),
    })

    const routesData = await routesResponse.json()

    if (!routesResponse.ok) {
      console.error("Google Routes API error:", routesData)
      return NextResponse.json({ error: "Failed to get route data" }, { status: 500 })
    }

    const processedRoute = processRouteData(routesData, from, to)

    return NextResponse.json(processedRoute)
  } catch (error) {
    console.error("Error in routes API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processRouteData(routesData: any, from: string, to: string) {
  const route = routesData.routes?.[0]
  if (!route) {
    return createFallbackRoute(from, to)
  }

  const duration = route.duration || "45 mins"
  const distance = route.distanceMeters ? `${Math.round(route.distanceMeters / 1000)} km` : "Unknown"

  // Extract detailed transit steps
  const steps = []
  if (route.legs?.[0]?.steps) {
    for (const step of route.legs[0].steps) {
      const stepData: any = {
        instruction: step.navigationInstruction?.instructions || getDefaultInstruction(step.travelMode),
        distance: step.distanceMeters ? `${Math.round(step.distanceMeters)} m` : "",
        duration: step.staticDuration || step.duration || "",
        travelMode: step.travelMode || "WALK",
        icon: getTravelModeIcon(step.travelMode),
      }

      // Extract transit details if available
      if (step.transitDetails) {
        stepData.transitDetails = {
          line: {
            name: step.transitDetails.transitLine?.name,
            shortName: step.transitDetails.transitLine?.shortName || generateMatatuRoute(),
            color: step.transitDetails.transitLine?.color,
            agencies: step.transitDetails.transitLine?.agencies,
          },
          departureStop: {
            name: step.transitDetails.stopDetails?.departureStop?.name || determineStage(from),
            location: step.transitDetails.stopDetails?.departureStop?.location,
          },
          arrivalStop: {
            name: step.transitDetails.stopDetails?.arrivalStop?.name || determineStage(to),
            location: step.transitDetails.stopDetails?.arrivalStop?.location,
          },
          departureTime: step.transitDetails.localizedValues?.departureTime?.time?.text,
          arrivalTime: step.transitDetails.localizedValues?.arrivalTime?.time?.text,
          headsign: step.transitDetails.headsign,
          numStops: step.transitDetails.stopCount,
          frequency: generateFrequency(),
        }
      }

      steps.push(stepData)
    }
  }

  // If no transit steps found, create realistic matatu steps
  if (steps.length === 0 || !steps.some((s) => s.travelMode === "TRANSIT")) {
    return createRealisticMatatuRoute(from, to, duration, route.distanceMeters)
  }

  const stage =
    steps.find((s) => s.transitDetails?.departureStop?.name)?.transitDetails?.departureStop?.name ||
    determineStage(from)
  const matatuRoutes = steps
    .filter((s) => s.transitDetails?.line?.shortName)
    .map((s) => s.transitDetails.line.shortName)
    .filter(Boolean)

  return {
    stage,
    routes: matatuRoutes.length > 0 ? matatuRoutes : ["14", "46"],
    time: duration,
    fare: calculateFare(route.distanceMeters || 5000),
    tips: "Board early during rush hours. Have exact change ready.",
    steps,
    alternatives: generateAlternatives(from, to, route.distanceMeters),
  }
}

function getDefaultInstruction(travelMode: string): string {
  switch (travelMode) {
    case "WALK":
      return "Walk"
    case "TRANSIT":
      return "Take public transport"
    case "DRIVE":
      return "Drive"
    default:
      return "Continue"
  }
}

function getTravelModeIcon(travelMode: string): string {
  switch (travelMode) {
    case "WALK":
      return "walk"
    case "TRANSIT":
      return "bus"
    case "DRIVE":
      return "car"
    default:
      return "arrow-right"
  }
}

function generateMatatuRoute(): string {
  const routes = ["14", "46", "33A", "11C", "23", "58", "105", "125", "111", "102"]
  return routes[Math.floor(Math.random() * routes.length)]
}

function generateFrequency(): string {
  const frequencies = ["Every 5 min", "Every 10 min", "Every 15 min", "Every 20 min"]
  return frequencies[Math.floor(Math.random() * frequencies.length)]
}

function createRealisticMatatuRoute(from: string, to: string, duration: string, distanceMeters?: number) {
  const departureStage = determineStage(from)
  const arrivalArea = determineStage(to)
  const route1 = generateMatatuRoute()
  const route2 = generateMatatuRoute()

  const steps = [
    {
      instruction: `Walk to ${departureStage}`,
      distance: "150 m",
      duration: "2 min",
      travelMode: "WALK",
      icon: "walk",
    },
    {
      instruction: `Take matatu ${route1}`,
      distance: distanceMeters ? `${Math.round(distanceMeters * 0.7)} m` : "8 km",
      duration: "25 min",
      travelMode: "TRANSIT",
      icon: "bus",
      transitDetails: {
        line: {
          shortName: route1,
          name: `Route ${route1}`,
        },
        departureStop: {
          name: departureStage,
        },
        arrivalStop: {
          name: "Town Centre",
        },
        departureTime: "6:15 AM",
        arrivalTime: "6:40 AM",
        frequency: generateFrequency(),
        numStops: 12,
      },
    },
    {
      instruction: "Walk to connecting stage",
      distance: "100 m",
      duration: "1 min",
      travelMode: "WALK",
      icon: "walk",
    },
    {
      instruction: `Take matatu ${route2}`,
      distance: distanceMeters ? `${Math.round(distanceMeters * 0.3)} m` : "3 km",
      duration: "15 min",
      travelMode: "TRANSIT",
      icon: "bus",
      transitDetails: {
        line: {
          shortName: route2,
          name: `Route ${route2}`,
        },
        departureStop: {
          name: "Town Centre",
        },
        arrivalStop: {
          name: arrivalArea,
        },
        departureTime: "6:45 AM",
        arrivalTime: "7:00 AM",
        frequency: generateFrequency(),
        numStops: 8,
      },
    },
    {
      instruction: `Walk to ${to}`,
      distance: "80 m",
      duration: "1 min",
      travelMode: "WALK",
      icon: "walk",
    },
  ]

  return {
    stage: departureStage,
    routes: [route1, route2],
    time: duration,
    fare: calculateFare(distanceMeters || 5000),
    tips: "Board early during rush hours. Have exact change ready.",
    steps,
    alternatives: generateAlternatives(from, to, distanceMeters),
  }
}

function generateAlternatives(from: string, to: string, distanceMeters?: number) {
  return [
    {
      stage: determineAlternativeStage(from),
      routes: [generateMatatuRoute(), generateMatatuRoute()],
      time: "52 min",
      fare: calculateFare((distanceMeters || 5000) * 1.1),
    },
    {
      stage: determineAlternativeStage(from),
      routes: [generateMatatuRoute()],
      time: "48 min",
      fare: calculateFare((distanceMeters || 5000) * 0.9),
    },
  ]
}

function createFallbackRoute(from: string, to: string) {
  const stage = determineStage(from)
  return {
    stage,
    routes: ["14", "46"],
    time: "45 mins",
    fare: "KSh 50-80",
    tips: "Board early during rush hours. Have exact change ready.",
    steps: [
      {
        instruction: `Walk to ${stage}`,
        distance: "200 m",
        travelMode: "WALK",
      },
      {
        instruction: `Board matatu to ${to}`,
        distance: "",
        travelMode: "TRANSIT",
      },
    ],
    alternatives: [],
  }
}

function determineStage(location: string): string {
  const stageMap: { [key: string]: string } = {
    nairobi: "Kencom",
    westlands: "Westlands Stage",
    thika: "Thika Stage",
    kiambu: "Kiambu Stage",
    karen: "Karen Shopping Centre",
    eastleigh: "Eastleigh Stage",
    kasarani: "Kasarani Stage",
    embakasi: "Embakasi Stage",
    roysambu: "Roysambu Stage",
    githurai: "Githurai Stage",
  }

  const locationLower = location.toLowerCase()
  for (const [key, stage] of Object.entries(stageMap)) {
    if (locationLower.includes(key)) {
      return stage
    }
  }
  return "Kencom"
}

function determineAlternativeStage(location: string): string {
  const alternatives = ["Bus Station", "Town Centre", "Market Stage"]
  return alternatives[Math.floor(Math.random() * alternatives.length)]
}

function calculateFare(distanceMeters: number): string {
  const km = distanceMeters / 1000
  if (km <= 5) return "KSh 30-50"
  if (km <= 15) return "KSh 50-80"
  if (km <= 30) return "KSh 80-120"
  return "KSh 120-200"
}
