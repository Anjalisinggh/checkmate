"use client"

import { Clock, Brain, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { UserContext } from "@/app/page"

interface ContextSelectorProps {
  context: UserContext
  onChange: (context: UserContext) => void
}

export default function ContextSelector({ context, onChange }: ContextSelectorProps) {
  const updateContext = (key: keyof UserContext, value: string) => {
    onChange({ ...context, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Available Time */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4" />
          <span className="font-medium">How much time do you have?</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "quick", label: "Quick (<15m)", desc: "Just a few minutes" },
            { value: "medium", label: "Medium (~30m)", desc: "Half hour or so" },
            { value: "long", label: "Long (1hr+)", desc: "Plenty of time" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={context.availableTime === option.value ? "default" : "outline"}
              onClick={() => updateContext("availableTime", option.value as any)}
              className="flex-col h-auto p-3"
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-xs opacity-70">{option.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Energy Level */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4" />
          <span className="font-medium">How's your energy level?</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "low", label: "Low Energy", desc: "Feeling tired", color: "bg-red-100 text-red-800" },
            { value: "medium", label: "Medium Energy", desc: "Pretty good", color: "bg-yellow-100 text-yellow-800" },
            {
              value: "high",
              label: "High Energy",
              desc: "Ready to tackle anything",
              color: "bg-green-100 text-green-800",
            },
          ].map((option) => (
            <Button
              key={option.value}
              variant={context.energyLevel === option.value ? "default" : "outline"}
              onClick={() => updateContext("energyLevel", option.value as any)}
              className="flex-col h-auto p-3"
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-xs opacity-70">{option.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Where are you right now?</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "home", label: "Home", desc: "At home" },
            { value: "work", label: "Work", desc: "At the office" },
            { value: "errands", label: "Out & About", desc: "Running errands" },
            { value: "online", label: "Online", desc: "On my computer" },
            { value: "anywhere", label: "Anywhere", desc: "Location flexible" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={context.currentLocation === option.value ? "default" : "outline"}
              onClick={() => updateContext("currentLocation", option.value as any)}
              className="flex-col h-auto p-3"
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-xs opacity-70">{option.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Current Context Summary */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Your Current Context</h4>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            {context.availableTime === "quick" ? "<15m" : context.availableTime === "medium" ? "~30m" : "1hr+"}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            {context.energyLevel} energy
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <MapPin className="h-3 w-3 mr-1" />
            {context.currentLocation}
          </Badge>
        </div>
      </div>
    </div>
  )
}
