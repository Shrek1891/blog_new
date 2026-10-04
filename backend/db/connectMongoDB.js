import mongoose from 'mongoose';
import fastifyPlugin from 'fastify-plugin';

async function dbConnector(fastify, options) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        fastify.log.info(`MongoDB Connected: ${conn.connection.host}`);
        fastify.decorate('mongoose', mongoose);
    } catch (error) {
        fastify.log.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
    }
}

export default fastifyPlugin(dbConnector);
