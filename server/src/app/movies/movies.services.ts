import { db } from "../../db/index.js";
import { movies } from "../../db/schema.js";
import { eq } from "drizzle-orm";

type createMovieData = {
  title: string;
  description?: string | undefined;
  duration: number;
  language: string;
  posterUrl: string;
};

class MovieService {
  async addMovie(data: createMovieData) {
    const [movie] = await db
      .insert(movies)
      .values({
        title: data.title,
        description: data.description ?? null,
        duration: data.duration,
        language: data.language,
        posterUrl: data.posterUrl,
      })
      .returning();

    return movie;
  }

  async getAllMovies() {
    const data = await db.select().from(movies);
    return data;
  }

  async getMovieById(id: string) {
    const result = await db.select().from(movies).where(eq(movies.id, id));
    return result[0] || null;
  }
}

export default MovieService;
