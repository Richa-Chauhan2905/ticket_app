import type { Request, Response } from "express";
declare class TheatreController {
    private theatreService;
    createTheatre(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllTheatres(_: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTheatreById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default TheatreController;
//# sourceMappingURL=theatre.controller.d.ts.map