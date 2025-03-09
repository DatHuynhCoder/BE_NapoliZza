import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('Cannot connect to DB: ', error);
    process.exit(1); //process 1 code means exit with failure, 0 mean success
  }
}