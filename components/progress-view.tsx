"use client"

import { useMemo } from "react"
import { Calendar, Clock, Brain, TrendingUp, Target, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task } from "@/app/page"

interface ProgressViewProps {
  tasks: Task[]
}

export default function ProgressView({ tasks }: ProgressViewProps) {
  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed)
    const total = tasks.length
    const completionRate = total > 0 ? (completed.length / total) * 100 : 0

    // Tasks completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = completed.filter((task) => task.completedAt && task.completedAt >= today).length

    // Tasks completed this week
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const completedThisWeek = completed.filter((task) => task.completedAt && task.completedAt >= weekStart).length

    // Average completion time by mental load
    const mentalLoadStats = {
      low: completed.filter((task) => task.mentalLoad === "low").length,
      medium: completed.filter((task) => task.mentalLoad === "medium").length,
      high: completed.filter((task) => task.mentalLoad === "high").length,
    }

    // Time estimate distribution
    const timeStats = {
      quick: completed.filter((task) => task.timeEstimate === "quick").length,
      medium: completed.filter((task) => task.timeEstimate === "medium").length,
      long: completed.filter((task) => task.timeEstimate === "long").length,
    }

    // Most productive location
    const locationStats = {
      home: completed.filter((task) => task.location === "home").length,
      work: completed.filter((task) => task.location === "work").length,
      errands: completed.filter((task) => task.location === "errands").length,
      online: completed.filter((task) => task.location === "online").length,
      anywhere: completed.filter((task) => task.location === "anywhere").length,
    }

    const mostProductiveLocation = Object.entries(locationStats).reduce((a, b) =>
      locationStats[a[0] as keyof typeof locationStats] > locationStats[b[0] as keyof typeof locationStats] ? a : b,
    )[0]

    return {
      total,
      completed: completed.length,
      completionRate,
      completedToday,
      completedThisWeek,
      mentalLoadStats,
      timeStats,
      mostProductiveLocation,
    }
  }, [tasks])

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data yet</h3>
          <p className="text-gray-600">Complete some tasks to see your progress and insights!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your productivity and discover your patterns</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(stats.completionRate)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mental Load Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mental Load Preferences
            </CardTitle>
            <CardDescription>Which types of tasks do you complete most?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Mental Load</span>
                <Badge variant="secondary">{stats.mentalLoadStats.low} tasks</Badge>
              </div>
              <Progress value={(stats.mentalLoadStats.low / stats.completed) * 100} />

              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Mental Load</span>
                <Badge variant="secondary">{stats.mentalLoadStats.medium} tasks</Badge>
              </div>
              <Progress value={(stats.mentalLoadStats.medium / stats.completed) * 100} />

              <div className="flex items-center justify-between">
                <span className="text-sm">High Mental Load</span>
                <Badge variant="secondary">{stats.mentalLoadStats.high} tasks</Badge>
              </div>
              <Progress value={(stats.mentalLoadStats.high / stats.completed) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Preferences
            </CardTitle>
            <CardDescription>How do you prefer to spend your time?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Quick Tasks (&lt;15m)</span>
                <Badge variant="secondary">{stats.timeStats.quick} tasks</Badge>
              </div>
              <Progress value={(stats.timeStats.quick / stats.completed) * 100} />

              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Tasks (~30m)</span>
                <Badge variant="secondary">{stats.timeStats.medium} tasks</Badge>
              </div>
              <Progress value={(stats.timeStats.medium / stats.completed) * 100} />

              <div className="flex items-center justify-between">
                <span className="text-sm">Long Tasks (1hr+)</span>
                <Badge variant="secondary">{stats.timeStats.long} tasks</Badge>
              </div>
              <Progress value={(stats.timeStats.long / stats.completed) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
          <CardDescription>Discover patterns in your task completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Most Productive Location</h4>
              <p className="text-blue-800 capitalize">
                You complete the most tasks when you're <strong>{stats.mostProductiveLocation}</strong>
              </p>
            </div>

            {stats.completedToday > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Today's Achievement</h4>
                <p className="text-green-800">
                  Great job! You've completed <strong>{stats.completedToday}</strong> task
                  {stats.completedToday !== 1 ? "s" : ""} today.
                </p>
              </div>
            )}

            {stats.completionRate >= 80 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">High Achiever</h4>
                <p className="text-purple-800">
                  Impressive! You have a {Math.round(stats.completionRate)}% completion rate. Keep up the excellent
                  work!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
