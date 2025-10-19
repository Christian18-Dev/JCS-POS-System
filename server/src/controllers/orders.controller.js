import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { createInvoiceForOrder } from '../utils/invoice.js';

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body; // [{product, qty}]
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });

    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const computedItems = items.map((i) => {
      const p = productMap.get(i.product);
      if (!p) throw new Error('Invalid product');
      const price = p.price;
      const qty = Number(i.qty) || 1;
      return { product: p._id, price, qty, subtotal: price * qty };
    });
    const totalAmount = computedItems.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await Order.create({ items: computedItems, totalAmount, createdBy: req.user._id });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Create order failed' });
  }
};

export const listOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const totalItems = await Order.countDocuments();
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product');

  // Add invoice information to each order
  const ordersWithInvoices = await Promise.all(
    orders.map(async (order) => {
      const invoice = await Invoice.findOne({ orderId: order._id });
      return {
        ...order.toObject(),
        invoice: invoice ? { 
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName 
        } : null,
      };
    })
  );

  res.json({
    items: ordersWithInvoices,
    page,
    pageSize: limit,
    totalItems,
    totalPages: Math.max(Math.ceil(totalItems / limit), 1),
  });
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
};

export const confirmOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customerName } = req.body;
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Not found' });
    }
    if (order.status === 'confirmed') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Already confirmed' });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session).exec();
      if (!product) throw new Error('Product missing');
      if (product.stock < item.qty) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock -= item.qty;
      await product.save({ session });
    }

    order.status = 'confirmed';
    await order.save({ session });

    const invoice = await createInvoiceForOrder(order, { 
      session, 
      customerName: customerName || ''
    });

    // Populate the order with product details before returning
    await order.populate('items.product');

    await session.commitTransaction();
    session.endSession();
    res.json({ order, invoice });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Confirm failed' });
  }
};


