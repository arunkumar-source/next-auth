import type { Work } from "@repo/shared";

const API_URL = "/api";

export const registerUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to register user");

  return res.json();
};

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login");
  }
};

export const logoutUser = async () => {
  try {
    const res = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to logout");
  }
};

export const fetchWorks = async (): Promise<Work[]> => {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch works");
  }
  const data = await res.json();

  return data;
};

export const addWork = async (data: Omit<Work, "id" | "createdAt">) => {
  const res = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add work");
  return res.json();
};

export const updateWork = async (id: string, updates: Partial<Work>) => {
  const res = await fetch(`${API_URL}/update/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update work");
  return res.json();
};

export const deleteWork = async (id: string) => {
  const res = await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete work");
};
