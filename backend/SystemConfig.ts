import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
    key: string;
    value: string;
}

const SystemConfigSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
