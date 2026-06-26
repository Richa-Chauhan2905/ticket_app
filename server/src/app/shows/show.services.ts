import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { shows, theatres } from "../../db/schema.js";

class ShowService {
    async createShow(data: {
        movieId: string;
        screenId: string,
        startTime: string
        price: number
    }) {
        const [show] = await db
        .insert(shows)
        .values({
            movieId: data.movieId,
            screenId: data.screenId,
            startTime: new Date(data.startTime),
            price: data.price
        })
        .returning();

        if(!show) throw new Error("Screen not found")

        return show;
    }

    async getShowByMovie(movieId: string){
        const result = await db
        .select({
            id: shows.id,
            startTime: shows.startTime,
            price: shows.price,
            theatres:{
                id: theatres.id,
                name: theatres.name,
                location: theatres.location
            },
        })
        .from(shows)
        // .innerJoin(theatres, eq(theatres.id))
        .where(eq(shows.movieId, movieId))
    }

}
