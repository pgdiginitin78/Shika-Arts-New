import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, X, Loader2 } from "lucide-react";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Surat",
  "Pune",
  "Jaipur",
  "Jalgaon"
];

export function LocationModal({ isOpen, onOpenChange, onSelect }) {
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectedLocation, setDetectedLocation] = useState("");

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setPincode(value);
      if (value.length === 6) {
        fetchLocation(value);
      } else {
        setDetectedLocation("");
      }
    }
  };

  const fetchLocation = async (pin) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        const locationStr = `${postOffice.District}, ${postOffice.State}`;
        setDetectedLocation(locationStr);
        setCity(postOffice.District);
      } else {
        setError("Invalid pincode");
        setDetectedLocation("");
      }
    } catch (err) {
      setError("Failed to fetch location");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!city && !detectedLocation) {
      setError("Please select a city or enter a valid pincode");
      return;
    }
    const finalLocation = detectedLocation || city;
    onSelect({ city: finalLocation, pincode });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-none p-8 gap-6 border-none shadow-luxe bg-background">
        <DialogHeader className="relative flex-row items-center gap-6 space-y-0 text-left">
          <div className="flex h-14 w-14 items-center justify-center bg-primary shrink-0">
            <MapPin className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1 pr-8">
            <DialogTitle className="font-serif text-3xl leading-none text-foreground mb-2">
              Personalize Your Experience
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground uppercase tracking-wider">
              Find the perfect gifts for your loved ones
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-14 rounded-none border-border bg-white px-5 text-sm uppercase tracking-wider focus:ring-primary/20">
                <div className="flex items-center gap-3">
                  <SelectValue placeholder="Select your city" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c} className="rounded-none">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative group">
            <Input
              placeholder="Enter Pincode (e.g. 424101)"
              value={pincode}
              onChange={handlePincodeChange}
              className="h-14 rounded-none border-border bg-white px-5 pr-12 text-sm uppercase tracking-wider focus:ring-primary/20"
            />
            {loading ? (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : pincode.length === 6 && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                 <MapPin className="h-5 w-5" />
               </div>
            )}
          </div>

          {detectedLocation && (
            <div className="rounded-xl bg-secondary/30 px-4 py-3 text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {detectedLocation}
            </div>
          )}

          {error && (
            <div className="text-sm font-medium text-destructive px-1">
              {error}
            </div>
          )}
        </div>

        <Button
          onClick={handleContinue}
          className="h-14 w-full rounded-none bg-primary text-base uppercase tracking-ultra font-bold text-primary-foreground hover:bg-accent hover:text-primary transition-all duration-500"
        >
          Continue Shopping
        </Button>
      </DialogContent>
    </Dialog>
  );
}
