import { Hono } from "hono";
import { cors } from "hono/cors";
// import { serve } from "@hono/node-server";
import { db } from "@repo/db";
import { schema } from "@repo/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { deleteCookie, setCookie } from "hono/cookie";
import dotenv from "dotenv";
dotenv.config();

//JWT
import { sign} from "hono/jwt";
import { Variables } from "hono/types";

//middleware
import { authMiddleware } from "./auth";

interface AppVariables extends Variables {
  userId: string;
}

const app = new Hono<{ Variables: AppVariables }>().basePath("/api");

app.options("*", (c) => {
  return c.body(null, 204);
});

app.use("*", cors());

//register route
app.post("/register", async (c) => {
  const { email, password } = await c.req.json();
  try {
    if (!email || !password) return c.json({ message: "Invalid data" }, 400);
    await db.select().from(schema.users).where(eq(schema.users.email, email)).then((users) => {
      if (users.length > 0) {
        throw new Error("User already exists");
      }});

    const hashpassword = await bcrypt.hash(password, 10);

    const userRegister = {
      id: crypto.randomUUID(),
      email,
      password: hashpassword,
      createdAt: new Date(),
    };
    await db.insert(schema.users).values(userRegister);
    return c.json(userRegister, 201);
  } catch (error) {
    return c.json({ message: "Error registering user : " + error }, 500);
  }
});
//login route
app.post("/", async (c) => {
  const { email, password } = await c.req.json();

  try {
    if (!email || !password) {
      return c.json({ message: "Invalid data" }, 400);
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    const userData = user[0];

    if (!userData) {
      return c.json({ message: "User not found" }, 404);
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return c.json({ message: "Invalid password" }, 401);
    }

    // ✅ Generate JWT
    const token = await sign(
      {
        sub: userData.id,
        email: userData.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
      },
      process.env.JWT_SECRET!,
      "HS256"
    );

    // ✅ Set HTTP-only cookie
    setCookie(c, "token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure:false,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return c.json({
      message: "Login successful",
      user: {
        id: userData.id,
        email: userData.email,
      },
    });
  } catch (error) {
    return c.json({ message: "Error logging in: " + error }, 500);
  }
});

//logout route
app.post("/logout", (c) => {
  deleteCookie(c, "token", {
    httpOnly: true,
    sameSite: "Lax",
    secure:false,
    maxAge: 0, // Expire immediately}
  });
  return c.json({ message: "Logged out successfully" });
});

app.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ message: "Unauthorized - No user ID in context" }, 401);
  }
  const works = await db.select().from(schema.workDB).where(eq(schema.workDB.usersId, userId));
  return c.json(works);
});

app.post("/add", authMiddleware, async (c) => {
  const { title, status, description, endDate } = await c.req.json();
  const userId = c.get("userId");
  if (!title || !status) return c.json({ message: "Invalid data" }, 400);

  const work = {
    id: crypto.randomUUID(),
    title,
    usersId: userId,
    status,
    description: description || null,
    endDate: endDate ? new Date(endDate) : null,
    createdAt: new Date(),
  };

  await db.insert(schema.workDB).values(work);
  return c.json(work, 201);
});

app.patch("/update/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const updates = await c.req.json();

  if (!id || !updates) {
    return c.json({ message: "Invalid request" }, 400);
  }

  try {
    // Convert endDate string to Date object if it exists
    const processedUpdates = {
      ...updates,
      endDate: updates.endDate ? new Date(updates.endDate) : undefined,
    };

    const work = await db
      .update(schema.workDB)
      .set(processedUpdates)
      .where(eq(schema.workDB.id, id))
      .returning();
    if (!work || work.length === 0) {
      return c.json({ message: "Not found" }, 404);
    }

    return c.json(work[0]);
  } catch (error) {
    console.error("Update error:", error);
    return c.json(
      { message: "Internal server error", error: String(error) },
      500,
    );
  }
});

app.delete("/delete/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await db.delete(schema.workDB).where(eq(schema.workDB.id, id));
  return c.body(null, 204);
});

export default app;

// Local development server
// const port = 3000
// console.log(`Server is running on port http://localhost:${port}/api`)

// serve({
//   fetch: app.fetch,
//   port
// })
