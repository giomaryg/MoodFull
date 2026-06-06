import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const recipes = [
  {
    id: 1,
    title: "Rich Truffle Mushroom Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",
    mood: "Stressed",
    match: 98,
    reason: "Earthy, comforting umami flavors that melt your stress away.",
    emoji: "😫"
  },
  {
    id: 2,
    title: "Seared Salmon & Quinoa Bowl",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
    mood: "Energetic",
    match: 95,
    reason: "Packed with lean protein and superfoods for sustained, clean energy.",
    emoji: "⚡"
  },
  {
    id: 3,
    title: "Cozy Butternut Squash Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    mood: "Cozy",
    match: 97,
    reason: "A warm, soothing bowl of autumn comfort to relax your evening.",
    emoji: "🍂"
  },
  {
    id: 4,
    title: "Filet Mignon & Asparagus",
    image: "https://images.unsplash.com/photo-1558030006-450675393462",
    mood: "Romantic",
    match: 99,
    reason: "A restaurant-quality elegant classic to set the perfect mood.",
    emoji: "✨"
  }
];

export default function MoodCarousel() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="mb-6">
        <h2 className="text-4xl font-bold text-[#3d5244]">
          Your Mood Match
        </h2>

        <p className="text-gray-500 mt-2 text-lg">
          AI-generated meals based on your mood and pantry.
        </p>
      </div>

      <Carousel
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="rounded-[40px]">
          {recipes.map((recipe) => (
            <CarouselItem key={recipe.id}>
              <div className="relative overflow-hidden h-[550px] shadow-2xl rounded-[40px]">

                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-8 text-white w-full">

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md mb-4 text-sm font-medium">
                    ✨ {recipe.match}% Mood Match
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold mb-4 max-w-md leading-tight">
                    {recipe.title}
                  </h2>

                  <div className="flex gap-3 mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                      {recipe.emoji} {recipe.mood}
                    </span>

                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                      🍴 AI Generated
                    </span>
                  </div>

                  <p className="max-w-lg text-white/90 mb-6 text-lg">
                    {recipe.reason}
                  </p>

                  <button className="bg-white text-[#3d5244] px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg">
                    View Recipe
                  </button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-end gap-2 mt-4 pr-4">
          <CarouselPrevious className="static translate-y-0 text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 border-gray-200" />
          <CarouselNext className="static translate-y-0 text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 border-gray-200" />
        </div>
      </Carousel>

      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <div className="px-5 py-3 bg-red-50 text-red-700 rounded-full font-medium">
          😫 Stressed
        </div>

        <div className="px-5 py-3 bg-yellow-50 text-yellow-700 rounded-full font-medium">
          ⚡ Energetic
        </div>

        <div className="px-5 py-3 bg-orange-50 text-orange-700 rounded-full font-medium">
          🍂 Cozy
        </div>

        <div className="px-5 py-3 bg-pink-50 text-pink-700 rounded-full font-medium">
          ✨ Romantic
        </div>
      </div>
    </div>
  );
}