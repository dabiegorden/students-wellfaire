"use client";

import { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1920&q=80",
];

/**
 * Auto-rotating, crossfading background image carousel for the hero.
 */
export function HeroBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      {/* Green overlay so foreground text stays readable */}
      <div className="absolute inset-0 bg-linear-to-r from-cug-green-dark/95 via-cug-green/85 to-cug-green-dark/75" />
      <div className="absolute inset-0 bg-cug-green-dark/40" />
    </div>
  );
}
