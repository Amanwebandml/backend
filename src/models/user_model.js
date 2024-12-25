import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import brycpt from 'bcryptjs';


const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required:[true, 'Password is required']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        }
    ],
    refreshToken: {
        type: String,
    },
}, {timestamps: true
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await brycpt.hash(this.password, 10);
    next();
})
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await brycpt.compare(password, this.password);
}
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        }, process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: ACCESS_TOKEN_EXPIRY});
}
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRY});
}
export const User = mongoose.model('User', UserSchema);