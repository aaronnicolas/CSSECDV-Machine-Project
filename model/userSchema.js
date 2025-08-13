import mongoose from 'mongoose'

const Schema = mongoose.Schema

/***
 * What would we like the user to be able to identify and do?
 * 
 * We want the user to..
 */

const userSchema = new Schema ({
    username: String,       // have a name
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: Number,          // role identifier for certain access
    locked: Number,        // locking users for a certain amount of time? maybe this should be a clock idk
    
    dateCreated: {
        type: Date,
        default: Date.now
    },
    
    password: {
        type: String,
        required: true
    },

    salt: {
        type: String,
        required: true
    },
    failedLoginAttempts: { 
        type: Number, 
        default: 0 
    },
    lockedUntil: { 
        type: Date, 
        default: null 
    },
    locked: { 
        type: Boolean, 
        default: false 
    },
    securityQuestion1: {
        type: String,
        enum: ['What is your favorite game?', 'What is your favorite color?'],
        required: true
    },
    securityAnswerHash1: {
        type: String,
        required: true
    },
    securityQuestion2: {
        type: String,
        enum: ['What is your favorite game?', 'What is your favorite color?'],
        required: true
    },
    securityAnswerHash2: {
        type: String,
        required: true
    }
})

export const User = mongoose.model('User', userSchema)