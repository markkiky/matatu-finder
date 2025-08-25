"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { popularDestinations } from "@/lib/mock-data"
import { getCurrentLocation } from "@/lib/google-routes"
import { LocationAutocomplete } from "@/components/location-autocomplete"
import type { PlacePrediction } from "@/lib/google-places"

export default function HomePage() {
  const [currentLocation, setCurrentLocation] = useState("")
  const [destination, setDestination] = useState("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleUseMyLocation = async () => {
    setIsLoadingLocation(true)

    if ("geolocation" in navigator) {
      try {
        const locationName = await getCurrentLocation()

        if (locationName) {
          setCurrentLocation(locationName)
        } else {
          throw new Error("Could not determine location name")
        }
      } catch (error) {
        console.error("Error getting location:", error)
        const errorMessage =
          error instanceof GeolocationPositionError
            ? "Location access denied. Please enter your location manually."
            : "Unable to get your location. Please enter it manually."
        alert(errorMessage)
      }
    } else {
      alert("Geolocation is not supported by this browser. Please enter your location manually.")
    }

    setIsLoadingLocation(false)
  }

  const handlePopularDestinationClick = (dest: string) => {
    setDestination(dest)
    const destinationInput = document.getElementById("destination") as HTMLInputElement
    if (destinationInput) {
      destinationInput.focus()
    }
  }

  const handleCurrentLocationSelect = (prediction: PlacePrediction) => {
    console.log("[v0] Selected current location:", prediction.description)
  }

  const handleDestinationSelect = (prediction: PlacePrediction) => {
    console.log("[v0] Selected destination:", prediction.description)
  }

  const handleFindMatatu = async () => {
    if (!currentLocation.trim() || !destination.trim()) {
      const missingField = !currentLocation.trim() ? "current-location" : "destination"
      const fieldElement = document.getElementById(missingField) as HTMLInputElement
      if (fieldElement) {
        fieldElement.focus()
        fieldElement.setAttribute("aria-invalid", "true")
      }
      alert("Please enter both current location and destination")
      return
    }

    setIsSearching(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const params = new URLSearchParams({
      from: currentLocation,
      to: destination,
    })
    router.push(`/results?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4" role="banner">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center">Matatu Finder</h1>
          <p className="text-center text-sm opacity-90 mt-1">Find your route in Nairobi</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6" role="main">
        {/* Location Inputs */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="current-location" className="text-sm font-medium text-foreground">
                Current Location
                <span className="sr-only">Required field</span>
              </label>
              <div className="flex gap-2">
                <LocationAutocomplete
                  id="current-location"
                  placeholder="Enter your current location"
                  value={currentLocation}
                  onChange={setCurrentLocation}
                  onSelect={handleCurrentLocationSelect}
                  className="flex-1 transition-all duration-200 focus:scale-[1.02]"
                  disabled={isSearching}
                  aria-required={true}
                  aria-describedby="current-location-help"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUseMyLocation}
                  disabled={isLoadingLocation || isSearching}
                  className="shrink-0 bg-transparent transition-all duration-200 hover:scale-105"
                  aria-label="Use my current location"
                  title="Use my current location"
                >
                  {isLoadingLocation ? (
                    <div
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
                      aria-label="Getting location"
                    />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div id="current-location-help" className="sr-only">
                Enter your starting location or use the location button to detect automatically
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-medium text-foreground">
                Destination
                <span className="sr-only">Required field</span>
              </label>
              <LocationAutocomplete
                id="destination"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={setDestination}
                onSelect={handleDestinationSelect}
                disabled={isSearching}
                className="transition-all duration-200 focus:scale-[1.02]"
                aria-required={true}
                aria-describedby="destination-help"
              />
              <div id="destination-help" className="sr-only">
                Enter your destination or select from popular destinations below
              </div>
            </div>

            <Button
              onClick={handleFindMatatu}
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
              disabled={isSearching}
              aria-describedby="search-status"
            >
              {isSearching ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"
                    aria-label="Searching"
                  />
                  Searching Routes...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find My Matatu
                </>
              )}
            </Button>
            <div id="search-status" className="sr-only" aria-live="polite">
              {isSearching ? "Searching for matatu routes" : "Ready to search"}
            </div>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Popular Destinations</h2>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Popular destinations quick select">
              {popularDestinations.map((dest, index) => (
                <Button
                  key={dest}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePopularDestinationClick(dest)}
                  onKeyDown={(e) => handleKeyDown(e, () => handlePopularDestinationClick(dest))}
                  className="text-left justify-start h-auto py-3 px-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSearching}
                  aria-label={`Select ${dest} as destination`}
                  tabIndex={0}
                >
                  <MapPin className="w-3 h-3 mr-2 shrink-0" aria-hidden="true" />
                  <span className="text-xs">{dest}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
      </main>
    </div>
  )
}
