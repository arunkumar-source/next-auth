"use client"

//shadcn/ui

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
//RHF lib
import { useForm } from "react-hook-form"
import { format } from "date-fns"

//zustand store
import { useAddWork  } from "@/hooks/use-works";
import type { WorkStatus } from "@repo/shared";

interface AddWorkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWork({ open, onOpenChange }: AddWorkProps) {
  const { mutate: addWork } = useAddWork();
  const form = useForm<{ title: string; description: string; status: WorkStatus; endDate: string; endTime: string }>({
    defaultValues: { title: "", description: "", status: "todo", endDate: "", endTime: "" }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const workData = {
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
       endDate: data.endDate && data.endTime ? `${data.endDate}T${data.endTime}:00` : (data.endDate || undefined)
      }
      await addWork(workData)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error adding work:", error)
    }
  }, (errors) => {
    if (errors.title) {
      return errors
    }
  })
  return (
    
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white">Add Work</Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add work here</DialogTitle>
          <DialogDescription>To add in kanban board add here</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            {...form.register("title", { 
              required: "Title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters long"
              }
            })} 
            placeholder="Title" 
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
          )}

          <textarea 
            {...form.register("description", { 
              required: "Description is required",
              minLength: {
                value: 10,
                message: "Description must be at least 10 characters long"
              }
            })} 
            placeholder="Description" 
            className="w-full p-2 border border-gray-300 rounded-md resize-none h-24"
          />
          {form.formState.errors.description && (
            <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date (Optional)</label>
            <div className="space-y-2">
              <Input
                type="date"
                {...form.register("endDate")}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
              <Input
                type="time"
                {...form.register("endTime")}
                className="w-full"
              />
            </div>
          </div>

          <select className="w-full p-2 border border-gray-300 rounded-md" {...form.register("status")}>
            <option value="backlog">Backlog</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancel</option>
          </select>

          <Button className="bg-black text-white" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Work"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
