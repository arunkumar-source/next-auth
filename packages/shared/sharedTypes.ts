import { z } from "zod";

export const WorkStatusSchema = z.enum([
  "backlog",
  "todo",
  "in-progress",
  "done",
  "cancelled",
]);

export const WorkSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
  status: WorkStatusSchema,
  createdAt: z.string(),
  endDate: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "password is required"),
  createdAt: z.string().optional(),
});
export type Work = z.infer<typeof WorkSchema>;
export type WorkStatus = z.infer<typeof WorkStatusSchema>;
export type User = z.infer<typeof UserSchema>;
