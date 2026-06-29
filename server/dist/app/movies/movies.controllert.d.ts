import type { Request, Response } from "express";
declare class MovieController {
    private movieService;
    addMovie(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllMovies(_: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMovieById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default MovieController;
//# sourceMappingURL=movies.controllert.d.ts.map