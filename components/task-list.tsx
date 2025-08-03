"use client"

import { useState } from "react"
import { Check, Clock, Brain, MapPin, AlertCircle, Trash2, Focus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/app/page"

interface TaskListProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onFocus: (task: Task) => void
}

export default function TaskList({ tasks, onToggle, onDelete, onFocus }: TaskListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active")
  const [sortBy, setSortBy] = useState<"created" | "priority" | "time">("priority")

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
    }
    if (sortBy === "time") {
      const timeOrder = { quick: 1, medium: 2, long: 3 }
      if (timeOrder[a.timeEstimate] !== timeOrder[b.timeEstimate]) {
        return timeOrder[a.timeEstimate] - timeOrder[b.timeEstimate]
      }
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const getTimeLabel = (time: string) => {
    switch (time) {
      case "quick":
        return "<15m"
      case "medium":
        return "30m"
      case "long":
        return "1hr+"
      default:
        return time
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Check className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600">Create your first task to get started with CheckMate!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sorting */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="time">Sort by Time</SelectItem>
            <SelectItem value="created">Sort by Created</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600">
          {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <Card key={task.id} className={`transition-all ${task.completed ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} className="mt-1" />

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>{task.title}</h3>

                  {task.description && (
                    <p className={`text-sm mt-1 ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeLabel(task.timeEstimate)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      {task.mentalLoad}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {task.location}
                    </Badge>
                    <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {task.priority}
                    </Badge>
                  </div>

                  {task.dueDate && (
                    <div className="text-xs text-gray-500 mt-1">Due: {task.dueDate.toLocaleDateString()}</div>
                  )}
                </div>

                <div className="flex gap-1">
                  {!task.completed && (
                    <Button size="sm" variant="outline" onClick={() => onFocus(task)} className="text-xs">
                      <Focus className="h-3 w-3 mr-1" />
                      Focus
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
