"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

interface MapPickerProps {
  defaultLat?: number;
  defaultLng?: number;
  onChange: (lat: number, lng: number, address?: string) => void;
}

export default function MapPicker({
  defaultLat = -6.3685,
  defaultLng = 106.8335,
  onChange,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [coords, setCoords] = useState({ lat: defaultLat, lng: defaultLng });
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Debounced search suggestion API call
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestion fetch error:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion: any) => {
    const { lat, lon, display_name } = suggestion;
    const newLat = parseFloat(parseFloat(lat).toFixed(6));
    const newLng = parseFloat(parseFloat(lon).toFixed(6));

    setCoords({ lat: newLat, lng: newLng });
    setSearchQuery(display_name);
    setSuggestions([]);
    setShowSuggestions(false);

    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapRef.current.setView([newLat, newLng], 16);
    }
    onChange(newLat, newLng, display_name);
  };

  // Helper for reverse geocoding (coordinates to address)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "";
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return "";
    }
  };

  useEffect(() => {
    // 1. Inject Leaflet CSS dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // 2. Inject Leaflet JS dynamically
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Initialize Map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: false,
      });

      // Add zoom control to bottom right for cleaner UI
      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

      // Tile Layer (OpenStreetMap CartoDB Voyager tiles - gorgeous and modern)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapRef.current);

      // Custom marker icon with glowing ping effect
      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-brand-600 opacity-75"></span>
            <div class="relative bg-brand-600 text-white rounded-full p-2 shadow-lg border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        className: "custom-leaflet-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Add Marker
      markerRef.current = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(mapRef.current);

      // Trigger change when marker is dragged
      markerRef.current.on("dragend", async () => {
        const position = markerRef.current.getLatLng();
        const lat = parseFloat(position.lat.toFixed(6));
        const lng = parseFloat(position.lng.toFixed(6));
        setCoords({ lat, lng });
        
        // Reverse geocode to auto-fill address
        const address = await reverseGeocode(lat, lng);
        onChange(lat, lng, address);
      });

      // Click on map to place marker
      mapRef.current.on("click", async (e: any) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        markerRef.current.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        
        // Reverse geocode to auto-fill address
        const address = await reverseGeocode(lat, lng);
        onChange(lat, lng, address);
      });
    }

    // Cleanup logic
    return () => {
      // We keep the map instance alive while mounted
    };
  }, [leafletLoaded]);

  // Update marker if props change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== defaultLat || currentPos.lng !== defaultLng) {
        markerRef.current.setLatLng([defaultLat, defaultLng]);
        mapRef.current.setView([defaultLat, defaultLng], 15);
        setCoords({ lat: defaultLat, lng: defaultLng });
      }
    }
  }, [defaultLat, defaultLng]);

  const triggerSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current || !markerRef.current) return;

    setIsSearching(true);
    try {
      // Nominatim search API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=3`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(parseFloat(lat).toFixed(6));
        const newLng = parseFloat(parseFloat(lon).toFixed(6));

        setCoords({ lat: newLat, lng: newLng });
        markerRef.current.setLatLng([newLat, newLng]);
        mapRef.current.setView([newLat, newLng], 16);
        onChange(newLat, newLng, display_name);
      } else {
        alert("Lokasi tidak ditemukan. Coba ketik nama daerah yang lebih umum.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            placeholder="Cari lokasi/daerah (Contoh: Condong Catur, Margonda...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay to allow clicking suggestion button
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="w-full border border-line rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-line">
              {suggestions.map((item) => (
                <button
                  key={item.place_id || item.osm_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-ink-700 hover:bg-surface-muted flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-ink-500 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {isSuggesting && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-3.5 h-3.5 text-ink-500 animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={triggerSearch}
          disabled={isSearching}
          className="bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5" />
              <span>Cari</span>
            </>
          )}
        </button>
      </div>

      {/* Map Element */}
      <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-line shadow-inner bg-surface-muted">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating coordinates badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-line rounded-xl px-3 py-1.5 text-[10px] font-mono text-ink-700 z-20 flex gap-3 shadow-md">
          <div>
            <span className="text-ink-500 font-semibold uppercase mr-1">LAT:</span>
            <span>{coords.lat}</span>
          </div>
          <div className="border-l border-line h-3.5 my-auto" />
          <div>
            <span className="text-ink-500 font-semibold uppercase mr-1">LNG:</span>
            <span>{coords.lng}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
