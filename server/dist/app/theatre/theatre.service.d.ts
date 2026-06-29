type createTheatreData = {
    name: string;
    location: string;
};
declare class TheatrService {
    createThratre(data: createTheatreData): Promise<{
        id: string;
        name: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        location: string | null;
    } | undefined>;
    getAllTheatres(): Promise<{
        id: string;
        name: string;
        location: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getTheatreById(id: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    } | null>;
}
export default TheatrService;
//# sourceMappingURL=theatre.service.d.ts.map