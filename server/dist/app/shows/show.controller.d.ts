import type { Request, Response } from "express";
declare class ShowController {
    private showService;
    createShow(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getShowsByMovie(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default ShowController;
//# sourceMappingURL=show.controller.d.ts.map