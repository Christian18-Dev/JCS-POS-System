import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerName: { type: String, trim: true },
    customerContact: { type: String, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    issuedAt: { type: Date, required: true },
  },
  { timestamps: true }
);


export const Invoice = mongoose.model('Invoice', invoiceSchema);


