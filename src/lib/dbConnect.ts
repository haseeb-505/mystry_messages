import UserModel from "@/models/User";
import { darcula } from "@react-email/components";
import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        connection.isConnected = db.connections[0].readyState;
        console.log("DB Connected Successfully!!")

        // delete unverified user after code expires
        try {
            const deleted = await UserModel.deleteMany({
                isVerified: false,
                verifyCodeExpiry : { $lt: new Date() }
            });
            console.log(`Deleted ${deleted.deletedCount} unverified users with expired codes`)
        } catch (cleanupError) {
            console.error("Error cleaning unverified expired users: ", cleanupError);   
        }

    } catch (error) {
        console.log("DB connection failed ", error)
        process.exit(1)
    }
}

export default dbConnect;
