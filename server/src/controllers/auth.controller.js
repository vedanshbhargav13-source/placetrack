import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import {
    signupUser,
    findUserByEmail,
    verifyPassword
} from "../services/auth.service.js";


function generateToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            subject: String(userId),
            expiresIn: "1h"
        }
    );
}


export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new AppError("Password must not exceed 72 UTF-8 bytes", 400);
    }

    try {
        const user = await signupUser({ name, email, password });
        const token = generateToken(user.id);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user,
                token
            }
        });
    } catch (error) {
        if (error.code === "23505") {
            throw new AppError("An account with this email already exists", 409);
        }

        throw error;
    }
});


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new AppError("Invalid email or password", 401);
    }

    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await verifyPassword(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user.id);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            },
            token
        }
    });
});