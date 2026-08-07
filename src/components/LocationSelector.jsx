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
        className="flex items-center gap-2 cursor-pointer group hover:bg-secondary/20 w-full sm:w-auto min-w-0 sm:min-w-[200px] md:min-w-[240px] 2xl:min-w-[280px] px-3 py-2 sm:px-4 sm:py-[7px] 2xl:py-[10px] 2xl:px-[16px] transition-colors rounded border border-border"
        onClick={() => setIsModalOpen(true)}
      >
        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 2xl:w-[20px] 2xl:h-[20px] text-destructive shrink-0" />

        <div className="flex flex-col leading-none min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] 2xl:text-[14px] uppercase tracking-wider font-bold text-foreground/60 whitespace-nowrap">
            Deliver to
          </span>
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={`text-[12px] sm:text-[13px] 2xl:text-[14px] font-semibold truncate ${location ? "text-foreground" : "text-[#ff6b6b]"}`}
            >
              {location ? location.city : "Select Location"}
            </span>
            <ChevronDown
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 transition-transform ${isModalOpen ? "rotate-180" : ""} text-destructive`}
            />
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
