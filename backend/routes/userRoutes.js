import protectRoute from "../middleware/protectRoute.js";
import {followUser, getSuggestedUsers, getUserProfile, updateUser} from "../controllers/userController.js";

async function userRoutes(fastify, options) {
    fastify.get('/profile/:username', {preHandler: protectRoute}, getUserProfile);
    fastify.get('/suggested', {preHandler: protectRoute}, getSuggestedUsers);
    fastify.post("/follow/:id", {preHandler: protectRoute}, followUser);
    fastify.post("/update", {preHandler: protectRoute}, updateUser);
}

export default userRoutes;
