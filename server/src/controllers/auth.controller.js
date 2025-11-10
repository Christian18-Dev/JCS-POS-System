import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    const token = signToken(user._id, user.role);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user._id, user.role);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (_err) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req, res) => {
  try {
    // `authenticate` middleware already attached `req.user`
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ user: req.user });
  } catch (_err) {
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};


