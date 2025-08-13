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
import session from "express-session"
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcrypt"
import flash from "express-flash"

import { Log } from "./model/logSchema.js"
import { User } from "./model/userSchema.js"

/***
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * BEGINNING OF BOILER PLATE
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

// Load environment variables
dotenv.config()

// Define server object and port
const app   = express()
const port  = process.env.PORT || 3000

// Register hbs definition with Express
app.engine("hbs", exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    helpers: {
      gt: (a, b) => Number(a) > Number(b),
      json: (context) => JSON.stringify(context, null, 2)
    }
}))

// Set the template rendering engine
app.set("view engine", "hbs")
app.set("views", "./views")

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}))

// Flash message middleware
app.use(flash())

// Passport configuration
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { message: 'Authentication failed. Please check your credentials.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Authentication failed. Please check your credentials.' });
            }
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Initialize passport
app.use(passport.initialize())
app.use(passport.session())

// Connect router to server
app.use(`/`, routes)
app.use(express.static('public'))


// Authentication error handler
app.use((err, req, res, next) => {
    if (err.status === 401) {
        return res.redirect('/login?feedback=Please log in to access this page');
    }
    next(err);
});

// Missing Page handler
app.use((req, res, next) => {
    res.status(404).render("404", {
        title: "Page Not Found",
        layout: "error",
        user: req.user || null
    })
})

// Internal Server Error middleware
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === "dev") {
        console.error(err.stack)
    }
    
    res.status(500).render("500", {
        title: "Internal Server Error 500",
        layout: "error",
    })
})



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
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
     try {
        // Save to MONGODB
        await Log.create({
            event: `${req.method} ${req.originalUrl}`,
            desc: `Responded with ${res.statusCode} in ${duration}ms`,
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


