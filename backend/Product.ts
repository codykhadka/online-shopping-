import mongoose, { Schema, Document } from 'mongoose';

export interface IRating {
    userId: string;
    value: number;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    category: string;
    image: string;
    inStock: boolean;
    features: string[];
    isFeatured: boolean;
    likes: string[]; // List of UserIDs who liked it
    ratings: IRating[]; // List of individual ratings
    ratingAverage: number;
    ratingCount: number;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    category: { type: String, required: true },
    image: { type: String, default: '/images/honey_jar.png' },
    rating: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    features: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    likes: { type: [String], default: [] },
    ratings: {
        type: [{
            userId: { type: String, required: true },
            value: { type: Number, required: true }
        }],
        default: []
    },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);