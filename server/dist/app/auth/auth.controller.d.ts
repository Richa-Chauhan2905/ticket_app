import type { Request, Response } from "express";
declare class AuthenticationController {
    handleSignup(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    handleSignin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    handleLogout(_: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    handleMe(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default AuthenticationController;
//# sourceMappingURL=auth.controller.d.ts.map