import mongoose,  { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    content: string;
    createdAt: Date;
};

// removed verifyCode and verifyCodeExpiry as they both are not needed for verified User 
// becuase in this model we are saving only verified user
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: IMessage[];
}

// scehmas here
const MessageSchema: Schema<IMessage> = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "please insert a valid email address"],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    messages: {
        type: [MessageSchema]
    },
});

// export Message and User models

// to check if a model is already there, then we fetch it
// mongoose.models.User as mongoose.Model<IMessage>

const MessageModel = mongoose.models.Message as mongoose.Model<IMessage> || mongoose.model<IMessage>("Message", MessageSchema);

const UserModel = mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
export {
    MessageModel,
}

