import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        console.log("Session expired")
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {status: 401})
    }

    // we converted user id to string,
    // it may raise an error in mongoose aggregations

    const userId = new mongoose.Types.ObjectId(user?._id);

    try {
        const user = await UserModel.aggregate([
            {$match: {_id: userId}},
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt': -1}},
            {$group: {_id: '$_id', messages: {$push: '$messages'}}}
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 401})
        }

        return Response.json({
            success: true,
            messages: user[0].messages
        }, {status: 200})
    } catch (error) {
        console.log("Internal sever error: ", error)
        return Response.json({
            success: false,
            message: "Internal sever error"
        }, {status: 500})
    }
}





