import mongoose, { Document, Schema, Model, model } from 'mongoose';

interface IContact extends Document {
  phoneNumber?: string;
  email?: string;
  linkedId?: mongoose.Schema.Types.ObjectId;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const contactSchema = new Schema<IContact>({
  phoneNumber: { type: String, required: false },
  email: { type: String, required: false },
  linkedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: false },
  linkPrecedence: { type: String, enum: ['primary', 'secondary'], default: 'primary' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, required: false },
});

const Contact: Model<IContact> = model<IContact>('Contact', contactSchema);
export default Contact;
