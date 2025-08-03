"use client"

import { useState, useEffect } from "react"
import { X, Check, Clock, Brain, MapPin, AlertCircle, Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task } from "@/app/page"

interface FocusModeProps {
  task: Task
  onComplete: () => void
  onExit: () => void
}

export default function FocusMode({ task, onComplete, onExit }: FocusModeProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showBreakReminder, setShowBreakReminder] = useState(false)

  // Estimate total time in minutes
  const estimatedMinutes = task.timeEstimate === "quick" ? 15 : task.timeEstimate === "medium" ? 30 : 60

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1
          // Show break reminder after 25 minutes (Pomodoro technique)
          if (newTime === 25 * 60 && !showBreakReminder) {
            setShowBreakReminder(true)
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, showBreakReminder])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    return Math.min((timeElapsed / (estimatedMinutes * 60)) * 100, 100)
  }

  const getTimeLabel = (time: string) => {
    switch (time) {
      case "quick":
        return "<15 minutes"
      case "medium":
        return "~30 minutes"
      case "long":
        return "1+ hours"
      default:
        return time
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-400 to-purple-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">Focus Mode</Badge>
            <Button variant="ghost" size="icon" onClick={onExit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
          {task.description && <p className="text-gray-600">{task.description}</p>}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Task Info */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {getTimeLabel(task.timeEstimate)}
            </Badge>
            <Badge variant="secondary">
              <Brain className="h-3 w-3 mr-1" />
              {task.mentalLoad} mental load
            </Badge>
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              {task.location}
            </Badge>
            <Badge
              variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {task.priority} priority
            </Badge>
          </div>

          {/* Timer */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-mono font-bold text-gray-900">{formatTime(timeElapsed)}</div>

            <Progress value={getProgressPercentage()} className="w-full h-2" />

            <div className="text-sm text-gray-600">
              {timeElapsed < estimatedMinutes * 60
                ? `${Math.max(0, estimatedMinutes - Math.floor(timeElapsed / 60))} minutes remaining (estimated)`
                : "You're doing great! Take your time to finish."}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={() => setIsRunning(!isRunning)} size="lg" className="flex items-center gap-2">
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button
              onClick={() => {
                setTimeElapsed(0)
                setIsRunning(false)
                setShowBreakReminder(false)
              }}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Break Reminder */}
          {showBreakReminder && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <h4 className="font-medium text-yellow-800 mb-2">Time for a break?</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  You've been focused for 25 minutes. Consider taking a 5-minute break!
                </p>
                <Button size="sm" variant="outline" onClick={() => setShowBreakReminder(false)}>
                  Got it
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Completion */}
          <div className="flex gap-3">
            <Button onClick={onComplete} className="flex-1" size="lg">
              <Check className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
            <Button onClick={onExit} variant="outline" size="lg">
              Exit Focus
            </Button>
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">Focus Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Turn off notifications on your devices</li>
                <li>• Keep water nearby to stay hydrated</li>
                <li>• Take breaks every 25-30 minutes</li>
                <li>• Focus on just this one task</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
