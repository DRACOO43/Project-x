import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_project_management';
  
  if (isConnected) {
    return true;
  }

  try {
    // Attempt Mongoose connection with 3-second timeout to prevent blocking startup if no local mongod
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`);
    return true;
  } catch (err: any) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${mongoUri}.`);
    console.warn(`[MongoDB Info] Application will use the resilient internal persistence store for interactive demonstration. To use MongoDB Atlas or local MongoDB, configure MONGODB_URI in .env.`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => {
  return {
    connected: isConnected,
    mode: isConnected ? 'MongoDB (Mongoose)' : 'Internal Resilient Store (Demo/Local)',
    uri: process.env.MONGODB_URI ? '[Configured]' : 'mongodb://127.0.0.1:27017/smart_project_management',
  };
};
