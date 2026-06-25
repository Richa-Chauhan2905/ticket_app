import { db } from "../../db/index.js";
import type { Request, Response } from "express";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { signInPayload, signUpPayload } from "./auth.schema.js";
import bcrypt from "bcryptjs";
import { createUserToken } from "../utils/token.js";

class AuthenticationController {
  public async handleSignup(req: Request, res: Response) {
    try {
      const validationResult = await signUpPayload.safeParseAsync(req.body);

      if (validationResult.error)
        return res.status(400).json({
          message: "Body validation failed",
          error: validationResult.error.issues,
        });

      const { name, email, password } = validationResult.data;

      const userEmailResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userEmailResult.length > 0)
        return res.status(400).json({
          error: "Duplicate entry",
          message: `User with email ${email} already exists`,
        });

      const hashedPassword = await bcrypt.hash(password, 10);

      const [user] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();

      return res.status(200).json({
        message: "user created successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({ error: "Signup failed" });
    }
  }

  public async handleSignin(req: Request, res: Response) {
    try {
      const validationResult = await signInPayload.safeParseAsync(req.body);

      if (validationResult.error)
        return res.status(400).json({
          message: "Body validation failed",
          error: validationResult.error.issues,
        });

      const { email, password } = validationResult.data;

      const userEmailResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      const user = userEmailResult[0];

      if (!user)
        return res
          .status(404)
          .json({ message: `user with email ${email} does not exist` });

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        return res
          .status(400)
          .json({ message: "User email or password is incorrect" });
      }

      const token = createUserToken({ id: user.id, role: user.role });

      return res
        .status(200)
        .json({ message: "Login Successful", token: token });
    } catch (error) {
      return res.status(500).json({ error: "Signin failed" });
    }
  }

  public async handleLogout(_: Request, res: Response) {
    return res.status(200).json({ message: "Logged out successfully" });
  }

  public async handleMe(req: Request, res: Response) {
    //@ts-ignore
    const { id } = req.user! as UserTokenPayload;

    const [userResult] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return res.json({
      name: userResult?.name,
      email: userResult?.email,
      createdAt: userResult?.createdAt,
    });
  }
}

export default AuthenticationController;
