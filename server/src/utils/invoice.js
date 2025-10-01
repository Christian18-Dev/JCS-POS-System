import { Invoice } from '../models/Invoice.js';

const generateInvoiceNumber = async () => {
  // Simple unique sequence: INV-YYYYMMDD-XXXX
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INV-${datePart}-${randomPart}`;
};

export const createInvoiceForOrder = async (order, { session, customerName, customerContact } = {}) => {
  let invoiceNumber = await generateInvoiceNumber();
  // Ensure uniqueness by retrying a couple of times on collision
  for (let i = 0; i < 3; i++) {
    try {
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
      if (err && err.code === 11000) {
        invoiceNumber = await generateInvoiceNumber();
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed to generate unique invoice number');
};


