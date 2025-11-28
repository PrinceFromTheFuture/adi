
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/components/common/LanguageProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchFilters({ filters, onFiltersChange, countries, cities, onClear }) {
  const { t } = useTranslation();

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value
    });
  };
  
  return (
    <div className="p-4 border-t border-rose-100 bg-white/50">
      <div className="grid grid-cols-2 gap-3">
        {/* Country Filter */}
        <Select value={filters.country || "all"} onValueChange={(value) => updateFilter("country", value)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('Country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Countries')}</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City Filter */}
        <Select 
          value={filters.city || "all"} 
          onValueChange={(value) => updateFilter("city", value)}
          disabled={!filters.country || cities.length === 0}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('City')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Cities')}</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.size || "all"} onValueChange={(value) => updateFilter("size", value)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('Size')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Sizes')}</SelectItem>
            <SelectItem value="XS">XS</SelectItem>
            <SelectItem value="S">S</SelectItem>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="XL">XL</SelectItem>
            <SelectItem value="XXL">XXL</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category || "all"} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('Category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Categories')}</SelectItem>
            <SelectItem value="evening">{t('Evening')}</SelectItem>
            <SelectItem value="cocktail">{t('Cocktail')}</SelectItem>
            <SelectItem value="casual">{t('Casual')}</SelectItem>
            <SelectItem value="formal">{t('Formal')}</SelectItem>
            <SelectItem value="wedding_guest">{t('Wedding Guest')}</SelectItem>
            <SelectItem value="party">{t('Party')}</SelectItem>
            <SelectItem value="work">{t('Work')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priceRange || "all"} onValueChange={(value) => updateFilter("priceRange", value)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('Price')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Prices')}</SelectItem>
            <SelectItem value="0-100">₪0 - ₪100</SelectItem>
            <SelectItem value="100-200">₪100 - ₪200</SelectItem>
            <SelectItem value="200-500">₪200 - ₪500</SelectItem>
            <SelectItem value="500">₪500+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.color || "all"} onValueChange={(value) => updateFilter("color", value)}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('Color')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Colors')}</SelectItem>
            <SelectItem value="black">Black</SelectItem>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="pink">Pink</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3">
        <Button onClick={onClear} variant="link" className="text-rose-600 p-0 h-auto">{t('Clear Filters')}</Button>
      </div>
    </div>
  );
}
