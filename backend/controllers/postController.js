import Post from "../models/post.js";
import User from "../models/user.js";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.js";

export const createPost = async (request, reply) => {
    try {
        let imgNew;
        const {text, img} = request.body;
        const userId = request.user._id.toString();
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({error: 'User not found'});
        }
        if (!text && !img) {
            return reply.status(400).send({error: 'Post must have text or image'});
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            imgNew = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img: imgNew,
        });
        await newPost.save();
        return reply.status(201).send(newPost);
    } catch (error) {
        console.error("Error in createPost:", error);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const deletePost = async (request, reply) => {
    try {
        const postId = request.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return reply.status(404).send({error: 'Post not found'});
        }
        const userId = request.user._id.toString();
        if (post.user.toString() !== userId) {
            return reply.status(403).send({error: 'You are not authorized to delete this post'});
        }
        if (post.img) {
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(postId);
        return reply.status(200).send({message: 'Post deleted successfully'});
    } catch (error) {
        console.error("Error in deletePost:", error);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const createComment = async (request, reply) => {
    try {
        const postId = request.params.id;
        const {text} = request.body;
        const userId = request.user._id.toString();
        if (!text) {
            return reply.status(400).send({error: 'Comment must have text'});
        }
        const post = await Post.findById(postId);
        if (!post) {
            return reply.status(404).send({error: 'Post not found'});
        }
        const newComment = {
            user: userId,
            text,
        };
        post.comments.push(newComment);
        await post.save();
        return reply.status(201).send(newComment);
    } catch (error) {
        console.error("Error in createComment:", error);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const likePost = async (request, reply) => {
    try {
        const postId = request.params.id;
        const userId = request.user._id.toString();
        const post = await Post.findById(postId);
        if (!post) {
            return reply.status(404).send({error: 'Post not found'});
        }
        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            const updatedLikes = post.likes.filter(id => id.toString() !== userId);
            return reply.status(200).send(updatedLikes);
        } else {
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});
            await post.save();
            if (post.user.toString() !== userId) {
                const notification = new Notification({
                    type: "like",
                    from: userId,
                    to: post.user,
                });
                await notification.save();
            }
            return reply.status(200).send(post.likes);
        }
    } catch (error) {
        console.error("Error in likePost:", error);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const getPosts = async (request, reply) => {
    try {
        const posts = await Post.find().sort({createdAt: -1})
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });
        return reply.status(200).send(posts);
    } catch (e) {
        console.error("Error in getPosts:", e);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const getLikedPosts = async (request, reply) => {
    try {
        const userId = request.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({error: 'User not found'});
        }
        const posts = await Post.find({_id: {$in: user.likedPosts}}).sort({createdAt: -1})
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });
        return reply.status(200).send(posts);
    } catch (e) {
        console.error("Error in getLikedPosts:", e);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const getAllFollowing = async (request, reply) => {
    console.log(request.user)
    try {
        const userId = request.user._id.toString();
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({error: 'User not found'});
        }
        const posts = await Post.find({user: {$in: user.following}}).sort({createdAt: -1})
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });
        return reply.status(200).send(posts);
    } catch (e) {
        console.error("Error in getAllFollowing:", e);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}

export const getUsersPosts = async (request, reply) => {
    try {
        const {username} = request.params;
        const user = await User.findOne({username});
        if (!user) {
            return reply.status(404).send({error: 'User not found'});
        }
        const posts = await Post.find({user: user._id}).sort({createdAt: -1})
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });
        return reply.status(200).send(posts);
    } catch (e) {
        console.error("Error in getUsersPosts:", e);
        return reply.status(500).send({error: 'Internal Server Error'});
    }
}
