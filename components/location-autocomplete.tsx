"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { getPlacePredictions, type PlacePrediction } from "@/lib/google-places"

interface LocationAutocompleteProps {
  id: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect?: (prediction: PlacePrediction) => void
  disabled?: boolean
  className?: string
  "aria-required"?: boolean
  "aria-describedby"?: string
}

export function LocationAutocomplete({
  id,
  placeholder,
  value,
  onChange,
  onSelect,
  disabled,
  className,
  ...ariaProps
}: LocationAutocompleteProps) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.trim().length >= 2) {
        setIsLoading(true)
        try {
          const results = await getPlacePredictions(value)
          setPredictions(results)
          setShowDropdown(results.length > 0)
        } catch (error) {
          console.error("[v0] Error getting predictions:", error)
          setPredictions([])
          setShowDropdown(false)
        } finally {
          setIsLoading(false)
        }
      } else {
        setPredictions([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handleSelect(predictions[selectedIndex])
        }
        break
      case "Escape":
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (prediction: PlacePrediction) => {
    onChange(prediction.description)
    onSelect?.(prediction)
    setShowDropdown(false)
    setSelectedIndex(-1)
    setPredictions([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)

    // Remove aria-invalid when user starts typing
    e.target.removeAttribute("aria-invalid")
  }

  const handleBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }, 150)
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowDropdown(true)
          }
        }}
        onBlur={handleBlur}
        disabled={disabled}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={selectedIndex >= 0 ? `${id}-option-${selectedIndex}` : undefined}
        {...ariaProps}
      />

      {showDropdown && (predictions.length > 0 || isLoading) && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto shadow-lg border bg-background"
          role="listbox"
          aria-label="Location suggestions"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Searching locations...
            </div>
          ) : (
            predictions.map((prediction, index) => (
              <div
                key={prediction.place_id}
                id={`${id}-option-${index}`}
                className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors hover:bg-muted ${
                  index === selectedIndex ? "bg-muted" : ""
                }`}
                onClick={() => handleSelect(prediction)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{prediction.structured_formatting.main_text}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  )
}
