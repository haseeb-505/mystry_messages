"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AutoPlay from "embla-carousel-autoplay";
import messages from "@/messages.json";

export default function Home() {
  return (
    <>
    <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">
          Dive into the World of Anonymous Conversations
        </h1>
        <p className="mt-3 md:mt-4 text-base">
          Explore Mystry Message - Where your identity remains secret.
        </p>
      </section>
        <Carousel
          plugins={[AutoPlay({delay: 2000})]} 
          className="w-full max-w-xs">
      <CarouselContent>
        {
          messages.map((message, index)=> (
            <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardHeader className="text-center text-3xl font-bold">
                  {message.title}
                </CardHeader>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-lg font-medium">{message.content}</span>
                </CardContent>
                <CardFooter>
                  {message.received}
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
          ))
        }
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
    </main>
    <footer className="text-center p-4 md:p-6">
      © 2025 Mystry Message. All rights reserved.
    </footer>
    </>
  );
}
