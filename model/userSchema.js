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
})

export const User = mongoose.model('User', userSchema)