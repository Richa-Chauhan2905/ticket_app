type CreateScreenData = {
    theatreId: string;
    name: string;
    totalSeats: number;
};
declare class ScreenService {
    createScreen(data: CreateScreenData): Promise<{
        id: string;
        name: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        theatreId: string;
        totalSeats: number | null;
    } | undefined>;
    getScreensByTheatre(theatreId: string): Promise<{
        id: string;
        theatreId: string;
        name: string | null;
        totalSeats: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
export default ScreenService;
//# sourceMappingURL=screen.services.d.ts.map