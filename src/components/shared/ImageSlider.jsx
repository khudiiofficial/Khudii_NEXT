'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageSlider({ slides = [], autoPlayInterval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const length = slides.length;

  useEffect(() => {
    if (length <= 1 || isHovered) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [length, isHovered, autoPlayInterval]);

  if (!slides || length === 0) return null;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + length) % length);

  return (
    <div
      className="w-full relative group overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Homepage Slider"
    >
      {/* Slides Container */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[16/6] min-h-[220px] max-h-[520px] overflow-hidden bg-slate-900">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const imageSrc = slide.image || slide.imageUrl || slide.image_path;
          const title = slide.title || slide.description || '';
          const link = slide.linkUrl || slide.link_url || slide.description;

          const content = (
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={imageSrc}
                alt={title || `Slide ${index + 1}`}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {title && (
                <div className="absolute bottom-6 left-6 right-6 md:left-12 md:bottom-10 max-w-xl z-20">
                  <h2 className="text-white text-lg md:text-2xl font-bold drop-shadow-md m-0">
                    {title}
                  </h2>
                </div>
              )}
            </div>
          );

          if (link && link.startsWith('/')) {
            return (
              <Link key={index} href={link} className="block">
                {content}
              </Link>
            );
          }
          if (link && /^https?:\/\//i.test(link)) {
            return (
              <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            );
          }
          return <React.Fragment key={index}>{content}</React.Fragment>;
        })}
      </div>

      {/* Prev / Next Arrows */}
      {length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-none cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-none cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 border-none cursor-pointer ${
                  current === i ? 'w-6 bg-[#02236E]' : 'w-2 bg-white/60 hover:bg-white/90'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
