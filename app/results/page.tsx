"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, MapPin, Clock, DollarSign, ChevronDown, AlertCircle, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { findRouteData, getRandomLoadingMessage, type RouteData } from "@/lib/mock-data"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [routeData, setRouteData] = useState<RouteData | null>(null)

  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""

  useEffect(() => {
    const loadData = async () => {
      setLoadingMessage(getRandomLoadingMessage())

      const messageInterval = setInterval(() => {
        setLoadingMessage(getRandomLoadingMessage())
      }, 800)

      await new Promise((resolve) => setTimeout(resolve, 2500))

      clearInterval(messageInterval)

      const data = findRouteData(to)
      setRouteData(data)
      setIsLoading(false)

      if (data) {
        const announcement = `Route found. Board at ${data.stage} using routes ${data.routes.join(", ")}`
        const ariaLive = document.createElement("div")
        ariaLive.setAttribute("aria-live", "polite")
        ariaLive.setAttribute("aria-atomic", "true")
        ariaLive.className = "sr-only"
        ariaLive.textContent = announcement
        document.body.appendChild(ariaLive)
        setTimeout(() => document.body.removeChild(ariaLive), 1000)
      }
    }

    loadData()
  }, [to])

  const handleBack = () => {
    router.back()
  }

  const handleNewSearch = () => {
    router.push("/")
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

  if (!routeData) {
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
              <h2 className="text-lg font-semibold">No Routes Found</h2>
              <p className="text-muted-foreground">
                Sorry, we couldn't find any matatu routes for "{to}". Try searching for popular destinations like CBD,
                Westlands, or Karen.
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
          <h1 className="text-xl font-bold">Route Results</h1>
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
      <main className="max-w-md mx-auto p-4 space-y-4" role="main">
        {/* Recommended Route */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" aria-hidden="true" />
              Recommended Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-card-foreground">Board at: {routeData.stage}</h3>
                <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Available routes">
                  {routeData.routes.map((route) => (
                    <Badge
                      key={route}
                      variant="default"
                      className="text-sm transition-all duration-200 hover:scale-105"
                      role="listitem"
                    >
                      Route {route}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4" role="group" aria-label="Route details">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fare</p>
                    <p className="font-medium" aria-label={`Fare range ${routeData.fare}`}>
                      {routeData.fare}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium" aria-label={`Travel time ${routeData.time}`}>
                      {routeData.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-card-foreground flex items-center gap-2">
              <Info className="w-4 h-4" aria-hidden="true" />
              Travel Tips
            </h3>
            <p className="text-sm text-muted-foreground">{routeData.tips}</p>
          </CardContent>
        </Card>

        {/* Alternatives */}
        {routeData.alternatives.length > 0 && (
          <Collapsible open={showAlternatives} onOpenChange={setShowAlternatives}>
            <CollapsibleTrigger asChild>
              <Card
                className="cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, () => setShowAlternatives(!showAlternatives))}
                aria-expanded={showAlternatives}
                aria-controls="alternatives-content"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">
                      Alternative Routes ({routeData.alternatives.length})
                    </h3>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${showAlternatives ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 transition-all duration-200" id="alternatives-content">
              {routeData.alternatives.map((alt, index) => (
                <Card key={index} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-card-foreground">Board at: {alt.stage}</h4>
                      <div
                        className="flex flex-wrap gap-2 mt-2"
                        role="list"
                        aria-label={`Alternative ${index + 1} routes`}
                      >
                        {alt.routes.map((route) => (
                          <Badge
                            key={route}
                            variant="outline"
                            className="text-sm transition-all duration-200 hover:scale-105"
                            role="listitem"
                          >
                            Route {route}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div
                      className="grid grid-cols-2 gap-4 text-sm"
                      role="group"
                      aria-label={`Alternative ${index + 1} details`}
                    >
                      <div>
                        <p className="text-muted-foreground">Fare</p>
                        <p className="font-medium" aria-label={`Alternative fare ${alt.fare}`}>
                          {alt.fare}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Time</p>
                        <p className="font-medium" aria-label={`Alternative time ${alt.time}`}>
                          {alt.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* New Search Button */}
        <Button
          onClick={handleNewSearch}
          variant="outline"
          className="w-full bg-transparent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Start a new route search"
        >
          Search New Route
        </Button>
      </main>
    </div>
  )
}
