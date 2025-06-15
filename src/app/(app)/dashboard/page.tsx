"use client";

import MessageCard from "@/components/MessageCard";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { IMessage } from "@/models/User";
import { acceptMessagesSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@react-email/components";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const page = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(
      messages.filter((message) => {
        message._id !== messageId;
      })
    );
  };

  const { data: session } = useSession();

  // accept message shcema validation using zod
  const form = useForm({
    resolver: zodResolver(acceptMessagesSchema),
    defaultValues: {
      acceptMessages: true,
    }
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");
  
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get("/api/accept-messages");
      form.setValue("acceptMessages", response.data.isAcceptingMessages ?? true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Error", {
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message settings",
      });
      // Fallback to true if API fails
      form.setValue("acceptMessages", true);
    } finally {
      setIsSwitchLoading(false);
    }
  }, [form]);

  const fetchAllMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response.data.messages || []);
        if (refresh) {
          toast.success("Refreshed Messages", {
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error("Error Fetching all messages", {
          description:
            axiosError.response?.data.message || "Failed to fetch all message",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAllMessages();
    fetchAcceptMessage();
  }, [session, fetchAcceptMessage, fetchAllMessages]);

  // handle awitch change
  const handleSwitchChange = async () => {
    try {
      // using optimistic approach
      // update the value at ui, and send request for backend updating
      const newValue = !acceptMessages;
      form.setValue("acceptMessages", newValue);
      
      // backend request
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: newValue,
      });
      toast.success(response.data.message);
    } catch (error) {
      // Revert on error
      form.setValue("acceptMessages", !acceptMessages);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Failed to toggle", {
        description:
          axiosError.response?.data.message || "Failed to toggle switch state",
      });
    }
  };

  const sessionUser = session?.user as User;
  const username = sessionUser?.username;
  // console.log("Username is: ", username)
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboad = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("URL coppied", {
      description: "Profile url has been copied to clipboard",
    });
  };

  if (!session || !session.user) {
    return <div className="flex text-center text-2xl bg-black text-white mt-8 mx-auto p-6 border rounded-lg">Please Login</div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            title="Your unique profile URL"
            value={profileUrl}
            disabled
            className="input input-border w-full p-2 mr-2"
          />
          <Button className="bg-black text-white text-center cursor-pointer w-16 px-6 py-2 rounded-lg hover:bg-gray-700" onClick={copyToClipboad}>Copy</Button>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <label htmlFor="accept-messages" className="mr-2">
          Accept Messages:
        </label>
        <Switch
          id="accept-messages"
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
          aria-label="Toggle message acceptance"
        />
        <span className="ml-2">{acceptMessages ? "On" : "Off"}</span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        onClick={(e) => {
          e.preventDefault();
          fetchAllMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message?._id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};

export default page;
