declare class ShowService {
    createShow(data: {
        movieId: string;
        screenId: string;
        startTime: string;
        price: number;
    }): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        movieId: string;
        screenId: string;
        startTime: Date;
        price: number;
    }>;
    getShowsByMovie(movieId: string): Promise<{
        id: string;
        startTime: Date;
        price: number;
        screen: {
            id: string;
            name: string | null;
        };
        theatre: {
            id: string;
            name: string;
            location: string | null;
        };
    }[]>;
}
export default ShowService;
//# sourceMappingURL=show.services.d.ts.map