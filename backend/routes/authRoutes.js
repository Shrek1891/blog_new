import {getMe, login, logout, signup} from "../controllers/authController.js";
import protectRoute from "../middleware/protectRoute.js";

async function routes(fastify, options) {
    fastify.post('/signup', signup)
    fastify.post('/login', login)
    fastify.post('/logout', logout)
    fastify.get('/me', { preHandler: protectRoute }, getMe)
}

export default routes