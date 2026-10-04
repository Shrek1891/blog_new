import protectRoute from "../middleware/protectRoute.js";
import {
    createComment,
    createPost,
    deletePost, 
    getAllFollowing,
    getLikedPosts,
    getPosts, 
    getUsersPosts,
    likePost
} from "../controllers/postController.js";

const postRoutes = async (fastify, options) => {
    fastify.get('/all', { preHandler: protectRoute }, getPosts);
    fastify.get('/likes/:id', { preHandler: protectRoute }, getLikedPosts);
    fastify.get('/following', { preHandler: protectRoute }, getAllFollowing);
    fastify.get('/user/:username', { preHandler: protectRoute }, getUsersPosts);
    fastify.post('/', { preHandler: protectRoute }, createPost);
    fastify.post('/like/:id', { preHandler: protectRoute }, likePost);
    fastify.post('/comment/:id', { preHandler: protectRoute }, createComment);
    fastify.delete('/:id', { preHandler: protectRoute }, deletePost);
};

export default postRoutes;