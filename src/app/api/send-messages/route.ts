
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { IMessage } from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();

    const {username, content} = await request.json();
    try {
        const user = await UserModel.findOne({username});
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 404})
        }

        if (!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User is not accepting the messages"
            }, {status: 403})
        }

        const newMessage = {content, createdAt: new Date()};
        user.messages.push(newMessage as IMessage);
        await user.save();

        return Response.json({
            success: true,
            message: "Message sent successfully"
        }, {status: 200})
    } catch (error) {
        console.log("Error sending messages: ", error)
        return Response.json({
            success: false,
            message: "Internal server error"
        }, {status: 500})
    }
}



