import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import OpenAIService from './chatbot/services/OpenAIService.mjs';
import User from './chatbot/entities/User.mjs';

const app = express();
const server = createServer(app);
const users = [];
const AIService = new OpenAIService();
const io = new Server(server, {
    cors: {
      origin: process.env.CORS_HOST,
      methods: ["GET", "POST"]
    }
  });

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    const user = new User(socket, AIService);
    users.push(user);
});

io.on('disconnect', (socket) => {
    console.log('a user disconnected');
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});