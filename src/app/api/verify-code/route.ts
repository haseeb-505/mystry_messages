import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import TempUserModel from "@/models/TempUser";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    await dbConnect();

    try {
        const {username, code} = await request.json();
        const decodedUsername = decodeURIComponent(username);
        // find the user
        const tempUser = await TempUserModel.findOne({username: decodedUsername});
        if (!tempUser) {
            return NextResponse.json({
            success: false,
            message: "User not found"
        }, { status: 404})
        }

        // check code and expiry date
        const isCodeValid = tempUser.verifyCode === code;
        const isCodeNotExpired = new Date(tempUser.verifyCodeExpiry ?? 0) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            const newUser = new UserModel({
                username: tempUser.username,
                email: tempUser.email,
                password: tempUser.password,
                isVerified: true,
            });
            await newUser.save();
            // delete the temporary user
            await TempUserModel.deleteOne({ username });
            return NextResponse.json(
                { success: true, message: "Account verified successfully!" },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            await TempUserModel.deleteOne({ username });
            return NextResponse.json(
                {
                success: false,
                message: "Verification code is expired. Please signup again to get a new code.",
                },
                { status: 400 }
            );
        } else if (!isCodeValid) {
            return NextResponse.json(
                {
                success: false,
                message: "Verification code is invalid, try again",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying user: ", error);
        return Response.json({
            success: false,
            message: "Error verifying user"
        }, { status: 500})
    }
}