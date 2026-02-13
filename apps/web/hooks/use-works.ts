// hooks/use-works.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWorks, addWork, updateWork, deleteWork } from "../lib/api"
import type { Work } from "@repo/shared"

export const useWorks = () =>
  useQuery({
    queryKey: ["works"],
    queryFn: fetchWorks,
  })

export const useAddWork = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addWork,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["works"] }),
  })
}

export const useUpdateWork = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Work> }) =>
      updateWork(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["works"] }),
  })
}

export const useDeleteWork = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWork,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["works"] }),
  })
}
