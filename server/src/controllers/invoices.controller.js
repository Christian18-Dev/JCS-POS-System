import { Invoice } from '../models/Invoice.js';

export const getInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber }).populate({
    path: 'orderId',
    populate: { path: 'items.product' },
  });
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  res.json(invoice);
};


