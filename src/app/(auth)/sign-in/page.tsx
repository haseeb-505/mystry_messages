'use client'

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/schemas/signInSchem"
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";


const page = () => {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifierMessage, setIdentifierMessage] = useState("");

  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  const onSubmit = async (data:z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);

    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password
    });
    if (result?.error) {
      setIdentifierMessage(result.error)
      toast("Login failed",{
        description: result.error
      })
      setIsSubmitting(false);
    } else {
      toast("Login successful")
      setIsSubmitting(false);
    }

    if (result?.url) {
      console.log("resulting url is: ", result.url)
      setIsSubmitting(false);
      router.replace("/dashboard")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-lg font-extrabold tracking-tight lg:text-5xl mb-6">
            SignIn to Mystery Message
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="email/username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setIdentifier(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {!identifierMessage && <span>username or email here</span>}
                    {identifierMessage && (
                      <span
                        className={"text-red-600"}
                      >
                        {" "}
                        {identifierMessage}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="cursor-pointer"
              >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page
