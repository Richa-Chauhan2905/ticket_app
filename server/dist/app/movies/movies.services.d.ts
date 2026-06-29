type createMovieData = {
    title: string;
    description?: string | undefined;
    duration: number;
    language: string;
    posterUrl: string;
};
declare class MovieService {
    addMovie(data: createMovieData): Promise<{
        duration: number | null;
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        title: string;
        description: string | null;
        language: string | null;
        posterUrl: string | null;
    } | undefined>;
    getAllMovies(): Promise<{
        id: string;
        title: string;
        description: string | null;
        duration: number | null;
        language: string | null;
        posterUrl: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getMovieById(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        duration: number | null;
        language: string | null;
        posterUrl: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    } | null>;
}
export default MovieService;
//# sourceMappingURL=movies.services.d.ts.map