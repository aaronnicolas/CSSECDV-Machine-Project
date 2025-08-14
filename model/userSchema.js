import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxlength: 100
    },
    role: { // 0 - user, 1 - mod, 2 - admin
        type: Number,
        min: 0,
        max: 2
    },
    locked: {
        type: Number,
        min: 0,
        max: 1
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    salt: {
        type: String,
        required: true
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
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
    },
    lastLoginAttempt: {
        timestamp: {
            type: Date,
            default: null
        },
        successful: {
            type: Boolean,
            default: null
        },
        ipAddress: {
            type: String,
            default: null,
            maxlength: 45 // IPv6 max length
        },
        userAgent: {
            type: String,
            default: null,
            maxlength: 255
        },
        deviceInfo: {
            browser: {
                type: String,
                default: null,
                maxlength: 50
            },
            os: {
                type: String,
                default: null,
                maxlength: 50
            },
            deviceType: {
                type: String,
                default: null,
                maxlength: 50
            },
            isMobile: {
                type: Boolean,
                default: false
            }
        }
    },
    previousLoginAttempt: {
        timestamp: {
            type: Date,
            default: null
        },
        successful: {
            type: Boolean,
            default: null
        },
        ipAddress: {
            type: String,
            default: null,
            maxlength: 45
        },
        userAgent: {
            type: String,
            default: null,
            maxlength: 255
        },
        deviceInfo: {
            browser: {
                type: String,
                default: null,
                maxlength: 50
            },
            os: {
                type: String,
                default: null,
                maxlength: 50
            },
            deviceType: {
                type: String,
                default: null,
                maxlength: 50
            },
            isMobile: {
                type: Boolean,
                default: false
            }
        }
    }
});

export const User = mongoose.model('User', userSchema);
