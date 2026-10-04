import User from "../models/user.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.js";


export const getUserProfile = async (request, reply) => {
    const {username} = request.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if (!user) {
            return reply.status(404).send({error: 'User not found'});
        }
        return reply.status(200).send(user);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
};

export const followUser = async (request, reply) => {
    try {
        const {id} = request.params;
        const currentUserId = request.user._id;
        if (id === currentUserId.toString()) {
            return reply.status(400).send({error: 'You cannot follow yourself'});
        }
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(currentUserId);
        if (!userToModify || !currentUser) {
            return reply.status(404).send({error: 'User not found'});
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            await User.findByIdAndUpdate(id, {$pull: {followers: currentUserId}});
            await User.findByIdAndUpdate(currentUserId, {$pull: {following: id}});
            return reply.status(200).send({message: 'User unfollowed successfully'});
        } else {
            await User.findByIdAndUpdate(id, {$push: {followers: currentUserId}});
            await User.findByIdAndUpdate(currentUserId, {$push: {following: id}});
            const newNotification = new Notification({
                type: "follow",
                from: request.user._id,
                to: userToModify._id,
            });
            await newNotification.save();
            return reply.status(200).send({message: 'User followed successfully'});
        }
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
};

export const getSuggestedUsers = async (request, reply) => {
    try {
        const userId = request.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId},
                },
            },
            {$sample: {size: 10}},
        ]);
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id.toString()));
        const suggestedUsers = filteredUsers.slice(0, 4);
        suggestedUsers.forEach((user) => {
            delete user.password;
        });
        return reply.status(200).send(suggestedUsers);
    } catch (error) {
        request.log.error(`Error in getSuggestedUsers: ${error.message}`);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
};

export const updateUser = async (request, reply) => {
    const {fullName, email, username, currentPassword, newPassword, bio, link} = request.body;
    let {profileImg, coverImg} = request.body;
    const userId = request.user._id;
    console.log(userId);
    try {
        let user = await User.findById(userId);
        if (!user) return reply.status(404).send({error: "User not found"});
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return reply.status(400).send({error: "Please provide both current password and new password"});
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return reply.status(400).send({error: "Current password is incorrect"});
            if (newPassword.length < 6) {
                return reply.status(400).send({error: "Password must be at least 6 characters long"});
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        return reply.status(200).send(userResponse);
    } catch (error) {
        request.log.error(`Error in updateUser: ${error.message}`);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
};
