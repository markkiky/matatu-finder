import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  CornerUpRight,
  MapPin,
  Footprints,
  Bus,
  Navigation,
  Clock,
  Users,
} from "lucide-react"
import type { RouteStep } from "@/lib/google-routes"

interface RouteStepsProps {
  steps: RouteStep[]
}

const getStepIcon = (iconName: string) => {
  const iconMap = {
    "arrow-up": ArrowUp,
    "arrow-left": ArrowLeft,
    "arrow-right": ArrowRight,
    "corner-up-right": CornerUpRight,
    "map-pin": MapPin,
    footprints: Footprints,
    walk: Footprints,
    bus: Bus,
    navigation: Navigation,
  }

  const IconComponent = iconMap[iconName as keyof typeof iconMap] || ArrowUp
  return <IconComponent className="w-5 h-5" />
}

const getTravelModeColor = (travelMode: string) => {
  switch (travelMode) {
    case "WALK":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "TRANSIT":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function RouteSteps({ steps }: RouteStepsProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" aria-hidden="true" />
          Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0 border-border/50"
            role="listitem"
          >
            {/* Step Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
              {getStepIcon(step.icon)}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-foreground leading-relaxed">{step.instruction}</p>
                {step.travelMode && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-1 flex-shrink-0 ${getTravelModeColor(step.travelMode)}`}
                  >
                    {step.travelMode === "WALK" ? "Walk" : step.travelMode === "TRANSIT" ? "Matatu" : step.travelMode}
                  </Badge>
                )}
              </div>

              {step.transitDetails && (
                <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-2">
                  {/* Route Number and Line Info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {step.transitDetails.line?.shortName && (
                      <Badge variant="default" className="text-sm font-bold">
                        {step.transitDetails.line.shortName}
                      </Badge>
                    )}
                    {step.transitDetails.line?.name && (
                      <span className="text-sm text-muted-foreground">{step.transitDetails.line.name}</span>
                    )}
                  </div>

                  {/* Departure and Arrival Times */}
                  {(step.transitDetails.departureTime || step.transitDetails.arrivalTime) && (
                    <div className="flex items-center gap-4 text-sm">
                      {step.transitDetails.departureTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{step.transitDetails.departureTime}</span>
                        </div>
                      )}
                      {step.transitDetails.arrivalTime && (
                        <div className="flex items-center gap-1">
                          <span>→</span>
                          <span>{step.transitDetails.arrivalTime}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stops Information */}
                  <div className="space-y-1">
                    {step.transitDetails.departureStop?.name && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3 h-3 text-green-600" />
                        <span className="text-muted-foreground">From:</span>
                        <span className="font-medium">{step.transitDetails.departureStop.name}</span>
                      </div>
                    )}
                    {step.transitDetails.arrivalStop?.name && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3 h-3 text-red-600" />
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-medium">{step.transitDetails.arrivalStop.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Frequency and Stops Count */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {step.transitDetails.frequency && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{step.transitDetails.frequency}</span>
                      </div>
                    )}
                    {step.transitDetails.numStops && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{step.transitDetails.numStops} stops</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Distance and Duration */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {step.distance && step.distance !== "Unknown distance" && (
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                    {step.distance}
                  </span>
                )}
                {step.duration && step.duration !== "Unknown time" && (
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                    {step.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
