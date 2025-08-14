// createAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// Load env vars
dotenv.config();

// Connect to DB
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
};

// Define User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);

// Create admin account
const createAdmin = async () => {
  try {
    await connectDB();

    const username = "admin"; // change as needed
    const plainPassword = "changeme"; // change as needed

    // Hash password with 12 salt rounds
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const admin = new User({
      username,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log(`Admin user "${username}" created successfully.`);

  } catch (err) {
    console.error("Error creating admin:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
