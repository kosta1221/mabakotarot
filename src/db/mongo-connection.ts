import mongoose from "mongoose";
const env = process.env.NODE_ENV || "production";
const MONGO_URI = env === "test" ? process.env.TEST_MONGO_URI! : process.env.MONGO_URI!;

export const connectToMongo = async () => {
  await mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      console.log(`connected to MongoDB - ${env}`);
    })
    .catch((error) => {
      console.log("error connecting to MongoDB:", error.message);
      throw error;
    });
};

export const disconnectFromMongo = async () => {
  console.log("disconnecting from mongoDB...");
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw error;
  }
};
