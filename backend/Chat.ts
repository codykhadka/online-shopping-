import mongoose, { Schema, Document } from 'mongoose';

// Chat Session Schema
export interface IChatSession extends Document {
    userId: string;
    userName: string;
    socketId: string;
    lastActive: Date;
}

const ChatSessionSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    socketId: { type: String },
    lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);

// Chat Message Schema
export interface IChatMessage extends Document {
    userId: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
    userId: { type: String, required: true }, // Links to ChatSession.userId
    text: { type: String, required: true },
    isUser: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
