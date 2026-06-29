import { db } from "../../db/index.js";
import { screens, shows, theatres } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import SeatService from "../seat/seat.services.js";
const seatService = new SeatService();
class ShowService {
    async createShow(data) {
        const [show] = await db
            .insert(shows)
            .values({
            movieId: data.movieId,
            screenId: data.screenId,
            startTime: new Date(data.startTime),
            price: data.price,
        })
            .returning();
        if (!show) {
            throw new Error("Failed to create show in database");
        }
        const [screen] = await db
            .select()
            .from(screens)
            .where(eq(screens.id, data.screenId));
        if (!screen)
            throw new Error("Screen not found");
        if (!screen.totalSeats) {
            throw new Error("Screen does not have a valid seat capacity defined");
        }
        await seatService.createSeatsForShow(show.id, screen.totalSeats);
        return show;
    }
    async getShowsByMovie(movieId) {
        const result = await db
            .select({
            id: shows.id,
            startTime: shows.startTime,
            price: shows.price,
            screen: {
                id: screens.id,
                name: screens.name,
            },
            theatre: {
                id: theatres.id,
                name: theatres.name,
                location: theatres.location,
            },
        })
            .from(shows)
            .innerJoin(screens, eq(shows.screenId, screens.id))
            .innerJoin(theatres, eq(screens.theatreId, theatres.id))
            .where(eq(shows.movieId, movieId));
        return result;
    }
}
export default ShowService;
//# sourceMappingURL=show.services.js.map