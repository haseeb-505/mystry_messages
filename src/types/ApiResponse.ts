import { IMessage } from "@/models/User";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    // sometime we may need to send only the message in response
    // so we import IMessage schema here
    messages?: Array<IMessage>;
}