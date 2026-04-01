import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    id: string; // From the random ID or manual ID
    customerName: string;
    productName: string;
    price: number;
    status: number;
    address: string;
    phone: string;
    user_id?: mongoose.Types.ObjectId | string | null;
    assigned_to?: string | null;
    timestamp: Date;
}

const OrderSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Number, default: -1 },
    location: { type: String, default: "Sorting Hub" }, // Added location field
    address: { type: String, required: true },
    phone: { type: String, required: true },
    user_id: { type: Schema.Types.Mixed, default: null }, // Store as string or ObjectId
    assigned_to: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
