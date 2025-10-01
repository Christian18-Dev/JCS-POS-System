import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_mvp';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB || undefined,
  });
};


