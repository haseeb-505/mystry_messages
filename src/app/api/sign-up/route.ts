// src/app/api/sign-up/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TempUserModel from "@/models/TempUser";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  // added logic check for existing user if it has same email and username, raise error, 
  // if either of the both is different, generate a verifyCode, 
  // let the first verifier take the credentials 
  // but if some existing user has the any of mail or name, raise error

  // create temporary user in temp model and then update it in verify
  try {
    const { username, email, password } = await request.json();

    // check if user with same credentials, both username and email, is already in the temp model
    const existingTempUser = await TempUserModel.findOne({
        $and: [{ username }, { email }]
    });
    if (existingTempUser) {
        return NextResponse.json({
            success: false,
            message: "This user is already created, please verify your account ASAP"
        }, {status: 400})
    }

    // check if the user with these credentials is in UserModel, i.e. permanent model
    const existingVerifiedUser = await UserModel.findOne({
        $or: [{ username, isVerified: true }, { email, isVerified: true }]
    })
    if (existingVerifiedUser) {
        return NextResponse.json({
            success: false,
            message: "Already exists a verified user with either same email or same username"
        }, {status: 400})
    }

    // 

    // hashpassword 
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode =  Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes 

    // save new user
    const newTempUser = new TempUserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
    });
    await newTempUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, username, verifyCode);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      { status: 201 }
    );
    

  } catch (error) {
    console.error("Error in sign-up route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}