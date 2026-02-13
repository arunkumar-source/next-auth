"use client"

import { Draggable } from "@hello-pangea/dnd"
import { format, parseISO, differenceInHours } from "date-fns"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { type Work } from "@repo/shared"
import { EditWorkSheet } from "./editSheet"
import { useDeleteWork, useUpdateWork } from "@/hooks/use-works"

export function WorkCard({ work, index, isUpdating = false }: { work: Work; index: number; isUpdating?: boolean }) {
  const deleteMutation = useDeleteWork()
  const updateMutation = useUpdateWork()

  // Function to determine card color based on remaining time
  const getCardColor = () => {
    if (!work.endDate) return "bg-white border-gray-200"
    
    const now = new Date()
    const endTime = new Date(work.endDate)
    const hoursRemaining = differenceInHours(endTime, now)
    
    if (hoursRemaining <= 2) {
      return "bg-red-50 border-red-300"
    } else if (hoursRemaining <= 8) {
      return "bg-yellow-50 border-yellow-300"
    } else {
      return "bg-white border-gray-200"
    }
  }

  // Function to get column title for status indicator
  const getColumnTitle = (status: string) => {
    switch (status) {
      case "backlog": return "Backlogs"
      case "todo": return "Todo"
      case "in-progress": return "In Progress"
      case "done": return "Done"
      case "cancelled": return "Cancel"
      default: return status
    }
  }

  return (
    <Draggable draggableId={work.id} index={index} isDragDisabled={work.status === "done" || isUpdating}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`mb-2 transition-all duration-200 ${
              snapshot.isDragging
                ? "transform rotate-1 scale-105 shadow-2xl opacity-90"
                : "transform hover:scale-102"
            }`}
          >
            <Card
              className={`p-3 cursor-pointer transition-all duration-200 border relative ${
                snapshot.isDragging
                  ? "bg-white shadow-xl border-blue-300"
                  : `${getCardColor()} hover:shadow-lg hover:border-gray-400`
              } ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}
            >
              {/* Loading overlay for this card */}
              {isUpdating && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-xs font-medium">Updating...</span>
                  </div>
                </div>
              )}
              <div {...provided.dragHandleProps}>
                {/* Status indicators */}
                <div className="mb-2 flex items-center gap-2">
                  {work.status === "done" ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-black text-xs border-black">
                      {getColumnTitle(work.status)}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div className="mb-2">
                  <h3
                    className={`text-sm font-medium leading-tight text-black ${
                      snapshot.isDragging ? "text-blue-600" : ""
                    }`}
                  >
                    {work.title}
                  </h3>
                </div>

                {/* Description - more compact */}
                {work.description && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {work.description}
                    </p>
                  </div>
                )}

                {/* Footer with metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                    {work.createdAt && (
                      <span>{format(new Date(work.createdAt), "MMM dd HH:mm")}</span>
                    )}
                    {work.endDate && (
                      <span className="text-amber-600 font-medium">
                        Due: {format(parseISO(work.endDate), "MMM dd HH:mm")}
                      </span>
                    )}
                  </div>

                  {/* Action buttons in top right corner */}
                  <div className="flex gap-1">
                    <EditWorkSheet work={work}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-gray-100 text-gray-400 hover:text-black"
                      >
                        ✏️
                      </Button>
                    </EditWorkSheet>

                    {/* Show Cancel button for todo and in-progress tasks */}
                    {(work.status === "todo" || work.status === "in-progress") ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-orange-50 text-gray-400 hover:text-orange-600"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ 
                          id: work.id, 
                          updates: { status: "cancelled" } 
                        })}
                      >
                        ❌
                      </Button>
                    ) : (
                      /* Show Delete button for other statuses (done, cancelled, backlog) */
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-red-50 text-gray-400 hover:text-red-500"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(work.id)}
                      >
                        🗑️
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )
      }}
    </Draggable>
  )
}
