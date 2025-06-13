import mongoose,  { Schema, Document } from "mongoose";

export interface ITempUser extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string | undefined;
    verifyCodeExpiry: Date | undefined;
}

const tempUserSchema: Schema<ITempUser> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        match: [/.+\@.+\..+/, "please insert a valid email address"],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    },
    verifyCode: {
        type: String,
        required: true,
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "Verify code expiry is required"],
    },

    // temporay user won't have messages, isAccepting message state, isVerified 

});

// export temp User models

// to check if a model is already there, then we fetch it
// mongoose.models.User as mongoose.Model<ITempUser>

export default mongoose.models.TempUser<ITempUser> as mongoose.Model<ITempUser> || mongoose.model<ITempUser>("TempUser", tempUserSchema);

