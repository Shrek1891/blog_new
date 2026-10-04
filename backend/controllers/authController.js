import User from "../models/user.js";
import bcrypt from 'bcryptjs';
import {generateTokenAndSetCookie, getCookieOptions} from "../utils/generateToken.js";

export const signup = async (request, reply) => {
    try {
        const {fullName, username, email, password} = request.body;
        const errors = [];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
            errors.push({field: 'fullName', message: 'Full name is required'});
        }
        if (!username || typeof username !== 'string' || username.length < 3) {
            errors.push({field: 'username', message: 'Username is required and must be at least 3 characters'});
        }
        if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
            errors.push({field: 'email', message: 'A valid email address is required'});
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            errors.push({field: 'password', message: 'Password must be at least 6 characters long'});
        }
        const existingUser = await User.findOne({
            $or: [{username}, {email}]
        });
        if (existingUser) {
            const errs = [];
            if (existingUser.username === username) errs.push({field: 'username', message: 'Username already exists'});
            if (existingUser.email === email) errs.push({field: 'email', message: 'Email already exists'});
            return reply.code(400).send({errors: errs});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        generateTokenAndSetCookie(newUser._id, reply);
        return reply.code(201).send({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg,
        });
    } catch (error) {
        request.log.error(`Signup error: ${error.message}`);
        return reply.code(500).send({error: 'Internal Server Error'});
    }
};
export const login = async (request, reply) => {
    try {
        const {username, password} = request.body;
        const errors = [];
        if (!username || typeof username !== 'string') {
            errors.push({field: 'username', message: 'Username is required'});
        }
        if (!password || typeof password !== 'string') {
            errors.push({field: 'password', message: 'Password is required'});
        }
        if (errors.length) {
            return reply.code(400).send({errors});
        }
        const user = await User.findOne({username});
        const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;
        if (!user || !isPasswordCorrect) {
            return reply.code(400).send({errors: [{field: 'authentication', message: 'Invalid username or password'}]});
        }
        generateTokenAndSetCookie(user._id, reply);
        return reply.code(200).send({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
    } catch (error) {
        request.log.error(`Login error: ${error.message}`);
        return reply.code(500).send({error: 'Internal Server Error'});
    }
};

export const logout = async (request, reply) => {
    try {
        reply.clearCookie('token', getCookieOptions());
        return reply.code(200).send({message: 'Logged out successfully'});
    } catch (e) {
        request.log.error(`Logout error: ${e.message}`);
        return reply.code(500).send({error: 'Internal Server Error'});
    }
};

export const getMe = async (request, reply) => {
    try {
        console.log("Fetching user data for ID:", request.user._id);
        const user = await User.findById(request.user._id).select('-password');

        if (!user) {
            return reply.code(404).send({error: 'User not found'});
        }

        return reply.code(200).send(user);
    } catch (error) {
        request.log.error(`GetMe error: ${error.message}`);
        return reply.code(500).send({error: 'Internal Server Error'});
    }
};
