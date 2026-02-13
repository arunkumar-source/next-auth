"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useWorks } from "@/hooks/use-works"
import { updateWork } from "@/lib/api"
import { isPast, parseISO } from "date-fns"

export function useTaskDeadlineChecker() {
  const { data: works = [] } = useWorks()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkDeadlines = async () => {
      const now = new Date()
      
      for (const work of works) {
        // Skip if already in backlog, done, or cancelled, or no end date
        if (!work.endDate || work.status === "backlog" || work.status === "done" || work.status === "cancelled") {
          continue
        }

        const endDate = parseISO(work.endDate)
        
        // If deadline has passed, move to backlog
        if (isPast(endDate)) {
          try {
            await updateWork(work.id, { status: "backlog" })
            // Invalidate queries immediately after successful update
            queryClient.invalidateQueries({ queryKey: ["works"] })
          } catch (error) {
            console.error(`Failed to move task ${work.id} to backlog:`, error)
          }
        }
      }
    }

    // Check immediately
    checkDeadlines()

    // Set up interval to check every 5 seconds for near-instant updates
    const interval = setInterval(checkDeadlines, 5000)

    return () => clearInterval(interval)
  }, [works, queryClient])
}
