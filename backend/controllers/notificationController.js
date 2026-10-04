import Notification from '../models/notification.js';

export const getNotifications = async (request, reply) => {
    try {
        const userId = request.user._id;
        const notifications = await Notification.find({ to: userId })
            .populate({
                path: "from",
                select: "username profileImg",
            })
            .sort({ createdAt: -1 });
        await Notification.updateMany({ to: userId, read: false }, { read: true });
        return reply.status(200).send(notifications);
    } catch (e) {
        console.error("Error in getNotifications:", e);
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
};

export const deleteNotifications = async (request, reply) => {
    try {
        const userId = request.user._id;
        await Notification.deleteMany({ to: userId });
        return reply.status(200).send({ message: 'Notifications deleted successfully' });
    } catch (e) {
        console.error("Error in deleteNotifications:", e);
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
};

export const deleteNotification = async (request, reply) => {
    try {
        const userId = request.user._id;
        const notificationId = request.params.id;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return reply.status(404).send({ error: 'Notification not found' });
        }
        if (notification.to.toString() !== userId.toString()) {
            return reply.status(403).send({ error: 'You are not authorized to delete this notification' });
        }
        await Notification.findByIdAndDelete(notificationId);
        return reply.status(200).send({ message: 'Notification deleted successfully' });
    } catch (e) {
        console.error("Error in deleteNotification:", e);
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
};
