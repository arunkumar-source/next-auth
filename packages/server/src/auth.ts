import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}


export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const token = getCookie(c, "token");

    if (!token) {
      return c.json({ message: "Unauthorized - No token" }, 401);
    }

    const payload = await verify(token, JWT_SECRET,"HS256");

    // Attach user data to context
    c.set("user", payload);

    await next();
  } catch (error) {
    return c.json({ message: "Unauthorized - Invalid token" }, 401);
  }
};

