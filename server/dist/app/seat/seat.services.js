import { db } from "../../db/index.js";
import { and, eq, inArray, lt } from "drizzle-orm";
import { seats } from "../../db/schema.js";
class SeatService {
    async createSeatsForShow(showId, totalSeats) {
        const seatData = [];
        for (let i = 0; i <= totalSeats; i++) {
            seatData.push({
                showId,
                seatNumber: i.toString(),
                status: "available",
            });
        }
        await db.insert(seats).values(seatData);
    }
    async lockSeats(userId, seatIds) {
        await this.releaseExpiryLocks();
        const now = new Date();
        const lockExpiry = new Date(now.getTime() - 5 * 60 * 1000);
        return await db.transaction(async (tx) => {
            const selectedSeats = await tx
                .select()
                .from(seats)
                .where(inArray(seats.id, seatIds))
                .for("update");
            for (const seat of selectedSeats) {
                if (seat.status === "booked") {
                    throw new Error(`Seat ${seat.seatNumber} already booked`);
                }
            }
            await tx
                .update(seats)
                .set({
                status: "locked",
                lockedBy: userId,
                lockedAt: now,
            })
                .where(inArray(seats.id, seatIds));
            return true;
        });
    }
    async confirmBooking(userId, seatIds) {
        return await db.transaction(async (tx) => {
            const selectedSeats = await tx
                .select()
                .from(seats)
                .where(inArray(seats.id, seatIds))
                .for("update");
            for (const seat of selectedSeats) {
                if (seat.status !== "locked") {
                    throw new Error(`Seat ${seat.seatNumber} not locked by user`);
                }
            }
            await tx
                .update(seats)
                .set({
                status: "booked",
                bookedBy: userId,
            })
                .where(inArray(seats.id, seatIds));
            return true;
        });
    }
    async releaseExpiryLocks() {
        const expiry = new Date(Date.now() - 5 * 60 * 1000);
        await db
            .update(seats)
            .set({
            status: "available",
            lockedBy: null,
            lockedAt: null
        })
            .where(and(eq(seats.status, "locked"), lt(seats.lockedAt, expiry)));
    }
    async getSeatsByShow(showId) {
        await this.releaseExpiryLocks();
        return db.select().from(seats).where(eq(seats.showId, showId));
    }
}
export default SeatService;
//# sourceMappingURL=seat.services.js.map