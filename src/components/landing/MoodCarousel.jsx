import React, { useState } from "react";
import { motion } from "framer-motion";
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
    image: "https://i0.wp.com/www.everylastbite.com/wp-content/uploads/2025/04/creamy-truffle-and-mushroom-pasta-26.jpg?w=1365&ssl=1",
    mood: "Stressed",
    match: 98,
    reason: "Earthy, comforting umami flavors that melt your stress away.",
    emoji: "😫",
    ingredients: ["8 oz tagliatelle", "2 tbsp truffle oil", "1 cup mushrooms", "Parmesan", "Garlic", "Cream"],
    instructions: ["Boil pasta until al dente.", "Sauté mushrooms in garlic and oil.", "Stir in cream and truffle oil.", "Toss with pasta and top with parmesan."]
  },
  {
    id: 2,
    title: "Seared Salmon & Quinoa Bowl",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
    mood: "Energetic",
    match: 95,
    reason: "Packed with lean protein and superfoods for sustained, clean energy.",
    emoji: "⚡",
    ingredients: ["1 salmon fillet", "1/2 cup quinoa", "Avocado", "Spinach", "Lemon dressing"],
    instructions: ["Cook quinoa.", "Pan-sear salmon until flaky.", "Assemble bowl with spinach and avocado.", "Drizzle with lemon dressing."]
  },
  {
    id: 3,
    title: "Cozy Butternut Squash Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    mood: "Cozy",
    match: 97,
    reason: "A warm, soothing bowl of autumn comfort to relax your evening.",
    emoji: "🍂",
    ingredients: ["1 butternut squash", "1 onion", "Vegetable broth", "Nutmeg", "Heavy cream"],
    instructions: ["Roast squash until tender.", "Sauté onion.", "Blend squash, onion, and broth.", "Simmer with nutmeg and cream."]
  },
  {
    id: 4,
    title: "Filet Mignon & Asparagus",
    image: "https://images.unsplash.com/photo-1558030006-450675393462",
    mood: "Romantic",
    match: 99,
    reason: "A restaurant-quality elegant classic to set the perfect mood.",
    emoji: "✨",
    ingredients: ["2 filet mignon steaks", "Bunch of asparagus", "Butter", "Rosemary", "Red wine reduction"],
    instructions: ["Sear steaks in butter and rosemary.", "Roast asparagus with olive oil.", "Prepare red wine reduction.", "Serve steaks hot with reduction."]
  }
];

const RecipeCard = ({ recipe }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className="relative h-[550px] cursor-pointer" 
      onClick={() => setFlipped(!flipped)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 shadow-2xl rounded-[40px] overflow-hidden bg-black"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
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
            <button 
              onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
              className="bg-white text-[#3d5244] px-8 py-3 rounded-full font-bold transition shadow-lg pointer-events-auto hover:bg-gray-100"
            >
              Tap to Flip
            </button>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 shadow-2xl rounded-[40px] overflow-hidden bg-white border-2 border-gray-100 p-8 flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex-1 overflow-y-auto pr-2">
            <h3 className="text-3xl font-bold text-[#3d5244] mb-6">{recipe.title}</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🛒</span> Ingredients
              </h4>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600 font-medium">
                    <span className="text-[#6b9b76] mt-1">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">👨‍🍳</span> Instructions
              </h4>
              <ol className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-600 font-medium leading-relaxed">
                    <span className="font-bold text-[#6b9b76]">{idx + 1}.</span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="pt-6 mt-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              className="w-full bg-[#3d5244] text-white px-8 py-3 rounded-full font-bold transition shadow-lg pointer-events-auto hover:bg-[#2c3d32]"
            >
              Flip Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
              <RecipeCard recipe={recipe} />
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