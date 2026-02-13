"use client"

import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { useWorks, useUpdateWork } from "@/hooks/use-works"
import { useTaskDeadlineChecker } from "@/hooks/use-task-deadline-checker"
import { useState } from "react"
import { KanbanColumn } from "./KanbanColoumn"

const COLUMNS = [
  { id: "backlog", title: "Backlogs" },
  { id: "todo", title: "Todo" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
  { id: "cancelled", title: "Cancel" },
] as const

export function KanbanBoard() {
  const { data: works = [], isLoading: loading, error } = useWorks()
  const errorMessage = error?.message || "An error occurred in kanban board"
  const { mutate: updateWork, isPending: isUpdating } = useUpdateWork()
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  
  // Initialize deadline checker
  useTaskDeadlineChecker()

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      console.log("No destination, dropping outside")
      return
    }

    const { draggableId, destination, source } = result

    // Don't do anything if dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log("Dropped in the same position")
      return
    }

    console.log("Dragged item:", draggableId)
    console.log("From:", source.droppableId, "To:", destination.droppableId)

    // Find the work item being dragged
    const work = works.find((w) => w.id === draggableId)
    if (!work) {
      console.error("Work item not found:", draggableId)
      return
    }

    // Prevent moving completed tasks from "done" status
    if (work.status === "done") {
      console.log("Cannot move completed task from 'done' status")
      return
    }

    // Update the status based on the destination column
    const newStatus = destination.droppableId as "backlog" | "todo" | "in-progress" | "done" | "cancelled"
    
    // Only update if status has changed
    if (work.status !== newStatus) {
      console.log(`Updating work ${work.id} status from ${work.status} to ${newStatus}`)
      setUpdatingTaskId(work.id)
      updateWork({ 
        id: work.id, 
        updates: { status: newStatus } 
      }, {
        onSettled: () => {
          setUpdatingTaskId(null)
        }
      })
    }
  }

  // Show loading overlay when updating via drag and drop
  if (isUpdating && updatingTaskId) {
    return (
      <div className="relative min-h-[600px]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-sm font-medium">Updating task...</span>
              </div>
            </div>
          </div>
          {/* Hidden board content in background */}
          <div className="opacity-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  title={col.title}
                  status={col.id}
                  works={works.filter((w) => w.status === col.id)}
                  updatingTaskId={updatingTaskId}
                />
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          {error && <div className="text-red-500">Error loading works: {errorMessage}</div>}
          <p className="text-sm text-gray-400 mt-1">Fetching your tasks</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">Failed to load tasks</p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <button 
            onClick={() => useWorks()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[600px]">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 items-stretch h-full">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              title={col.title}
              status={col.id}
              works={works.filter((w) => w.status === col.id)}
              updatingTaskId={updatingTaskId}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
