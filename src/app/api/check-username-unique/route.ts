import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        // url would look like this
        // localhost:3000/api/cuu?username=haseeb?phone=andriod
        const {searchParams} = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        // validate wiht zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log("result in check username is: ", result) // TODO: REMOVE
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters'
            }, {status: 400})
        }

        const {username} = result.data;

        const existingVerfiedUser = await UserModel.findOne({username, isVerified: true})
        if (existingVerfiedUser) {
            return Response.json({
                success: false,
                message: 'username already taken'
            }, {status: 400})
        }

        return Response.json({
                success: true,
                message: 'username available'
            }, {status: 201})

    } catch (error) {
        console.error("Error checking username: ", error);
        return Response.json({
            success: false,
            message: "Error checking username"
        }, { status: 500})
    }
}






