import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        console.log("\n\nDB has following data values: ", db);
        connection.isConnected = db.connections[0].readyState;
        console.log("DB Connected Successfully!!")
    } catch (error) {
        console.log("DB connection failed ", error)
        process.exit(1)
    }
}

export default dbConnect;
