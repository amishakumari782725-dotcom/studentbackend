import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studenthub';

  try {
    // Attempt connecting with 3 second timeout for quick fallback if local daemon is not running
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryError) {
    console.warn(`[Database] Local/Configured MongoDB connection failed (${primaryError.message}).`);
    
    // Check if MongoMemoryServer can be initialized as a seamless fallback
    try {
      console.log('[Database] Initializing fallback in-memory MongoDB server for testing/development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to in-memory MongoDB: ${memUri}`);
      console.log('[Database] NOTE: Data persists during server runtime. For permanent storage, configure MONGODB_URI in backend/.env');
      return conn;
    } catch (memError) {
      console.error('[Database] Failed to initialize in-memory fallback:', memError.message);
      console.error('\n=== MONGODB SETUP INSTRUCTIONS ===');
      console.error('1. Start local MongoDB: "mongod" or start the MongoDB Windows service.');
      console.error('2. OR configure MongoDB Atlas in backend/.env:');
      console.error('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studenthub?retryWrites=true&w=majority\n');
      throw primaryError;
    }
  }
};

export default connectDB;
