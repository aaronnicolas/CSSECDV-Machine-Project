/**
 * <> SEIROKU SERVER <>
 *
 * Main entry point of the Express server
 *
 * Responsibilities:
 * - Connects to MongoDB using Mongoose
 * - Configures middleware (JSON parser, logger, etc.)
 * - Mounts API routes from the routes/ folder
 * - Handles global error and logging
 * - Starts the Express HTTP server
 *
 * Environment:
 * - NODE_ENV: dev | test | prod
 * - PORT: defaults to 8888 if not set
 *
 * Author: syune_mu
 * Date: 2025/07/27
 */

import express from "express"
import exphbs from "express-handlebars"
import routes from "./routes/routes.js"
import dotenv from "dotenv"
import mongoose from "mongoose"

import { Log } from "./model/logSchema.js"

/***
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * BEGINNING OF BOILER PLATE
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

// Load environment variables
dotenv.config()

// Define server object and port
const app   = express()
const port  = process.env.PORT

// Register hbs definition with Express
app.engine("hbs", exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main'
}))

// Set the template rendering engine
app.set("view engine", "hbs")
app.set("views", "./views")

// Connect router to server
app.use(`/`, routes)
app.use(express.static('public'));

/***
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * END OF BOILER PLATE
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */



/***
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * BEGINNING OF MIDDLE WARES
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

// 2.4.3 Logger middleware
app.use((req, res, next) => {
  res.on('finish', async () => {
    //const duration = Date.now() - start;
    //const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms\n`;

    //if (process.env.NODE_ENV !== 'test') console.log(log.trim());
    //logStream.write(log);

     try {
        // Save to MONGODB
        await Log.create({
            event: `${req.method} ${req.originalUrl}`,
            desc: `Responded with ${res.statusCode} in ${Date.now() - start}ms`,
            id: Date.now(), // Replace with proper increment if needed
            user: req.user?._id || undefined // Make sure req.user exists
        });
    } catch (err) {
      console.error('Log error:', err.message);
    }
  });

  next();
});

// 2.4.1 Error Handler
app.use((err, req, res, next) => {
    // prod or dev
    // if prod then, true
    const isProd = process.env.NODE_ENV === 'prod';

    res.status(err.status || 500).json({
        error: isProd ? 'Internal Server Error' : err.message,
        ...(isProd ? {} : { stack: err.stack })
    });
});

// Connect to database...
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

connectDB()

/***
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * END OF MIDDLE WARES
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */




// Server starts listening..

app.listen(port, () => {
    console.log(`Server running at 127.0.0.1:${port}`)
})