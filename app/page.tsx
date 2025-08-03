"use client"

import { useState, useEffect } from "react"
import { Plus, Brain, Clock, MapPin, Target, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskCreator from "@/components/task-creator"
import ContextSelector from "@/components/context-selector"
import TaskList from "@/components/task-list"
import FocusMode from "@/components/focus-mode"
import ProgressView from "@/components/progress-view"
import DataExport from "@/components/data-export"

export interface Task {
  id: string
  title: string
  description?: string
  timeEstimate: "quick" | "medium" | "long" // <15m, 30m, 1hr+
  mentalLoad: "low" | "medium" | "high"
  location: "home" | "work" | "errands" | "online" | "anywhere"
  priority: "low" | "medium" | "high"
  completed: boolean
  createdAt: Date
  completedAt?: Date
  dueDate?: Date
}

export interface UserContext {
  availableTime: "quick" | "medium" | "long"
  energyLevel: "low" | "medium" | "high"
  currentLocation: "home" | "work" | "errands" | "online" | "anywhere"
}

export default function CheckMate() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [context, setContext] = useState<UserContext>({
    availableTime: "medium",
    energyLevel: "medium",
    currentLocation: "anywhere",
  })
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState("tasks")

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("checkmate-tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }))
      setTasks(parsedTasks)
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("checkmate-tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = (newTask: Omit<Task, "id" | "completed" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
    }
    setTasks((prev) => [...prev, task])
    setShowTaskCreator(false)
  }

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task,
      ),
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    if (focusTask?.id === taskId) {
      setFocusTask(null)
    }
  }

  const getSuggestedTasks = () => {
    const incompleteTasks = tasks.filter((task) => !task.completed)

    return incompleteTasks
      .filter((task) => {
        // Filter by location compatibility
        if (task.location !== "anywhere" && task.location !== context.currentLocation) {
          return false
        }

        // Filter by time availability
        const timeMatch = {
          quick: ["quick"],
          medium: ["quick", "medium"],
          long: ["quick", "medium", "long"],
        }
        if (!timeMatch[context.availableTime].includes(task.timeEstimate)) {
          return false
        }

        // Filter by energy level
        const energyMatch = {
          low: ["low"],
          medium: ["low", "medium"],
          high: ["low", "medium", "high"],
        }
        if (!energyMatch[context.energyLevel].includes(task.mentalLoad)) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        // Sort by priority, then by creation date
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
      .slice(0, 5) // Show top 5 suggestions
  }

  if (focusTask) {
    return (
      <FocusMode
        task={focusTask}
        onComplete={() => {
          toggleTask(focusTask.id)
          setFocusTask(null)
        }}
        onExit={() => setFocusTask(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CheckMate</h1>
          <p className="text-gray-600">Smarter To-Dos, Just for You</p>
        </div>

        {/* Context Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Your Current Context
            </CardTitle>
            <CardDescription>Help us suggest the best tasks for your situation</CardDescription>
          </CardHeader>
          <CardContent>
            <ContextSelector context={context} onChange={setContext} />
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        {getSuggestedTasks().length > 0 && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="h-5 w-5" />
                Perfect for Right Now
              </CardTitle>
              <CardDescription className="text-green-600">
                Based on your current context, here's what you can tackle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getSuggestedTasks()
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.timeEstimate === "quick" ? "<15m" : task.timeEstimate === "medium" ? "30m" : "1hr+"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            {task.mentalLoad}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {task.location}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setFocusTask(task)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Focus
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleTask(task.id)}>
                          Done
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Tasks</h2>
              <Button onClick={() => setShowTaskCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onFocus={setFocusTask} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressView tasks={tasks} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
             

              <DataExport tasks={tasks} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Task Creator Modal */}
        {showTaskCreator && <TaskCreator onSave={addTask} onCancel={() => setShowTaskCreator(false)} />}
      </div>
    </div>
  )
}
