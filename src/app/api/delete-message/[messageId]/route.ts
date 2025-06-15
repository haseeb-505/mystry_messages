import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(request: Request, {params}: {params: {messageId: string}}){
    // establish db connection
    dbConnect();

    // extract the message id
    const messageId = params?.messageId;
    
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        console.log("Session expired")
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {status: 401})
    }

    try {
        const updatedResult = await UserModel.updateOne(
            {_id: user._id},
            {$pull: {messages: {_id: messageId}}}
        );

        if (!updatedResult.modifiedCount == false) {
            return Response.json({
                success: false,
                message: "Message not found or already deleted"
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: "Message deleted"
        }, {status: 200})

    } catch (error) {
        console.log("Error in delete message route: ", error)
        return Response.json({
            success: false,
            message: "Internal sever error"
        }, {status: 500})
    }
}



