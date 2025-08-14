import mongoose from 'mongoose'

const Schema = mongoose.Schema

const logSchema = new Schema({
    event: String,
    desc: String,

    id: {
        type: Number,
        unique: true
    },

    user: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User',
        immutable: true,
    },

    timestamp: {
        type: Date,
        required: true,
        immutable: true,
        default: Date.now(),
    }
})

export const Log = mongoose.model('Log', logSchema)