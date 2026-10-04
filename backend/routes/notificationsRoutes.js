import ProtectRoute from "../middleware/protectRoute.js";
import {deleteNotification, deleteNotifications, getNotifications} from "../controllers/notificationController.js";

const notificationRoutes = async (fastify, opts) => {
    fastify.get('/', {preHandler: ProtectRoute}, getNotifications);
    fastify.delete('/', {preHandler: ProtectRoute}, deleteNotifications);
    fastify.delete('/:id', {preHandler: ProtectRoute}, deleteNotification);
};

export default notificationRoutes;