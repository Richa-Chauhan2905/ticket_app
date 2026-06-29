export function restrictToAdmin() {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication Required" });
        }
        if (req.user && req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin access only" });
        }
        next();
    };
}
//# sourceMappingURL=admin.middleware.js.map