import express, {urlencoded} from "express";
import type { Express } from "express";
import { theatreRouter } from "./theatre/theatre.route.js";
import { authRouter } from "./auth/auth.route.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
import { movieRouter } from "./movies/movies.route.js";
import { seatRouter } from "./seat/seat.routes.js";

export function createApplication(): Express {
  const app = express();

  app.use(express.json());
  app.use(urlencoded({ extended: true, limit: "5mb" }));
  
  app.get("/", (req, res) => {
    return res.json({ message: "Welcome to TicketBooking " });
  });
  app.use(authenticationMiddleware());
  app.use("/auth", authRouter);
  app.use("/theatre", theatreRouter);
  app.use("/movies", movieRouter);
  app.use("/seats", seatRouter);

  return app;
}
