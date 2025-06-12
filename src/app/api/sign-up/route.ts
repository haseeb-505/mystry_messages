import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request) {
    // db connection, edge base connection in Next.js
    await dbConnect()
    try {
        const {username, email, password} = await request.json()
        const exisitngUserVerifiedByUsername = await UserModel.findOne(
            {
                username, 
                isVerified: true
            });
        if (exisitngUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already taken"
            },
        {
            status: 400
        })
        };

        const exisitingUserByEmail= await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (exisitingUserByEmail) {
            if (exisitingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User alreay exists with this email"
                }, {status: 400})
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                // if user is found wiht this email, but not verified, 
                // save its password with new hashedPassword
                exisitingUserByEmail.password = hashedPassword;
                exisitingUserByEmail.verifyCode =  verifyCode;
                exisitingUserByEmail.verifyCodeExpiry =  new Date(Date.now() + 3600000);
                await exisitingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });

            await newUser.save();

            //send verificationEmail
           const emailResponse =  await sendVerificationEmail(email, username, verifyCode)
           if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
           }

           return Response.json({
            success: true,
            message: "User registered successfully. Please verify your email"
           }, {status: 201})
        }


    } catch (error) {
        console.error("Error registering user", error);
        return Response.json({
            success: false,
            message: "Error while registering user"
        },
    {
        status: 500
    })
        
    }
}

