import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, Car } from "lucide-react";
import {
  vehicleBrands,
  searchBrands,
  getModelNamesForBrand,
  getYearsForModel,
} from "@/data/vehicleDatabase";

interface VehicleSelectorProps {
  brand: string;
  model: string;
  year: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onYearChange: (year: string) => void;
  className?: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  emptyMessage?: string;
}

const Combobox = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  icon,
  emptyMessage = "Aucun résultat",
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync search with value when not open
  useEffect(() => {
    if (!open) {
      setSearch(value);
    }
  }, [value, open]);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearch(option);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!open) setOpen(true);
    
    // Auto-select if exact match
    const exactMatch = options.find(
      (opt) => opt.toLowerCase() === e.target.value.toLowerCase()
    );
    if (exactMatch) {
      onChange(exactMatch);
    } else {
      onChange(e.target.value);
    }
  };

  const handleFocus = () => {
    setOpen(true);
    setSearch("");
  };

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          className={cn(
            "h-14 text-lg pr-10",
            icon && "pl-10"
          )}
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.slice(0, 50).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between",
                  value.toLowerCase() === option.toLowerCase() && "bg-muted"
                )}
                onClick={() => handleSelect(option)}
              >
                <span>{option}</span>
                {value.toLowerCase() === option.toLowerCase() && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const VehicleSelector = ({
  brand,
  model,
  year,
  onBrandChange,
  onModelChange,
  onYearChange,
  className,
}: VehicleSelectorProps) => {
  // Get available options based on selections
  const brandNames = vehicleBrands.map((b) => b.name);
  const modelNames = brand ? getModelNamesForBrand(brand) : [];
  const availableYears = brand && model ? getYearsForModel(brand, model) : [];
  const yearStrings = availableYears.map((y) => y.toString()).reverse();

  // Reset model when brand changes
  const handleBrandChange = (newBrand: string) => {
    onBrandChange(newBrand);
    if (brand !== newBrand) {
      onModelChange("");
      onYearChange("");
    }
  };

  // Reset year when model changes
  const handleModelChange = (newModel: string) => {
    onModelChange(newModel);
    if (model !== newModel) {
      onYearChange("");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Brand Selection */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Marque du véhicule
        </label>
        <Combobox
          value={brand}
          onChange={handleBrandChange}
          options={brandNames}
          placeholder="Rechercher une marque..."
          icon={<Car className="h-4 w-4" />}
          emptyMessage="Marque non trouvée"
        />
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Modèle
        </label>
        <Combobox
          value={model}
          onChange={handleModelChange}
          options={modelNames}
          placeholder={brand ? "Rechercher un modèle..." : "Sélectionnez d'abord une marque"}
          disabled={!brand}
          icon={<Search className="h-4 w-4" />}
          emptyMessage="Modèle non trouvé"
        />
      </div>

      {/* Year Selection */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Année de mise en circulation
        </label>
        <Combobox
          value={year}
          onChange={onYearChange}
          options={yearStrings.length > 0 ? yearStrings : Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString())}
          placeholder={model ? "Sélectionner l'année..." : "Sélectionnez d'abord un modèle"}
          disabled={!model && !!brand}
          emptyMessage="Année non disponible"
        />
      </div>
    </div>
  );
};

export default VehicleSelector;
