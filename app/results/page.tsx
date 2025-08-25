"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, DollarSign, ChevronDown, AlertCircle, Info, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { findMatatuRoute, type MatatuRoute } from "@/lib/google-routes"
import { RouteSteps } from "@/components/route-steps"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [routeData, setRouteData] = useState<MatatuRoute | null>(null)
  const [error, setError] = useState<string | null>(null)

  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  const createRouteOptions = (data: MatatuRoute) => {
    const routes = [
      {
        id: 0,
        name: data.stage,
        routes: data.routes,
        time: data.time,
        fare: data.fare,
        steps: data.steps,
        isRecommended: true,
      },
    ]

    data.alternatives.forEach((alt, index) => {
      routes.push({
        id: index + 1,
        name: alt.stage,
        routes: alt.routes,
        time: alt.time,
        fare: alt.fare,
        steps: [
          {
            instruction: `Walk to ${alt.stage}`,
            distance: "180 m",
            duration: "2 min",
            travelMode: "WALK",
            icon: "walk",
          },
          {
            instruction: `Take matatu ${alt.routes[0]}`,
            distance: "12 km",
            duration: alt.time,
            travelMode: "TRANSIT",
            icon: "bus",
            transitDetails: {
              line: {
                shortName: alt.routes[0],
                name: `Route ${alt.routes[0]}`,
              },
              departureStop: {
                name: alt.stage,
              },
              arrivalStop: {
                name: "Destination Area",
              },
              frequency: "Every 10 min",
              numStops: 15,
            },
          },
        ],
        isRecommended: false,
      })
    })

    return routes
  }

  useEffect(() => {
    const loadData = async () => {
      const loadingMessages = [
        "Connecting to Google Maps...",
        "Finding optimal routes...",
        "Calculating matatu routes...",
        "Checking traffic conditions...",
        "Finding nearest stages...",
      ]

      let messageIndex = 0
      setLoadingMessage(loadingMessages[0])

      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length
        setLoadingMessage(loadingMessages[messageIndex])
      }, 1000)

      try {
        const data = await findMatatuRoute(from, to)

        clearInterval(messageInterval)
        setRouteData(data)
        setError(null)

        if (data) {
          setExpandedRoute(0)
          const announcement = `Route found. Board at ${data.stage} using routes ${data.routes.join(", ")}`
          const ariaLive = document.createElement("div")
          ariaLive.setAttribute("aria-live", "polite")
          ariaLive.setAttribute("aria-atomic", "true")
          ariaLive.className = "sr-only"
          ariaLive.textContent = announcement
          document.body.appendChild(ariaLive)
          setTimeout(() => document.body.removeChild(ariaLive), 1000)
        }
      } catch (error) {
        console.error("Error loading route data:", error)
        clearInterval(messageInterval)
        setError("Failed to load route information. Please try again.")
        setRouteData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [from, to])

  const handleBack = () => {
    router.back()
  }

  const handleNewSearch = () => {
    router.push("/")
  }

  const toggleRoute = (routeId: number) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId)
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      action()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4" role="banner">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-primary-foreground transition-all duration-200 hover:scale-105"
              aria-label="Go back to search"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Finding Routes</h1>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4 flex items-center justify-center min-h-[60vh]" role="main">
          <Card className="w-full transition-all duration-300 animate-pulse">
            <CardContent className="p-8 text-center space-y-4">
              <div
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"
                aria-label="Loading routes"
              />
              <h2 className="text-lg font-semibold">Searching Routes</h2>
              <p className="text-muted-foreground animate-pulse" aria-live="polite" aria-atomic="true">
                {loadingMessage}
              </p>
              <div className="text-sm text-muted-foreground">
                <div>
                  From: <span className="font-medium">{from}</span>
                </div>
                <div>
                  To: <span className="font-medium">{to}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!routeData && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4" role="banner">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-primary-foreground transition-all duration-200 hover:scale-105"
              aria-label="Go back to search"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Route Results</h1>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4" role="main">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{error ? "Error Loading Routes" : "No Routes Found"}</h2>
              <p className="text-muted-foreground">
                {error ||
                  `Sorry, we couldn't find any matatu routes from "${from}" to "${to}". Please check your locations and try again.`}
              </p>
              <div className="space-y-2" role="group" aria-label="Navigation options">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full bg-transparent transition-all duration-200 hover:scale-[1.02]"
                  aria-label="Go back to previous page"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleNewSearch}
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
                  aria-label="Start a new search"
                >
                  New Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const routeOptions = routeData ? createRouteOptions(routeData) : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4" role="banner">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-primary-foreground transition-all duration-200 hover:scale-105"
            aria-label="Go back to search"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Available Routes</h1>
        </div>
      </header>

      {/* Route Summary */}
      <div className="bg-muted p-4" role="region" aria-label="Route summary">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="truncate">From: {from}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground font-medium mt-1">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="truncate">To: {to}</span>
          </div>
        </div>
      </div>

      {/* Main Results */}
      <main className="max-w-md mx-auto p-4 space-y-3" role="main">
        {routeOptions.map((route) => (
          <div key={route.id}>
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
                route.isRecommended ? "border-l-primary bg-primary/5" : "border-l-muted-foreground/20"
              }`}
              onClick={() => toggleRoute(route.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, () => toggleRoute(route.id))}
              aria-expanded={expandedRoute === route.id}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <h3 className="font-semibold text-card-foreground">{route.name}</h3>
                    {route.isRecommended && (
                      <Badge variant="default" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expandedRoute === route.id ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <div className="space-y-3">
                  {/* Route Numbers */}
                  <div className="flex flex-wrap gap-2">
                    {route.routes.map((routeNum) => (
                      <Badge key={routeNum} variant={route.isRecommended ? "default" : "outline"} className="text-sm">
                        {routeNum}
                      </Badge>
                    ))}
                  </div>

                  {/* Time and Fare */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span className="font-medium">{route.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span className="font-medium">{route.fare}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {expandedRoute === route.id && route.steps && route.steps.length > 0 && (
              <div className="mt-2 ml-4">
                <RouteSteps steps={route.steps} />
              </div>
            )}
          </div>
        ))}

        {/* Tips */}
        {routeData && (
          <Card className="transition-all duration-200 hover:shadow-md mt-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-card-foreground flex items-center gap-2">
                <Info className="w-4 h-4" aria-hidden="true" />
                Travel Tips
              </h3>
              <p className="text-sm text-muted-foreground">{routeData.tips}</p>
            </CardContent>
          </Card>
        )}

        {/* New Search Button */}
        <Button
          onClick={handleNewSearch}
          variant="outline"
          className="w-full bg-transparent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
          aria-label="Start a new route search"
        >
          Search New Route
        </Button>
      </main>
    </div>
  )
}
