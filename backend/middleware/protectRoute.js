import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {getCookieOptions} from "../utils/generateToken.js";

const protectRoute = async (request, reply) => {
    try {
        const token = request.cookies?.token;
        if (!token) {
            return reply.status(401).send({ error: 'Unauthorized: No Token Provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return reply.status(401).send({ error: 'Unauthorized: Invalid Token' });
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }
        request.user = user;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            reply.clearCookie('token', getCookieOptions());
            return reply.status(401).send({ error: 'Unauthorized: Token expired' });
        }
        console.error(`Error in protectRoute middleware: ${err.message}`);
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
};

export default protectRoute;
