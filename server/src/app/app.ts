import express, {urlencoded} from "express";
import type { Express } from "express";
import { theatreRouter } from "./theatre/theatre.route.js";
import { authRouter } from "./auth/auth.route.js";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
import { movieRouter } from "./movies/movies.route.js";
import { seatRouter } from "./seat/seat.routes.js";
import { bookingRouter } from "./booking/booking.routes.js";
import { screenRouter } from "./screen/screen.routes.js";
import { showRouter } from "./shows/show.routes.js";

export function createApplication(): Express {
  const app = express();

  // Custom CORS middleware to allow local requests from the frontend
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

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
  app.use("/bookings", bookingRouter);
  app.use("/screens", screenRouter);
  app.use("/shows", showRouter);

  return app;
}
