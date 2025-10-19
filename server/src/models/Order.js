import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    items: { type: [orderItemSchema], required: true, default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Pre-save middleware to generate sequential order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Find the highest order number
      const lastOrder = await this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
      
      let nextNumber = 1;
      if (lastOrder && lastOrder.orderNumber) {
        // Extract number from existing order number (e.g., "000001" -> 1)
        const lastNumber = parseInt(lastOrder.orderNumber, 10);
        nextNumber = lastNumber + 1;
      }
      
      // Format as 6-digit string with leading zeros
      this.orderNumber = nextNumber.toString().padStart(6, '0');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);


