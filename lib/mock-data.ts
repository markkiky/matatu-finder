// Comprehensive mock data for Matatu Finder app
export interface RouteData {
  stage: string
  routes: string[]
  fare: string
  time: string
  tips: string
  alternatives: Alternative[]
}

export interface Alternative {
  stage: string
  routes: string[]
  fare: string
  time: string
}

export const mockRouteData: Record<string, RouteData> = {
  "CBD/City Center": {
    stage: "Kencom Stage",
    routes: ["14", "46", "100"],
    fare: "KSh 50-80",
    time: "25-40 mins",
    tips: "Peak hours: 7-9 AM, 5-7 PM. Consider Route 100 for faster service during rush hour.",
    alternatives: [
      { stage: "Railways Stage", routes: ["11", "15"], fare: "KSh 60-90", time: "30-45 mins" },
      { stage: "Globe Cinema Stage", routes: ["9", "33"], fare: "KSh 55-85", time: "28-42 mins" },
    ],
  },
  Westlands: {
    stage: "Westlands Stage",
    routes: ["23", "58", "102"],
    fare: "KSh 40-60",
    time: "20-35 mins",
    tips: "Route 102 is express during peak hours. Avoid Route 23 during evening rush.",
    alternatives: [{ stage: "ABC Place Stage", routes: ["44"], fare: "KSh 50-70", time: "25-40 mins" }],
  },
  Karen: {
    stage: "Karen Stage",
    routes: ["24", "111"],
    fare: "KSh 80-120",
    time: "35-50 mins",
    tips: "Limited service after 8 PM. Route 111 runs more frequently and is more reliable.",
    alternatives: [{ stage: "Langata Stage", routes: ["126"], fare: "KSh 90-130", time: "40-55 mins" }],
  },
  Eastleigh: {
    stage: "Eastleigh Stage",
    routes: ["6", "17", "25"],
    fare: "KSh 30-50",
    time: "15-30 mins",
    tips: "Very frequent service throughout the day. Route 25 is fastest during peak hours.",
    alternatives: [{ stage: "Muthurwa Stage", routes: ["12", "18"], fare: "KSh 35-55", time: "20-35 mins" }],
  },
  Kasarani: {
    stage: "Kasarani Stage",
    routes: ["45", "237"],
    fare: "KSh 60-90",
    time: "30-50 mins",
    tips: "Route 237 is more comfortable but slightly more expensive. Limited evening service.",
    alternatives: [{ stage: "Thika Road Stage", routes: ["44", "236"], fare: "KSh 65-95", time: "35-55 mins" }],
  },
  "Thika Road Mall": {
    stage: "Thika Road Mall Stage",
    routes: ["44", "236", "237"],
    fare: "KSh 50-70",
    time: "25-40 mins",
    tips: "Direct routes available. Route 236 stops at multiple malls along Thika Road.",
    alternatives: [{ stage: "Kasarani Stage", routes: ["45"], fare: "KSh 60-80", time: "30-45 mins" }],
  },
  "Junction Mall": {
    stage: "Junction Mall Stage",
    routes: ["34", "46"],
    fare: "KSh 40-60",
    time: "20-35 mins",
    tips: "Route 46 continues to CBD if you need to go further. Good service frequency.",
    alternatives: [{ stage: "Ngong Road Stage", routes: ["24"], fare: "KSh 45-65", time: "25-40 mins" }],
  },
  "Sarit Center": {
    stage: "Sarit Center Stage",
    routes: ["23", "102"],
    fare: "KSh 40-60",
    time: "20-35 mins",
    tips: "Route 102 is express service. Both routes connect well to other parts of the city.",
    alternatives: [{ stage: "Westlands Stage", routes: ["58"], fare: "KSh 35-55", time: "18-30 mins" }],
  },
  Kibera: {
    stage: "Kibera Stage",
    routes: ["32", "126"],
    fare: "KSh 30-50",
    time: "20-35 mins",
    tips: "Frequent service during the day. Route 126 continues to Langata and Karen.",
    alternatives: [{ stage: "Langata Stage", routes: ["24"], fare: "KSh 35-55", time: "25-40 mins" }],
  },
  Ngong: {
    stage: "Ngong Stage",
    routes: ["24", "111"],
    fare: "KSh 70-100",
    time: "40-60 mins",
    tips: "Limited service after 7 PM. Route 111 is more reliable for longer distances.",
    alternatives: [{ stage: "Karen Stage", routes: ["24"], fare: "KSh 60-90", time: "35-50 mins" }],
  },
}

export const popularDestinations = [
  "CBD/City Center",
  "Westlands",
  "Karen",
  "Eastleigh",
  "Kasarani",
  "Thika Road Mall",
  "Junction Mall",
  "Sarit Center",
  "Kibera",
  "Ngong",
  "Langata",
  "South C",
]

export function findRouteData(destination: string): RouteData | null {
  // Direct match first
  if (mockRouteData[destination]) {
    return mockRouteData[destination]
  }

  // Fuzzy matching - check if destination contains any of our keys
  const matchedKey = Object.keys(mockRouteData).find(
    (key) =>
      destination.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(destination.toLowerCase()),
  )

  return matchedKey ? mockRouteData[matchedKey] : null
}

export const loadingMessages = [
  "Finding the best matatu routes...",
  "Checking current traffic conditions...",
  "Looking up stage locations...",
  "Calculating estimated fares...",
  "Finding alternative routes...",
]

export function getRandomLoadingMessage(): string {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
}
