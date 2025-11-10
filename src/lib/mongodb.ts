import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectMongoDB = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // If already connected (1 = connected, 2 = connecting), reuse the connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    // Use recommended options by mongoose
    await mongoose.connect(MONGODB_URI, {
      // keep default behavior; options can be added if needed
    } as mongoose.ConnectOptions);
    console.log('Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Re-throw so callers can handle connection failures explicitly
    throw error;
  }
};