import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  console.log('Connecting to database...');

  try {
    cached.promise =
      cached.promise ||
      mongoose.connect(MONGODB_URI, {
        dbName: 'evently',
        bufferCommands: false,
      });

    cached.conn = await cached.promise;

    console.log('Database connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};