import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { User } from "./model/userSchema.js"

dotenv.config()

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected to: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

const createAdmin = async () => {
  try {
    await connectDB();

    const username = "admin";
    const email = "admin3@example.com";
    const plainPassword = "admin"; // strong enough to pass validation
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const admin = new User({
      username,
      email,
      role: 2, // admin
      locked: false,
      password: hashedPassword,
      salt,
      failedLoginAttempts: 0,
      lockedUntil: null,
      securityQuestion1: "What is your favorite game?",
      securityAnswerHash1: await bcrypt.hash("Zelda", salt),
      securityQuestion2: "What is your favorite color?",
      securityAnswerHash2: await bcrypt.hash("Blue", salt),
      lastLoginAttempt: {},
      previousLoginAttempt: {},
    })

    await admin.save();
    console.log(`Admin user "${username}" created successfully.`)
  } catch (err) {
    console.error("Error creating admin:", err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdmin()