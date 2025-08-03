"use client"

import { useState } from "react"
import { Download, FileText, Database, BarChart3, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/app/page"

interface DataExportProps {
  tasks: Task[]
}

type ExportFormat = "json" | "csv" | "txt" | "pdf"
type ExportType = "all" | "tasks" | "progress" | "completed" | "active"

export default function DataExport({ tasks }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json")
  const [exportType, setExportType] = useState<ExportType>("all")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const getFilteredTasks = () => {
    switch (exportType) {
      case "completed":
        return tasks.filter((task) => task.completed)
      case "active":
        return tasks.filter((task) => !task.completed)
      case "tasks":
        return tasks
      default:
        return tasks
    }
  }

  const generateProgressData = () => {
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

    // Mental load distribution
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

    // Location distribution
    const locationStats = {
      home: completed.filter((task) => task.location === "home").length,
      work: completed.filter((task) => task.location === "work").length,
      errands: completed.filter((task) => task.location === "errands").length,
      online: completed.filter((task) => task.location === "online").length,
      anywhere: completed.filter((task) => task.location === "anywhere").length,
    }

    return {
      summary: {
        totalTasks: total,
        completedTasks: completed.length,
        activeTasks: total - completed.length,
        completionRate: Math.round(completionRate),
        completedToday,
        completedThisWeek,
      },
      distributions: {
        mentalLoad: mentalLoadStats,
        timeEstimate: timeStats,
        location: locationStats,
      },
      exportDate: new Date().toISOString(),
    }
  }

  const exportAsJSON = () => {
    const filteredTasks = getFilteredTasks()
    const data: any = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportType,
        totalTasks: filteredTasks.length,
        appVersion: "1.0.0",
      },
      tasks: filteredTasks,
    }

    if (includeMetadata && (exportType === "all" || exportType === "progress")) {
      data.progressData = generateProgressData()
    }

    return JSON.stringify(data, null, 2)
  }

  const exportAsCSV = () => {
    const filteredTasks = getFilteredTasks()
    const headers = [
      "Title",
      "Description",
      "Time Estimate",
      "Mental Load",
      "Location",
      "Priority",
      "Completed",
      "Created Date",
      "Completed Date",
      "Due Date",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredTasks.map((task) =>
        [
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || "").replace(/"/g, '""')}"`,
          task.timeEstimate,
          task.mentalLoad,
          task.location,
          task.priority,
          task.completed ? "Yes" : "No",
          task.createdAt.toISOString(),
          task.completedAt ? task.completedAt.toISOString() : "",
          task.dueDate ? task.dueDate.toISOString() : "",
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }

  const exportAsText = () => {
    const filteredTasks = getFilteredTasks()
    let content = `CheckMate Task Export\n`
    content += `Export Date: ${new Date().toLocaleString()}\n`
    content += `Export Type: ${exportType}\n`
    content += `Total Tasks: ${filteredTasks.length}\n\n`

    if (includeMetadata && (exportType === "all" || exportType === "progress")) {
      const progressData = generateProgressData()
      content += `PROGRESS SUMMARY\n`
      content += `================\n`
      content += `Completion Rate: ${progressData.summary.completionRate}%\n`
      content += `Completed Today: ${progressData.summary.completedToday}\n`
      content += `Completed This Week: ${progressData.summary.completedThisWeek}\n\n`
    }

    content += `TASKS\n`
    content += `=====\n\n`

    filteredTasks.forEach((task, index) => {
      content += `${index + 1}. ${task.title}\n`
      if (task.description) content += `   Description: ${task.description}\n`
      content += `   Time: ${task.timeEstimate} | Mental Load: ${task.mentalLoad} | Location: ${task.location}\n`
      content += `   Priority: ${task.priority} | Status: ${task.completed ? "Completed" : "Active"}\n`
      content += `   Created: ${task.createdAt.toLocaleDateString()}\n`
      if (task.completedAt) content += `   Completed: ${task.completedAt.toLocaleDateString()}\n`
      if (task.dueDate) content += `   Due: ${task.dueDate.toLocaleDateString()}\n`
      content += `\n`
    })

    return content
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const timestamp = new Date().toISOString().split("T")[0]
      let content: string
      let filename: string
      let mimeType: string

      switch (exportFormat) {
        case "json":
          content = exportAsJSON()
          filename = `checkmate-${exportType}-${timestamp}.json`
          mimeType = "application/json"
          break
        case "csv":
          content = exportAsCSV()
          filename = `checkmate-${exportType}-${timestamp}.csv`
          mimeType = "text/csv"
          break
        case "txt":
          content = exportAsText()
          filename = `checkmate-${exportType}-${timestamp}.txt`
          mimeType = "text/plain"
          break
        default:
          throw new Error("Unsupported export format")
      }

      downloadFile(content, filename, mimeType)

      toast({
        title: "Export Successful",
        description: `Your data has been exported as ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getExportPreview = () => {
    const filteredTasks = getFilteredTasks()
    const completed = filteredTasks.filter((task) => task.completed).length
    const active = filteredTasks.length - completed

    return {
      total: filteredTasks.length,
      completed,
      active,
    }
  }

  const preview = getExportPreview()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>Download your tasks and progress data for backup or analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Type</label>
            <Select value={exportType} onValueChange={(value: ExportType) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="tasks">All Tasks</SelectItem>
                <SelectItem value="active">Active Tasks Only</SelectItem>
                <SelectItem value="completed">Completed Tasks Only</SelectItem>
                <SelectItem value="progress">Progress Data Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">File Format</label>
            <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON (Structured Data)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text (Human Readable)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
            />
            <label htmlFor="metadata" className="text-sm font-medium">
              Include progress analytics and metadata
            </label>
          </div>
        </div>

        {/* Export Preview */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Export Preview
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{preview.total}</div>
              <div className="text-xs text-gray-600">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{preview.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{preview.active}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </div>

          {includeMetadata && (exportType === "all" || exportType === "progress") && (
            <div className="mt-3 pt-3 border-t">
              <Badge variant="secondary" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Progress analytics included
              </Badge>
            </div>
          )}
        </div>

        {/* Format Information */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Format Information</h4>
          <div className="text-sm text-blue-800">
            {exportFormat === "json" && (
              <p>
                JSON format includes all task data in a structured format, perfect for importing into other apps or
                programming analysis.
              </p>
            )}
            {exportFormat === "csv" && (
              <p>
                CSV format can be opened in Excel, Google Sheets, or other spreadsheet applications for data analysis
                and visualization.
              </p>
            )}
            {exportFormat === "txt" && (
              <p>Text format provides a human-readable summary of your tasks, perfect for printing or sharing.</p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} disabled={isExporting || tasks.length === 0} className="w-full" size="lg">
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {exportType === "all" ? "All Data" : exportType.charAt(0).toUpperCase() + exportType.slice(1)}
            </>
          )}
        </Button>

        {tasks.length === 0 && (
          <p className="text-sm text-gray-500 text-center">No tasks to export. Create some tasks first!</p>
        )}

        {/* Usage Tips */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Export Tips
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Export regularly to backup your data</li>
              <li>• Use CSV format for spreadsheet analysis</li>
              <li>• JSON format preserves all data for re-importing</li>
              <li>• Text format is great for sharing or printing</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
