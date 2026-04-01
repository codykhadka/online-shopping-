import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface IUser extends Document {
    name: string;
    username: string;
    password?: string;
    role: 'user' | 'admin' | 'delivery';
    email?: string;
    phone?: string;
    avatar?: string;
    cart: ICartItem[];
    reset_token?: string;
    token_expiry?: Date;
}


const CartItemSchema = new Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
});

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'delivery'], default: 'user' },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String },
    avatar: { type: String },
    cart: [CartItemSchema],
    reset_token: { type: String },
    token_expiry: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);