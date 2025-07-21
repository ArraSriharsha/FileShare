import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.isGoogleUser; // Password only required for non-Google users
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
    },
    profilePicture: {
        type: String,
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;