import dotenv from 'dotenv';

dotenv.config();

import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import authRoutes from './routes/authRoutes.js';
import dbConnector from './db/connectMongoDB.js';
import userRoutes from "./routes/userRoutes.js";
import {v2 as cloudinary} from "cloudinary";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationsRoutes.js";
import cors from '@fastify/cors';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fastify = Fastify({
    logger: true,
    pluginTimeout: 20000
});

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

await fastify.register(cors, {
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
});


fastify.decorateRequest('user', null);

fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    }
});
fastify.register(formbody);
fastify.register(dbConnector);
fastify.register(authRoutes, {prefix: '/api/auth'});
fastify.register(userRoutes, {prefix: '/api/users'});
fastify.register(postRoutes, {prefix: '/api/posts'});
fastify.register(notificationRoutes, {prefix: '/api/notifications'})

fastify.listen({port: 3000}, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`Server is now listening on ${address}`)
})
