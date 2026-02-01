import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Car, Check, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { vehicleBrands, VehicleBrand } from "@/data/vehicleDatabase";
import { swissCantons } from "@/data/swissCantons";

interface PlateSearchProps {
  plate: string;
  onPlateChange: (plate: string) => void;
  onVehicleFound: (brand: string, model: string, year: string) => void;
  className?: string;
}

interface VehicleSuggestion {
  brand: string;
  model: string;
  year: string;
  confidence: number;
}

// Swiss canton codes from license plates
const SWISS_CANTON_CODES = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
  "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
  "TI", "UR", "VD", "VS", "ZG", "ZH"
];

// Popular vehicle brands/models by region (simulation)
const popularVehiclesByRegion: Record<string, { brand: string; model: string }[]> = {
  // German-speaking cantons - German brands popular
  german: [
    { brand: "Volkswagen", model: "Golf" },
    { brand: "BMW", model: "Série 3" },
    { brand: "Mercedes-Benz", model: "Classe C" },
    { brand: "Audi", model: "A4" },
    { brand: "Škoda", model: "Octavia" },
  ],
  // French-speaking cantons - French brands popular
  french: [
    { brand: "Peugeot", model: "308" },
    { brand: "Renault", model: "Clio" },
    { brand: "Citroën", model: "C3" },
    { brand: "Volkswagen", model: "Golf" },
    { brand: "Audi", model: "A3" },
  ],
  // Italian-speaking canton
  italian: [
    { brand: "Fiat", model: "500" },
    { brand: "Alfa Romeo", model: "Giulia" },
    { brand: "Volkswagen", model: "Polo" },
    { brand: "Audi", model: "A1" },
    { brand: "BMW", model: "Série 1" },
  ],
};

// Map canton to language region
const cantonToRegion: Record<string, string> = {
  AG: "german", AI: "german", AR: "german", BE: "german", BL: "german", 
  BS: "german", GL: "german", GR: "german", LU: "german", NW: "german",
  OW: "german", SG: "german", SH: "german", SO: "german", SZ: "german",
  TG: "german", UR: "german", ZG: "german", ZH: "german",
  FR: "french", GE: "french", JU: "french", NE: "french", VD: "french", VS: "french",
  TI: "italian",
};

// Extract canton code from Swiss plate
const extractCantonFromPlate = (plate: string): string | null => {
  const cleanPlate = plate.toUpperCase().replace(/\s/g, "");
  
  for (const canton of SWISS_CANTON_CODES) {
    if (cleanPlate.startsWith(canton)) {
      return canton;
    }
  }
  return null;
};

// Validate Swiss plate format
const isValidSwissPlate = (plate: string): boolean => {
  const cleanPlate = plate.toUpperCase().replace(/\s/g, "");
  // Swiss plates: 2 letters (canton) + 1-6 digits
  const plateRegex = /^[A-Z]{2}\d{1,6}$/;
  return plateRegex.test(cleanPlate) && extractCantonFromPlate(cleanPlate) !== null;
};

// Generate vehicle suggestions based on canton
const generateSuggestions = (plate: string): VehicleSuggestion[] => {
  const canton = extractCantonFromPlate(plate);
  if (!canton) return [];
  
  const region = cantonToRegion[canton] || "german";
  const regionalPopular = popularVehiclesByRegion[region] || popularVehiclesByRegion.german;
  
  const currentYear = new Date().getFullYear();
  
  return regionalPopular.map((vehicle, index) => {
    // Generate random but plausible years (2018-2024)
    const randomYear = currentYear - Math.floor(Math.random() * 7);
    return {
      brand: vehicle.brand,
      model: vehicle.model,
      year: randomYear.toString(),
      confidence: 95 - index * 5, // Decreasing confidence
    };
  });
};

const PlateSearch = ({
  plate,
  onPlateChange,
  onVehicleFound,
  className,
}: PlateSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<VehicleSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!plate.trim()) {
      setError("Veuillez entrer une plaque d'immatriculation");
      return;
    }

    if (!isValidSwissPlate(plate)) {
      setError("Format de plaque invalide. Exemple: VD 123456");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuggestions([]);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const results = generateSuggestions(plate);
    
    if (results.length > 0) {
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setError("Aucun véhicule trouvé. Veuillez sélectionner manuellement.");
    }

    setIsSearching(false);
  };

  const handleSelectSuggestion = (suggestion: VehicleSuggestion) => {
    onVehicleFound(suggestion.brand, suggestion.model, suggestion.year);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const canton = extractCantonFromPlate(plate);
  const cantonInfo = canton ? swissCantons.find(c => c.code === canton) : null;

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={plate}
              onChange={(e) => {
                onPlateChange(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="VD 123456"
              className={cn(
                "h-14 text-lg font-mono tracking-wider pr-20",
                canton && "border-primary/50"
              )}
              disabled={isSearching}
            />
            {canton && cantonInfo && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                <Check className="h-3 w-3" />
                {cantonInfo.name}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSearching || !plate.trim()}
            className="h-14 px-6"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-popover border rounded-xl shadow-lg overflow-hidden">
            <div className="p-3 bg-muted/50 border-b">
              <p className="text-sm font-medium">Véhicules populaires pour {cantonInfo?.name || canton}</p>
              <p className="text-xs text-muted-foreground">Sélectionnez votre véhicule ou choisissez manuellement</p>
            </div>
            <div className="max-h-64 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.brand}-${suggestion.model}-${index}`}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between group transition-colors"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{suggestion.brand} {suggestion.model}</p>
                      <p className="text-sm text-muted-foreground">Année {suggestion.year}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Entrez votre plaque d'immatriculation pour identifier automatiquement votre véhicule
      </p>
    </div>
  );
};

export default PlateSearch;
