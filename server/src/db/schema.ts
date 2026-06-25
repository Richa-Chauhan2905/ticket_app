import {
  pgTable,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const movies = pgTable("movies", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration"),
  language: varchar("language", { length: 50 }),
  posterUrl: text("poster_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const theatres = pgTable("theatres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const screens = pgTable("screens", {
  id: uuid("id").defaultRandom().primaryKey(),
  theatreId: uuid("theatre_id")
    .references(() => theatres.id)
    .notNull(),
  name: varchar("name", { length: 100 }),
  totalSeats: integer("total_seats"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const shows = pgTable("shows", {
  id: uuid("id").defaultRandom().primaryKey(),
  movieId: uuid("movie_id")
    .references(() => movies.id)
    .notNull(),
  screenId: uuid("screen_id")
    .references(() => screens.id)
    .notNull(),
  startTime: timestamp("start_time").notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const seatStatusEnum = pgEnum("seat_status", [
  "available",
  "locked",
  "booked",
]);

export const seats = pgTable("seats", {
  id: uuid("id").defaultRandom().primaryKey(),
  showId: uuid("show_id")
    .references(() => shows.id)
    .notNull(),
  seatNumber: varchar("seat_number", { length: 10 }).notNull(),
  status: seatStatusEnum("status").default("available"),
  lockedBy: uuid("locked_by").references(() => users.id),
  lockedAt: timestamp("locked_at"),
  bookedBy: uuid("booked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const paymentStatusEnum = pgEnum("booking_status", [
  "pending",
  "success",
  "failed",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  showId: uuid("show_id")
    .references(() => shows.id)
    .notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const bookingSeats = pgTable("booking_seats", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id)
    .notNull(),
  seatId: uuid("seat_id")
    .references(() => seats.id)
    .notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id)
    .notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const otps = pgTable("otps", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
