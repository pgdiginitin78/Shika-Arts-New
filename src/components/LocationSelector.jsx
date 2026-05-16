import React, { useState, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { LocationModal } from "./LocationModal";

export function LocationSelector() {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("shika_delivery_location");
    return saved ? JSON.parse(saved) : null;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (location) {
      localStorage.setItem("shika_delivery_location", JSON.stringify(location));
    }
  }, [location]);

  const handleSelectLocation = (data) => {
    setLocation(data);
  };

  return (
    <>
      <div 
        className="flex items-center gap-2 cursor-pointer group hover:bg-secondary/20 px-3 py-1.5 2xl:py-[14px] 2xl:px-[16px] transition-colors border border-border" 
        onClick={() => setIsModalOpen(true)}
      >
        <MapPin className="h-3.5 w-3.5 2xl:w-[20px] 2xl:h-[20px] text-accent" />

        <div className="flex flex-col leading-none">
          <span className="text-[10px] 2xl:text-[14px] uppercase tracking-wider font-bold text-foreground/60 whitespace-nowrap">
            Deliver to
          </span>
          <div className="flex items-center gap-1">
            <span className={`text-[11px] 2xl:text-[14px] font-semibold whitespace-nowrap ${location ? 'text-foreground' : 'text-[#ff6b6b]'}`}>
              {location ? location.city : "Select Location"}
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isModalOpen ? 'rotate-180' : ''} text-accent`} />
          </div>
        </div>
      </div>

      <LocationModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSelect={handleSelectLocation} 
      />
    </>
  );
}
