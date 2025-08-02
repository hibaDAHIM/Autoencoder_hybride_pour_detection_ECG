import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const logout = async () => {
  try {
    const res = await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      alert("Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
};

