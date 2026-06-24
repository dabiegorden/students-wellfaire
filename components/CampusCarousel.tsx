"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Slide {
  src: string;
  title: string;
  caption: string;
}

const slides: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=1600&q=80",
    title: "Celebrating Our Graduates",
    caption: "Excellence in Christian higher education, year after year.",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    title: "A Vibrant Student Community",
    caption: "Thousands of students learning, growing, and thriving together.",
  },
  {
    src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1600&q=80",
    title: "Dedicated Lecturers and Mentors",
    caption: "Faculty committed to your academic and personal success.",
  },
  {
    src: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=1600&q=80",
    title: "SRC and Campus Life",
    caption: "Student leadership, events, and a welfare system that listens.",
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    title: "World-Class Learning Spaces",
    caption: "Modern lecture halls and resources for every programme.",
  },
  {
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80",
    title: "Your Future Starts Here",
    caption: "Join a community that supports your voice and your welfare.",
  },
];

export function CampusCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-cug-red">
            Campus Life
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Life at Catholic University of Ghana
          </h2>
          <p className="mt-4 text-muted-foreground">
            From lecture halls to graduation day and SRC celebrations — a
            community where every student matters.
          </p>
        </div>

        <Carousel
          plugins={[plugin.current]}
          opts={{ loop: true, align: "start" }}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="group relative h-72 overflow-hidden rounded-2xl border border-border shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.src}
                    alt={slide.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-cug-green-dark/90 via-cug-green-dark/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-lg font-bold">{slide.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{slide.caption}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 hidden sm:flex" />
          <CarouselNext className="right-2 hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
