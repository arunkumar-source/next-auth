"use client";

import { useForm } from "react-hook-form";
import type { User } from "@repo/shared";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const form = useForm<User>();
  const router = useRouter();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await loginUser(data.email, data.password);
      router.push("/AddWorkKanban");

      form.reset();
    } catch (error) {
      return form.setError("root", { message: "Invalid email or password" });
    }
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-100 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              {...form.register("email", { required: "Email is required" })}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="example@email.com"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              {...form.register("password", {
                required: "Password is required",
              })}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter password"
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            {form.formState.isSubmitting ? "Logging in..." : "Login"}
          </button>
          <div>
            Don't have an account? <a href="/register" className="text-blue-500 hover:underline"> Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}
