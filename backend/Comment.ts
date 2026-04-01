import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    productId: string;
    userId: string;
    userName: string;
    text: string;
    isMotivational: boolean;
    timestamp: Date;
}

const CommentSchema: Schema = new Schema({
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    isMotivational: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', CommentSchema);
