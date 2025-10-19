import { Invoice } from '../models/Invoice.js';

// Return the next 6-digit invoice number as a zero-padded string starting at 000001
const generateInvoiceNumber = async () => {
  try {
    // Only consider purely numeric 6-digit invoice numbers; ignore legacy formats like INV-YYYY...
    const numericPattern = new RegExp('^\\\d{6}$');
    const lastNumeric = await Invoice
      .find({ invoiceNumber: { $regex: numericPattern } })
      .sort({ invoiceNumber: -1 })
      .limit(1)
      .lean();

    const last = lastNumeric[0]?.invoiceNumber;
    const lastNumber = last ? parseInt(last, 10) : 0;
    const nextNumber = (Number.isFinite(lastNumber) ? lastNumber : 0) + 1;
    return String(nextNumber).padStart(6, '0');
  } catch (error) {
    throw new Error('Failed to generate invoice number: ' + error.message);
  }
};

export const createInvoiceForOrder = async (order, { session, customerName, customerContact } = {}) => {
  // Minimal retry on duplicate key races
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const invoiceNumber = await generateInvoiceNumber();
      const invoice = await Invoice.create([
        {
          invoiceNumber,
          orderId: order._id,
          customerName: customerName || '',
          customerContact: customerContact || '',
          totalAmount: order.totalAmount,
          issuedAt: new Date(),
        },
      ], { session });
      return invoice[0];
    } catch (err) {
      // 11000 duplicate key error -> try again
      if (err && err.code === 11000) continue;
      throw err;
    }
  }
  throw new Error('Failed to generate unique invoice number');
};


