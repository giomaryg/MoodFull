import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Utensils, Search, Leaf, ShieldAlert, ArrowRight, ExternalLink, X, Clock, ShieldCheck, Zap, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapUpdater() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const getImage = (name) => {
  const n = name.toLowerCase();
  if (n.includes('bowl') || n.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80';
  if (n.includes('sushi') || n.includes('roll') || n.includes('sashimi')) return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80';
  if (n.includes('burger') || n.includes('sandwich')) return 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80';
  if (n.includes('pizza')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chicken')) return 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=400&q=80';
  if (n.includes('wrap') || n.includes('burrito') || n.includes('taco')) return 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
};

export default function SmartTakeoutPanel({ isOpen, onClose, contextMoods = [], contextRecipe = null, userPreferences = {} }) {
  const [craving, setCraving] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [viewMode, setViewMode] = useState('dominant'); // 'dominant' | 'alternatives'
  const [userLoc, setUserLoc] = useState([40.7128, -74.0060]); // Default to NYC
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const query = `[out:json];(node["amenity"~"restaurant|fast_food|cafe"](around:1000,${userLoc[0]},${userLoc[1]}););out 15;`;
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data.elements) {
          const places = data.elements.filter(e => e.tags && e.tags.name).map(e => ({
            restaurant_type: e.tags.name,
            item_name: e.tags.cuisine ? `${e.tags.cuisine.split(';')[0]} cuisine` : 'Local food',
            loc: [e.lat, e.lon],
            isTop: false,
            isBackground: true
          }));
          setNearbyPlaces(places);
        }
      } catch (err) {
        console.error("Failed to fetch nearby places", err);
      }
    };
    fetchNearby();
  }, [userLoc]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, []);

  const getMockLocation = (center, index) => {
    // A broader set of offsets to simulate "all restaurants near user"
    const offsets = [
      [0.004, 0.005], [-0.003, -0.006], [0.007, -0.002],
      [-0.005, 0.008], [0.002, -0.008], [-0.008, 0.001],
      [0.012, 0.003], [-0.011, -0.004], [0.009, -0.010],
      [-0.007, 0.012], [0.015, -0.005], [-0.013, 0.007],
      [0.001, 0.014], [-0.002, -0.015], [0.006, 0.009],
      [-0.009, -0.007]
    ];
    const offset = offsets[index % offsets.length];
    return [center[0] + offset[0], center[1] + offset[1]];
  };

  const mapMarkers = React.useMemo(() => {
    if (!suggestions) return [];
    const markers = [];
    // The top pick
    if (suggestions.dominant_recommendation) {
      markers.push({ ...suggestions.dominant_recommendation, loc: getMockLocation(userLoc, 0), isTop: true });
    }
    // The 5 alternatives
    if (suggestions.alternatives) {
      suggestions.alternatives.forEach((alt, i) => {
        markers.push({ ...alt, loc: getMockLocation(userLoc, i + 1), isTop: false });
      });
    }
    // Background noise: "all restaurants near user"
    if (nearbyPlaces.length > 0) {
      markers.push(...nearbyPlaces);
    } else {
      for (let i = 6; i < 16; i++) {
         markers.push({
           restaurant_type: "Local Restaurant",
           item_name: "Various Menu Items",
           loc: getMockLocation(userLoc, i),
           isTop: false,
           isBackground: true
         });
      }
    }
    return markers;
  }, [suggestions, userLoc, nearbyPlaces]);

  // Pre-fill if there's a recipe context
  useEffect(() => {
    if (isOpen) {
      if (contextRecipe) {
        setCraving(contextRecipe.name);
      } else {
        setCraving('');
      }
      setSuggestions(null);
    }
  }, [isOpen, contextRecipe]);

  const handleGenerate = async (e, isLazyMode = false) => {
    if (e) e.preventDefault();
    if (!isLazyMode && !craving.trim() && !contextMoods.length && !contextRecipe) {
      toast.error("Tell us what you're craving first!");
      return;
    }

    setIsGenerating(true);
    setSuggestions(null);
    setViewMode('dominant');

    try {
      const moodContext = contextMoods.length > 0 ? `Current mood/vibe: ${contextMoods.join(', ')}` : '';
      const recipeContext = contextRecipe ? `User was looking at: ${contextRecipe.name} (${contextRecipe.description})` : '';
      const cravingContext = craving.trim() ? `User is specifically craving: ${craving.trim()}` : '';
      
      const dietaryContext = userPreferences?.diet_preferences || userPreferences?.allergies 
        ? `Diet: ${userPreferences.diet_preferences || 'None'}, Allergies: ${userPreferences.allergies || 'None'}` 
        : '';
      
      const pregnancyContext = userPreferences?.pregnancy_status && ['pregnant', 'trying'].includes(userPreferences.pregnancy_status)
        ? `\nCRITICAL CONTEXT: The user is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Ensure all suggestions are pregnancy-safe (avoid raw/undercooked animal products, unpasteurized dairy, high-mercury fish, alcohol, etc).`
        : '';

      const prompt = `You are MoodFull's Smart Takeout AI. The user wants to order takeout instead of cooking.
${moodContext}
${recipeContext}
${isLazyMode ? 'User clicked "I dont want to cook" - just pick the absolute best option for them right now based on time of day and general healthy habits.' : cravingContext}
${dietaryContext}
${pregnancyContext}

Based on this, suggest 1 dominant best order, and 5 alternatives.
For each, provide:
1. The restaurant type or generic name (e.g. "Fresh Bowl Co." or "Local Mediterranean")
2. The specific item name to order
3. What typical unhealthy meal this replaces (Swap Instead of Sacrifice)
4. Regret Reduction (e.g. "Saves ~400 calories vs typical order" or "High protein keeps you full")
5. Speed/Urgency (e.g. "Fastest option: ~18 min" or "Ready in ~25 min")
6. Smart Defaults (2 sides/drinks to complete the meal, e.g. "side of guac", "sparkling water")
7. Ordering modifications (e.g. "no mayo", "sauce on side")

Also provide a 'personalization_hook' that sounds like a friend talking (e.g. "You've been eating heavy this week—try this lighter option tonight" or "It's late—here's the fastest healthy choice").
Make it actionable, real, and immediate. Return a structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            personalization_hook: { type: "string" },
            dominant_recommendation: {
              type: "object",
              properties: {
                restaurant_type: { type: "string" },
                item_name: { type: "string" },
                replaces: { type: "string" },
                regret_reduction: { type: "string" },
                speed_urgency: { type: "string" },
                smart_defaults: { type: "array", items: { type: "string" } },
                modifications: { type: "array", items: { type: "string" } }
              },
              required: ["restaurant_type", "item_name", "replaces", "regret_reduction", "speed_urgency", "smart_defaults", "modifications"]
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  restaurant_type: { type: "string" },
                  item_name: { type: "string" },
                  replaces: { type: "string" },
                  regret_reduction: { type: "string" },
                  speed_urgency: { type: "string" },
                  smart_defaults: { type: "array", items: { type: "string" } },
                  modifications: { type: "array", items: { type: "string" } }
                }
              }
            }
          },
          required: ["personalization_hook", "dominant_recommendation", "alternatives"]
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openDeliveryPlatform = (platform, specificItem = '') => {
    let url = '';
    const query = encodeURIComponent(specificItem || craving || contextRecipe?.name || 'healthy food');
    if (platform === 'ubereats') url = `https://www.ubereats.com/search?q=${query}`;
    if (platform === 'doordash') url = `https://www.doordash.com/search/${query}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-[2rem]">
        <div className="bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea] p-6 sm:p-8 border-b border-[#c5d9c9]">
          <div className="flex items-center gap-3 mb-2 pr-8">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#c5d9c9]">
              <Utensils className="w-6 h-6 text-[#6b9b76]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Order Smarter</DialogTitle>
              <DialogDescription className="text-[#5a8a65] font-medium">Smart Takeout Alternatives</DialogDescription>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Not in the mood to cook? We get it. Let AI find healthier versions of your cravings from nearby restaurants.</p>
        </div>

        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto bg-gray-50/50">
          {!suggestions ? (
            <div className="space-y-6">
              {/* LAZY MODE - HUGE CTA */}
              <div className="bg-[#f0f9f2] p-6 rounded-[2rem] border-2 border-[#c5d9c9] text-center shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <h3 className="font-bold text-[#3d5244] text-xl mb-2">I don't want to cook</h3>
                <p className="text-sm text-[#5a8a65] mb-6">Let us pick the absolute best order for you right now based on time & habits.</p>
                
                <div className="mb-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter delivery address & press Enter"
                      className="pl-11 h-12 rounded-xl border-white bg-white text-sm shadow-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.length > 3) {
                          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(e.target.value)}`)
                            .then(res => res.json())
                            .then(data => {
                              if (data && data.length > 0) {
                                setUserLoc([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                                toast.success("Location updated!");
                              } else {
                                toast.error("Location not found");
                              }
                            }).catch(() => toast.error("Error finding location"));
                        }
                      }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={(e) => handleGenerate(e, true)} 
                  disabled={isGenerating}
                  className="w-full h-14 rounded-2xl bg-[#6b9b76] hover:bg-[#5a8a65] text-white shadow-xl transition-all font-bold text-lg"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 mr-2" /> Decide For Me</>}
                </Button>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="bg-gray-50 px-3 text-gray-400 font-bold">Or enter a craving</span></div>
              </div>

              {/* MANUAL INPUT */}
              <form onSubmit={(e) => handleGenerate(e, false)} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={craving}
                    onChange={(e) => setCraving(e.target.value)}
                    placeholder="e.g., Spicy fried chicken, creamy pasta..."
                    className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-[#6b9b76] bg-white text-base shadow-sm"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Address or ZIP code & press Enter"
                    className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-[#6b9b76] bg-white text-base shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.length > 3) {
                        e.preventDefault();
                        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(e.target.value)}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data && data.length > 0) {
                              setUserLoc([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                              toast.success("Location updated!");
                            } else {
                              toast.error("Location not found");
                            }
                          }).catch(() => toast.error("Error finding location"));
                      }
                    }}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isGenerating || (!craving.trim() && !contextMoods.length && !contextRecipe)}
                  className="w-full h-12 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:border-[#6b9b76] hover:text-[#6b9b76] font-bold text-base transition-colors"
                >
                  Find Healthier Options
                </Button>
              </form>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {['Burger & Fries', 'Pizza', 'Chinese Takeout', 'Tacos', 'Sushi'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { setCraving(item); setTimeout(() => handleGenerate(null, false), 100); }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-[#6b9b76] hover:text-[#6b9b76] hover:bg-[#f0f9f2] transition-colors shadow-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <Button variant="ghost" size="sm" onClick={() => setSuggestions(null)} className="text-gray-500 hover:text-gray-800">
                  <X className="w-4 h-4 mr-1" /> Start Over
                </Button>
                {viewMode === 'alternatives' && (
                  <Button variant="outline" size="sm" onClick={() => setViewMode('dominant')} className="text-[#6b9b76] border-[#6b9b76]">
                    View Top Pick
                  </Button>
                )}
              </div>

              <div className="bg-[#f0f9f2] p-4 rounded-xl border border-[#c5d9c9] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#6b9b76] mt-0.5 shrink-0" />
                <p className="text-[#3d5244] font-medium leading-snug">{suggestions.personalization_hook}</p>
              </div>

              {/* Map View */}
              <div className="h-56 w-full rounded-2xl overflow-hidden border border-[#c5d9c9] shadow-sm relative z-0">
                <MapContainer center={userLoc} zoom={13} style={{ height: '224px', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false}>
                  <MapUpdater />
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  {mapMarkers.map((m, idx) => (
                    <Marker 
                      key={idx} 
                      position={m.loc}
                      icon={new L.Icon({
                        iconUrl: m.isTop 
                          ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' 
                          : m.isBackground 
                            ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png' 
                            : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: m.isBackground ? [18, 30] : [25, 41],
                        iconAnchor: m.isBackground ? [9, 30] : [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: m.isBackground ? [30, 30] : [41, 41]
                      })}
                    >
                      <Popup className="rounded-xl">
                        <div className="text-center p-1 min-w-[120px]">
                          <p className="font-bold text-[#3d5244] text-[13px] leading-tight mb-1">{m.restaurant_type}</p>
                          <p className="text-[11px] text-gray-600 mb-2 leading-tight">{m.item_name}</p>
                          {!m.isBackground && (
                            <Button size="sm" className="h-7 text-[10px] w-full bg-[#6b9b76] hover:bg-[#5a8a65]" onClick={() => openDeliveryPlatform('ubereats', m.item_name)}>Order Here</Button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[#3d5244] border border-[#c5d9c9] flex items-center gap-1 shadow-sm">
                  <MapPin className="w-3.5 h-3.5" /> Nearby Options
                </div>
              </div>

              {viewMode === 'dominant' && suggestions.dominant_recommendation && (
                <div className="bg-white rounded-[2rem] border-[3px] border-[#6b9b76] shadow-xl overflow-hidden relative group">
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {suggestions.dominant_recommendation.speed_urgency}
                  </div>
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={getImage(suggestions.dominant_recommendation.item_name)} 
                      alt={suggestions.dominant_recommendation.item_name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-sm font-bold text-[#6b9b76] mb-1 uppercase tracking-wider flex items-center gap-1">
                        <Utensils className="w-3 h-3" /> {suggestions.dominant_recommendation.restaurant_type}
                      </p>
                      <h3 className="text-2xl font-bold leading-tight">{suggestions.dominant_recommendation.item_name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-5">
                    {/* Swap instead of sacrifice */}
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex flex-col flex-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">You Want</span>
                        <span className="text-sm font-medium text-gray-500 line-through">{suggestions.dominant_recommendation.replaces}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 mx-2 shrink-0" />
                      <div className="flex flex-col flex-1 items-end text-right">
                        <span className="text-[10px] uppercase font-bold text-[#6b9b76] mb-1">Try This Instead</span>
                        <span className="text-sm font-bold text-[#3d5244]">{suggestions.dominant_recommendation.item_name}</span>
                      </div>
                    </div>

                    {/* Modifications & Defaults */}
                    <div className="grid grid-cols-2 gap-4 bg-[#f8faf8] p-4 rounded-xl border border-[#e0ede4]">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-amber-500"/> Order it like this:</p>
                        <ul className="space-y-1.5">
                          {suggestions.dominant_recommendation.modifications?.map((m, i) => (
                            <li key={i} className="text-sm font-medium text-gray-800 flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">•</span> <span className="leading-snug">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#6b9b76]"/> Add to order:</p>
                        <ul className="space-y-1.5">
                          {suggestions.dominant_recommendation.smart_defaults?.map((d, i) => (
                            <li key={i} className="text-sm font-medium text-gray-800 flex items-start gap-1.5">
                              <span className="text-[#6b9b76] mt-0.5">+</span> <span className="leading-snug">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Regret Reduction */}
                    <div className="bg-emerald-50 text-emerald-800 text-sm font-bold p-3.5 rounded-xl flex items-center gap-3 border border-emerald-100">
                      <ShieldCheck className="w-5 h-5 shrink-0" /> 
                      <span className="leading-snug">{suggestions.dominant_recommendation.regret_reduction}</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => openDeliveryPlatform('ubereats', suggestions.dominant_recommendation.item_name)} className="w-full bg-black hover:bg-gray-800 text-white h-14 rounded-xl font-bold shadow-md">
                          Uber Eats <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                        </Button>
                        <Button onClick={() => openDeliveryPlatform('doordash', suggestions.dominant_recommendation.item_name)} className="w-full bg-[#EB1700] hover:bg-[#C91300] text-white h-14 rounded-xl font-bold shadow-md">
                          DoorDash <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                        </Button>
                      </div>
                      <Button variant="outline" onClick={() => setViewMode('alternatives')} className="w-full h-12 rounded-xl text-gray-600 font-bold border-gray-200">
                        Show alternatives
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'alternatives' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#3d5244] text-lg px-1">Alternative Options</h3>
                  {suggestions.alternatives?.map((sug, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:border-[#c5d9c9] hover:shadow-md transition-all">
                      <div className="h-32 relative">
                        <img src={getImage(sug.item_name)} alt={sug.item_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <h4 className="text-xl font-bold leading-tight drop-shadow-md">{sug.item_name}</h4>
                          <p className="text-xs font-bold text-white/90 uppercase">{sug.restaurant_type}</p>
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {sug.speed_urgency}
                        </div>
                      </div>
                      <div className="p-4">
                        {sug.replaces && (
                          <p className="text-xs text-gray-500 mb-3 font-medium">Instead of: <span className="line-through">{sug.replaces}</span></p>
                        )}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Modifications</p>
                              <ul className="text-xs text-gray-700 space-y-1">
                                {sug.modifications?.map((m, i) => <li key={i}>• {m}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Add sides</p>
                              <ul className="text-xs text-gray-700 space-y-1">
                                {sug.smart_defaults?.map((m, i) => <li key={i}>+ {m}</li>)}
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                            <ShieldCheck className="w-4 h-4 shrink-0" /> {sug.regret_reduction}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button onClick={() => openDeliveryPlatform('ubereats', sug.item_name)} variant="outline" size="sm" className="h-10 text-xs">Uber Eats</Button>
                            <Button onClick={() => openDeliveryPlatform('doordash', sug.item_name)} variant="outline" size="sm" className="h-10 text-xs">DoorDash</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}