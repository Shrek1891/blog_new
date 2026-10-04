import jwt from "jsonwebtoken";

export const getCookieOptions = (overrides = {}) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        path: '/',
        maxAge: 15 * 24 * 60 * 60 * 1000,
        secure: isDevelopment,
        sameSite: isDevelopment ? 'none' : 'lax',
        ...overrides,
    };
};

export const generateTokenAndSetCookie = (userId, reply) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'});

    reply.cookie('token', token, getCookieOptions());
};