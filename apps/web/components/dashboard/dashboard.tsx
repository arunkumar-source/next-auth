"use client"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

import { XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,LineChart, Line, Radar } from "recharts"
import { useWorks } from "@/hooks/use-works"
import { getStatusData, getDateData } from "@/lib/dashdata"

export default function Dashboard() {
  const { data: works = [], isLoading, error } = useWorks()

  const status = getStatusData(works)
  const dateData = getDateData(works)

  // Calculate status over time data for line chart
  const getStatusOverTimeData = () => {
    type StatusMap = { [key: string]: { todo: number; 'in-progress': number; done: number; backlog: number; cancelled: number } }
    const statusMap: StatusMap = {}
    const sortedDates: string[] = []

    // First, collect all relevant dates and sort them
    works.forEach(work => {
      let date: string
      if (work.status === 'done' && work.endDate) {
        date = new Date(work.endDate).toLocaleDateString()
      } else if (work.createdAt) {
        date = new Date(work.createdAt).toLocaleDateString()
      } else {
        return // Skip if no relevant date is available
      }
      
      if (!sortedDates.includes(date)) {
        sortedDates.push(date)
      }
    })

    // Sort dates chronologically
    sortedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Calculate cumulative counts for each date
    sortedDates.forEach((currentDate, index) => {
      const counts = {
        todo: 0,
        'in-progress': 0,
        done: 0,
        backlog: 0,
        cancelled: 0
      }

      // Count all works that should be included up to this date
      works.forEach(work => {
        let workDate: string
        if (work.status === 'done' && work.endDate) {
          workDate = new Date(work.endDate).toLocaleDateString()
        } else if (work.createdAt) {
          workDate = new Date(work.createdAt).toLocaleDateString()
        } else {
          return
        }

        // Include this work if its date is on or before the current date
        if (new Date(workDate).getTime() <= new Date(currentDate).getTime()) {
          if (work.status && work.status in counts) {
            counts[work.status as keyof typeof counts]++
          }
        }
      })

      statusMap[currentDate] = counts
    })

    return Object.keys(statusMap)
      .map(date => ({
        date,
        ...statusMap[date]
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Calculate additional metrics
  const backlogCount = works.filter(w => w.status === 'backlog').length
  const cancelledCount = works.filter(w => w.status === 'cancelled').length

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF6B6B", "#F59E0B"]

    const pieData = [
      { name: "Todo", value: status.todo },
      { name: "In Progress", value: status["in-progress"] },
      { name: "Done", value: status.done },
      { name: "Backlog", value: backlogCount },
      { name: "Cancelled", value: cancelledCount },
    ]

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="p-4 border border-gray-300 bg-white text-black">
            <p className="bg-white text-black text-sm">Todo</p>
            <p className="text-2xl font-bold">{status.todo}</p>
          </Card>
          <Card className="p-4 border border-gray-300 bg-white text-black">
            <p className="bg-white text-black text-sm">In Progress</p>
            <p className="text-2xl font-bold">{status["in-progress"]}</p>
          </Card>
          <Card className="p-4 border border-gray-300 bg-white text-black">
            <p className="bg-white text-black text-sm">Done</p>
            <p className="text-2xl font-bold">{status.done}</p>
          </Card>
          <Card className="p-4 border border-gray-300 bg-white text-black">
            <p className="bg-white text-black text-sm">Backlog</p>
            <p className="text-2xl font-bold">{backlogCount}</p>
          </Card>
          <Card className="p-4 border border-gray-300 bg-white text-black">
            <p className="bg-white text-black text-sm">Cancelled</p>
            <p className="text-2xl font-bold">{cancelledCount}</p>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white text-black">


          {/* STATUS RADAR */}
          <ResponsiveContainer width="100%" height={400}>
            <Card className="bg-white text-black border border-gray-300">
              <div className="p-4">
                <p className="font-medium mb-4 text-black">Task Status Overview</p>

                <ChartContainer
                  config={{
                    Todo: { label: "Todo" },
                    "In Progress": { label: "In-Progress" },
                    Done: { label: "Done" },
                    Backlog: { label: "Backlog" },
                    Cancelled: { label: "Cancelled" },
                  }}
                  className="h-75 w-full"
                >
                  <RadarChart data={[
                    { subject: "Todo", value: status.todo },
                    { subject: "In Progress", value: status["in-progress"] },
                    { subject: "Done", value: status.done },
                    { subject: "Backlog", value: backlogCount },
                    { subject: "Cancelled", value: cancelledCount },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                    <Radar dataKey="value" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ChartContainer>
              </div>
            </Card>
          </ResponsiveContainer>

          {/* STATUS LINE CHART */}
          <ResponsiveContainer width="100%" height={400}>
            <Card className="bg-white text-black border border-gray-300">
              <div className="p-4">
                <p className="font-medium mb-4 text-black">Status Over Time</p>

                <ChartContainer
                  config={{
                    todo: { label: "Todo", color: "#EAB308" },
                    inProgress: { label: "In Progress", color: "#3B82F6" },
                    done: { label: "Done", color: "#10B981" },
                    backlog: { label: "Backlog", color: "#6B7280" },
                    cancelled: { label: "Cancelled", color: "#EF4444" },
                  }}
                  className="h-75 w-full"
                >
                  <LineChart data={getStatusOverTimeData()}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="linear" dataKey="todo" stroke="#EAB308" strokeWidth={2} dot={false} />
                    <Line type="linear" dataKey="in-progress" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line type="linear" dataKey="done" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="linear" dataKey="backlog" stroke="#6B7280" strokeWidth={2} dot={false} />
                    <Line type="linear" dataKey="cancelled" stroke="#EF4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </div>
            </Card>
          </ResponsiveContainer>

        </div>

        {/* SEPARATE WORKS LISTS */}
        <div className="space-y-6 mt-20">
          {/* TODO */}
          <Card className="p-4 bg-white text-black border border-gray-300">
            <p className="font-medium mb-4 text-black">Todo ({works.filter(w => w.status === 'todo').length})</p>
            <div className="space-y-3">
              {works.filter(w => w.status === 'todo').map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-xs text-gray-600">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <Badge className="bg-yellow-500 text-white">{w.status}</Badge>
                </div>
              ))}
              {works.filter(w => w.status === 'todo').length === 0 && (
                <p className="text-sm text-gray-600">No todo items</p>
              )}
            </div>
          </Card>

          {/* IN PROGRESS */}
          <Card className="p-4 bg-white text-black border border-gray-300">
            <p className="font-medium mb-4 text-black">In Progress ({works.filter(w => w.status === 'in-progress').length})</p>
            <div className="space-y-3">
              {works.filter(w => w.status === 'in-progress').map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-xs text-gray-600">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <Badge className="bg-blue-500 text-white">{w.status}</Badge>
                </div>
              ))}
              {works.filter(w => w.status === 'in-progress').length === 0 && (
                <p className="text-sm text-gray-600">No in-progress items</p>
              )}
            </div>
          </Card>

          {/* DONE */}
          <Card className="p-4 bg-white text-black border border-gray-300">
            <p className="font-medium mb-4 text-black">Done ({works.filter(w => w.status === 'done').length})</p>
            <div className="space-y-3">
              {works.filter(w => w.status === 'done').map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-xs text-gray-600">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white">{w.status}</Badge>
                </div>
              ))}
              {works.filter(w => w.status === 'done').length === 0 && (
                <p className="text-sm text-gray-600">No done items</p>
              )}
            </div>
          </Card>

          {/* BACKLOG */}
          <Card className="p-4 bg-white text-black border border-gray-300">
            <p className="font-medium mb-4 text-black">Backlog ({works.filter(w => w.status === 'backlog').length})</p>
            <div className="space-y-3">
              {works.filter(w => w.status === 'backlog').map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-xs text-gray-600">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <Badge className="bg-gray-500 text-white">{w.status}</Badge>
                </div>
              ))}
              {works.filter(w => w.status === 'backlog').length === 0 && (
                <p className="text-sm text-gray-600">No backlog items</p>
              )}
            </div>
          </Card>

          {/* CANCELLED */}
          <Card className="p-4 bg-white text-black border border-gray-300">
            <p className="font-medium mb-4 text-black">Cancelled ({works.filter(w => w.status === 'cancelled').length})</p>
            <div className="space-y-3">
              {works.filter(w => w.status === 'cancelled').map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-xs text-gray-600">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <Badge className="bg-red-500 text-white">{w.status}</Badge>
                </div>
              ))}
              {works.filter(w => w.status === 'cancelled').length === 0 && (
                <p className="text-sm text-gray-600">No cancelled items</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }
