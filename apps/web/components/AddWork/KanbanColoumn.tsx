"use client"

// src/features/works/components/kanban-column.tsx
import { Droppable } from "@hello-pangea/dnd"
import { Card } from "@workspace/ui/components/card"
import { type Work } from "@repo/shared"
import { WorkCard } from "@/components/AddWork/WorkCard"

interface Props {
  title: string
  status: string
  works: Work[]
  updatingTaskId?: string | null
}

export function KanbanColumn({ title, status, works, updatingTaskId }: Props) {
  return (
    <Card className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
          {works.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[600px] p-2 rounded transition-all duration-200 flex-1 ${
              snapshot.isDraggingOver
                ? 'bg-gray-50 border border-gray-300'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {works.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-xs">No tasks</p>
              </div>
            )}
            
            {works.length === 0 && snapshot.isDraggingOver && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-xs font-medium">Drop here</p>
              </div>
            )}

            {works.map((work, index) => (
              <WorkCard 
                key={work.id} 
                work={work} 
                index={index} 
                isUpdating={updatingTaskId === work.id}
              />
            ))}
            
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  )
}
