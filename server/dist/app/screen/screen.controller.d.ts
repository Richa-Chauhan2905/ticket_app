import type { Request, Response } from "express";
declare class ScreenController {
    private screenService;
    createScreen(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getScreensByTheatre(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default ScreenController;
//# sourceMappingURL=screen.controller.d.ts.map