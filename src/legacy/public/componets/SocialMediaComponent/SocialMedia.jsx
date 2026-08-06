import React, { useEffect, useState } from "react";

// List of social icons (Font Awesome classes)
const logos = [
  {
    id: 1,
    name: "Facebook",
    url: "https://www.facebook.com/Khudiioficial/",
    icon: "fab fa-facebook-f",
    color: "text-blue-600",
  },
  {
    id: 2,
    name: "YouTube",
    url: "https://www.youtube.com/@khudiiofficial",
    icon: "fab fa-youtube",
    color: "text-red-600",
  },
  {
    id: 3,
    name: "Instagram",
    url: "https://www.instagram.com/khudiiofficial/",
    icon: "fab fa-instagram",
    color: "text-pink-500",
  },
  {
    id: 4,
    name: "WhatsApp",
    url: "https://api.whatsapp.com/send/?phone=%2B923198548344",
    icon: "fab fa-whatsapp",
    color: "text-green-500",
  },
  {
    id: 5,
    name: "TikTok",
    url: "https://www.tiktok.com/@khudii",
    icon: "fab fa-tiktok",
    color: "text-gray-900",
  },
];

export default function LogoCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % logos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Show 3 icons at a time
  const visible = [
    logos[current],
    logos[(current + 1) % logos.length],
    logos[(current + 2) % logos.length],
  ];

  return (
    <section className="w-11/12 md:w-4/5 mx-auto py-12">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
        Connect with Us
      </h2>

      <div className="flex justify-center items-center gap-8 overflow-hidden">
        {visible.map((logo) => (
          <a
            key={logo.id}
            href={logo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md hover:shadow-xl transition-all duration-300"
          >
            <i
              className={`${logo.icon} ${logo.color} text-3xl group-hover:scale-125 group-hover:rotate-6 transition-transform duration-500`}
            ></i>
          </a>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {logos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-colors ${
              current === idx ? "bg-indigo-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
