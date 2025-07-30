/***
import mongoose from 'mongoose'

const Schema = mongoose.Schema


 *
 * Something about History? Not too sure what this hsould be tbh
 * 
 

const historySchema = new Schema ({
    username: String,       // have a name
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
****/