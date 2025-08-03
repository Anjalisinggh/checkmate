"use client"

import type React from "react"

import { useState } from "react"
import { X, Clock, Brain, MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/app/page"

interface TaskCreatorProps {
  onSave: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
  onCancel: () => void
}

export default function TaskCreator({ onSave, onCancel }: TaskCreatorProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeEstimate, setTimeEstimate] = useState<"quick" | "medium" | "long">("medium")
  const [mentalLoad, setMentalLoad] = useState<"low" | "medium" | "high">("medium")
  const [location, setLocation] = useState<"home" | "work" | "errands" | "online" | "anywhere">("anywhere")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      timeEstimate,
      mentalLoad,
      location,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Task</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Smart Tags */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Smart Tags</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Estimate
                  </Label>
                  <Select value={timeEstimate} onValueChange={(value: any) => setTimeEstimate(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick (&lt;15 minutes)</SelectItem>
                      <SelectItem value="medium">Medium (~30 minutes)</SelectItem>
                      <SelectItem value="long">Long (1+ hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Mental Load
                  </Label>
                  <Select value={mentalLoad} onValueChange={(value: any) => setMentalLoad(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (routine, easy)</SelectItem>
                      <SelectItem value="medium">Medium (some focus needed)</SelectItem>
                      <SelectItem value="high">High (deep focus required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Select value={location} onValueChange={(value: any) => setLocation(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anywhere">Anywhere</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="errands">Out & About</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Optional Due Date */}
            <div>
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeLabel(timeEstimate)}
                </Badge>
                <Badge variant="secondary">
                  <Brain className="h-3 w-3 mr-1" />
                  {mentalLoad} mental load
                </Badge>
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                </Badge>
                <Badge variant={priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary"}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {priority} priority
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Task
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
