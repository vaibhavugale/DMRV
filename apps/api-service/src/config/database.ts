import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB');
      return;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  // Fallback to In-Memory MongoDB for local development
  try {
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ Connected to In-Memory MongoDB:', memoryUri);
  } catch (error) {
    console.error('❌ Failed to start In-Memory MongoDB:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

export default mongoose;
