import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export default function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(
            new AppError("Authentication required", 401)
        );
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        req.user = {
            id: Number(decoded.sub)
        };

        if (!Number.isSafeInteger(req.user.id) || req.user.id <= 0) {
            return next(
                new AppError("Invalid authentication token", 401)
            );
        }

        next();
    } catch {
        return next(
            new AppError("Invalid or expired token", 401)
        );
    }
}
