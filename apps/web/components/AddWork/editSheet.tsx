"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import {Input} from "@workspace/ui/components/input"

import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { useUpdateWork } from "@/hooks/use-works"
import {type Work} from "@repo/shared"
import { useEffect, useState } from "react"

export function EditWorkSheet({
  work,
  children,
}: {
  work: Work
  children: React.ReactNode
}) {
  const { mutate: updateWork } = useUpdateWork()
  const [endTime, setEndTime] = useState("")

  const { register, handleSubmit, formState, watch, setValue, reset } = useForm({
    defaultValues: {
      title: work.title,
      description: work.description,
      status: work.status,
      endDate: work.endDate ? work.endDate.split('T')[0] : "",
      endTime: work.endDate && work.endDate.includes('T') ? work.endDate.split('T')[1]?.substring(0, 5) : "",
    },
  })

  // Update form values when work prop changes
  useEffect(() => {
    const datePart = work.endDate ? work.endDate.split('T')[0] : ""
    const timePart = work.endDate && work.endDate.includes('T') ? work.endDate.split('T')[1]?.substring(0, 5) : ""
    
    reset({
      title: work.title,
      description: work.description,
      status: work.status,
      endDate: datePart,
      endTime: timePart,
    })
    
    // Update controlled time state when work prop changes
    if (timePart) {
      setEndTime(timePart)
    }
    
    // Update controlled time state when date changes
    if (datePart) {
      // If date changes but no time, clear the time state
      if (!work.endDate || !work.endDate.includes('T')) {
        setEndTime("")
      }
    }
    
  }, [work, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Create proper Date object in local timezone
      let finalEndDate: string | undefined
      if (data.endDate && data.endTime) {
        // Combine date and time to create a proper local datetime
        const dateTimeString = `${data.endDate}T${data.endTime}:00`
        const localDate = new Date(dateTimeString)
        finalEndDate = localDate.toISOString()
      } else {
        finalEndDate = data.endDate || undefined
      }
      
      const updates = {
        title: data.title,
        description: data.description,
        status: data.status,
        endDate: finalEndDate
      }

      await updateWork({ id: work.id, updates })
    } catch (error) {
      console.error("Error updating work:", error)
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="p-6">
        <SheetHeader>
          <SheetTitle>Edit Work</SheetTitle>
          <SheetDescription>Update work item details</SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-6 text-white mt-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input 
             {...register("title", { 
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters long"
                }
             })} />
            {formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              {...register("description", { 
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters long"
                }
              })} 
              placeholder="Description" 
              className="w-full p-2 border border-gray-300 rounded-md resize-none h-24 bg-black text-white"
            />
            {formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">{formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
            <div className="space-y-2">
              <Input
                type="date"
                {...register("endDate")}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-black text-white"
              />
              <Input
                type="time"
                value={endTime}
                {...register("endTime")}
                onChange={(e) => {
                  const newTime = e.target.value
                  setEndTime(newTime)
                  return newTime
                }}
                className="w-full bg-black text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...register("status")}
              className="w-full bg-black text-white border rounded-md p-2"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancel</option>
            </select>
          </div>

          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}