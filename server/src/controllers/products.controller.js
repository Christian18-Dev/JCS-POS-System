import { Product } from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const { name, sku, price, stock = 0, category } = req.body;
    if (!name || !sku || price == null) return res.status(400).json({ message: 'Missing fields' });
    const exists = await Product.findOne({ sku });
    if (exists) return res.status(409).json({ message: 'SKU already exists' });
    const product = await Product.create({ name, sku, price, stock, category });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Create product failed' });
  }
};

export const listProducts = async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { name, price, stock, category } },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};

export const adjustStock = async (req, res) => {
  try {
    const { delta } = req.body; // positive or negative
    if (typeof delta !== 'number') return res.status(400).json({ message: 'delta must be a number' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    const newStock = product.stock + delta;
    if (newStock < 0) return res.status(400).json({ message: 'Insufficient stock' });
    product.stock = newStock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Adjust stock failed' });
  }
};


