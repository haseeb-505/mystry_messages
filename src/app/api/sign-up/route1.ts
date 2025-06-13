// src/app/api/sign-up/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import TempUserModel from "@/models/TempUser";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
        const { username, email, password } = await request.json();

        // Check for existing verified user
        const existingVerifiedUser = await UserModel.findOne({
            $or: [{ username, isVerified: true }, { email, isVerified: true }],
        });

        if (existingVerifiedUser) {
        return NextResponse.json(
            {
            success: false,
            message:
                existingVerifiedUser.username === username
                ? "Username already taken"
                : "Email already registered",
            }, { status: 400 });
        }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create or update user
    const existingUnverifiedUser = await UserModel.findOne({
      username,
      isVerified: false,
    });
    if (existingUnverifiedUser) {
      // Update existing unverified user
      existingUnverifiedUser.email = email;
      existingUnverifiedUser.password = hashedPassword;
      existingUnverifiedUser.verifyCode = verifyCode;
      existingUnverifiedUser.verifyCodeExpiry = verifyCodeExpiry;
      await existingUnverifiedUser.save();
    } else {
      // Create new user
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
      });
      await newUser.save();
    }

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