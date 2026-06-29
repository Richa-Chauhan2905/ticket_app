import { createMovieSchema } from "./movies.schema.js";
import MovieService from "./movies.services.js";
import { uploadImage } from "../utils/imagekit.js";
class MovieController {
    movieService = new MovieService();
    async addMovie(req, res) {
        try {
            const parsed = await createMovieSchema.safeParseAsync(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error });
            }
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: "Poster image is required" });
            }
            const posterUrl = await uploadImage(file);
            const movie = await this.movieService.addMovie({
                title: parsed.data.title,
                description: parsed.data.description,
                duration: parsed.data.duration,
                language: parsed.data.language,
                posterUrl,
            });
            return res.status(201).json({
                message: "Movie created successfully",
                data: movie,
            });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to create movie" });
        }
    }
    async getAllMovies(_, res) {
        try {
            const allMovies = await this.movieService.getAllMovies();
            return res.status(200).send({ data: allMovies });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to fetch movies" });
        }
    }
    async getMovieById(req, res) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                return res.status(400).json({ error: "Invalid movie ID" });
            }
            const movie = await this.movieService.getMovieById(id);
            if (!movie)
                return res.status(404).json({ error: "Movie not found" });
            return res.status(200).json({ data: movie });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to fetch movie" });
        }
    }
}
export default MovieController;
//# sourceMappingURL=movies.controllert.js.map