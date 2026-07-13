import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import { Loader2, Sparkles, Utensils, ShieldAlert, ArrowRight, ExternalLink, Clock, ShieldCheck, MapPin, Share2, ChevronRight, Heart, Brain, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { toast } from 'sonner';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);

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

export default function InlineTakeoutResults({ suggestions, isGenerating, userLocationStr, onRefresh }) {
  const [viewMode, setViewMode] = useState('dominant'); // 'dominant' | 'alternatives'
  const [userLoc, setUserLoc] = useState([40.7128, -74.0060]);
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
    if (userLocationStr) {
      const parts = userLocationStr.split(',');
      if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
        setUserLoc([parseFloat(parts[0]), parseFloat(parts[1])]);
      } else {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userLocationStr)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setUserLoc([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            }
          })
          .catch(err => console.log("Geocoding error:", err));
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, [userLocationStr]);

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

  const openDeliveryPlatform = (platform, specificItem = '') => {
    let url = '';
    const query = encodeURIComponent(specificItem || 'healthy food');
    if (platform === 'ubereats') url = `https://www.ubereats.com/search?q=${query}`;
    if (platform === 'doordash') url = `https://www.doordash.com/search/${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = (item) => {
    const text = `I'm thinking of getting the ${item.item_name} from ${item.restaurant_type}!`;
    if (navigator.share) {
      navigator.share({
        title: item.item_name,
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Recommendation copied to clipboard!');
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-[#f0f9f2] p-8 rounded-2xl border border-[#c5d9c9] flex flex-col items-center justify-center space-y-4 shadow-sm w-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b9b76]" />
        <p className="text-[#3d5244] font-medium">Finding the best local takeout options for you...</p>
      </div>
    );
  }

  if (!suggestions) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isGenerating} className="text-[#6b9b76] border-[#6b9b76] bg-white">
              {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />} Refresh Options
            </Button>
          )}
        </div>
        {viewMode === 'alternatives' && (
          <Button variant="outline" size="sm" onClick={() => setViewMode('dominant')} className="text-[#6b9b76] border-[#6b9b76] bg-white">
            View Top Pick
          </Button>
        )}
      </div>

      <div className="flex items-start gap-4 mb-8">
        <Sparkles className="w-8 h-8 text-[#A29BE3] shrink-0" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Here's what we found</h2>
          <p className="text-gray-500 font-medium">{suggestions.personalization_hook}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-6 w-full max-w-md mx-auto lg:max-w-none">
            {suggestions.dominant_recommendation && (
              <div className="glass-panel bg-white/40 backdrop-blur-xl ai-glow rounded-[2rem] overflow-hidden relative group shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60">
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <div className="bg-[#DFF5E6]/90 backdrop-blur-md text-[#3A6B4F] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-[#DFF5E6]">
                    <Sparkles className="w-3 h-3" /> TOP PICK <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
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

                  <div className="bg-emerald-50 text-emerald-800 text-sm font-bold p-3.5 rounded-xl flex items-center gap-3 border border-emerald-100">
                    <ShieldCheck className="w-5 h-5 shrink-0" /> 
                    <span className="leading-snug">{suggestions.dominant_recommendation.regret_reduction}</span>
                  </div>

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
                  <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 group cursor-pointer hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
                    <div className="w-12 h-12 rounded-full border border-gray-100 bg-white flex items-center justify-center text-[10px] font-bold text-center leading-tight shrink-0 shadow-sm text-gray-800 uppercase overflow-hidden">
                      {sug.restaurant_type.split(' ').map(w => w[0]).join('').substring(0, 4)}
                    </div>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                      <img src={getImage(sug.item_name)} alt={sug.item_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{sug.restaurant_type}</h4>
                      <p className="text-sm text-gray-600 truncate">{sug.item_name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-medium">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sug.speed_urgency}</div>
                        <div className="flex items-center gap-1">$ 12.00</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 0.6 mi</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-400 shrink-0 h-8 w-8">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button variant="ghost" className="w-full mt-2 text-gray-500 hover:text-gray-800 font-medium justify-between group">
                  See more options <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="mt-12 text-center pb-8">
                  <p className="text-lg font-serif italic text-gray-800 leading-relaxed max-w-[200px] mx-auto">
                    "You don't have to overthink it.<br/>
                    <span className="text-[#6b9b76]">We've got you.</span>"
                  </p>
                </div>
              </div>
            )}
        </div>
        
        <div className="space-y-4">
          <div className="relative z-[500]">
            <LocationAutocomplete 
               placeholder="Enter delivery address & press Enter"
               className="h-12 rounded-xl border border-gray-200 focus:border-[#6b9b76] focus:ring-1 focus:ring-[#6b9b76] focus:outline-none bg-white text-sm shadow-sm transition-all"
               onLocationSelect={(lat, lon, label) => {
                  setUserLoc([lat, lon]);
                  toast.success("Location updated!");
               }}
            />
          </div>

          {/* Map View */}
          <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-[#c5d9c9] shadow-sm relative z-0">
            <MapContainer center={userLoc} zoom={13} style={{ height: '400px', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false}>
              <MapUpdater center={userLoc} />
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
        </div>
      </div>
    </div>
  );
}