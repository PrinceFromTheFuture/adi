
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Dress } from "@/api/entities";
import { Member } from "@/api/entities";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/components/common/LanguageProvider";

import UserCard from "../components/search/UserCard";
import DressSearchCard from "../components/search/DressSearchCard";
import SearchFilters from "../components/search/SearchFilters";

export default function Search() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dresses");
  const [allMembers, setAllMembers] = useState([]);
  const [allDresses, setAllDresses] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [filteredDresses, setFilteredDresses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    size: "",
    category: "",
    priceRange: "",
    color: "",
    country: "",
    city: ""
  });

  const uniqueCountries = useMemo(() => {
    const countries = new Set();
    allMembers.forEach(m => m.country && countries.add(m.country));
    return Array.from(countries).sort();
  }, [allMembers]);
  
  const uniqueCities = useMemo(() => {
    if (!filters.country) return [];
    const cities = new Set();
    allMembers
        .filter(m => m.country === filters.country)
        .forEach(m => m.city && cities.add(m.city));
    return Array.from(cities).sort();
  }, [filters.country, allMembers]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [members, dresses] = await Promise.all([
        Member.list('-created_date', 200),
        Dress.filter({ is_available: true }, '-created_date', 200)
      ]);
      
      setAllMembers(members);
      setFilteredMembers(members);

      const ownerIds = [...new Set(dresses.map(d => d.owner_id))];
      if (ownerIds.length > 0) {
        const dressMembers = await Member.filter({ user_id: { $in: ownerIds } });
        const membersMap = new Map(dressMembers.map(m => [m.user_id, m]));
        const dressesWithOwners = dresses
          .map(dress => ({
            ...dress,
            owner: membersMap.get(dress.owner_id)
          }))
          .filter(dress => dress.owner);
        setAllDresses(dressesWithOwners);
        setFilteredDresses(dressesWithOwners);
      } else {
        setAllDresses([]);
        setFilteredDresses([]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    const handler = setTimeout(() => {
      // Filter members
      let tempMembers = allMembers.filter(member => 
        (member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         member.city?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!filters.country || member.country === filters.country) &&
        (!filters.city || member.city?.toLowerCase().includes(filters.city.toLowerCase()))
      );
      setFilteredMembers(tempMembers);

      // Filter dresses
      let tempDresses = allDresses.filter(dress => {
        const searchMatch = dress.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dress.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dress.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const sizeMatch = !filters.size || dress.size === filters.size;
        const categoryMatch = !filters.category || dress.category === filters.category;
        const colorMatch = !filters.color || dress.color?.toLowerCase().includes(filters.color.toLowerCase());
        const countryMatch = !filters.country || dress.owner?.country === filters.country; // Using owner country
        const cityMatch = !filters.city || dress.owner?.city?.toLowerCase().includes(filters.city.toLowerCase()); // Using owner city
        
        let priceMatch = true;
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split('-').map(Number);
          const price = dress.price_per_day;
          priceMatch = max ? (price >= min && price <= max) : (price >= min);
        }

        return searchMatch && sizeMatch && categoryMatch && colorMatch && countryMatch && cityMatch && priceMatch;
      });
      setFilteredDresses(tempDresses);
      setIsFiltering(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, filters, allMembers, allDresses]);
  
  const clearFilters = () => {
    setFilters({ size: "", category: "", priceRange: "", color: "", country: "", city: "" });
    setSearchQuery("");
  }

  const handleFilterChange = useCallback((newFilters) => {
    // When country changes, reset city
    if (newFilters.country !== filters.country) {
      newFilters.city = "";
    }
    setFilters(newFilters);
  }, [filters.country]);

  const PageLoader = () => (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-2xl" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
  
  const UsersLoader = () => (
     <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t("Search users, dresses, brands...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 pe-4 py-3 bg-gray-50 border-none rounded-2xl"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 rounded-2xl"
            >
              {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="dresses">{t('Dresses')}</TabsTrigger>
              <TabsTrigger value="users">{t('Users')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {showFilters && (
          <SearchFilters 
            filters={filters} 
            onFiltersChange={handleFilterChange} 
            countries={uniqueCountries}
            cities={uniqueCities}
            onClear={clearFilters}
          />
        )}
      </div>

      <div className="p-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dresses" className="mt-0">
            {isLoading || isFiltering ? <PageLoader /> : (
              <>
                {filteredDresses.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500">
                      {t("No dresses found matching your search")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredDresses.map((dress) => (
                      <DressSearchCard key={dress.id} dress={dress} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="users" className="mt-0">
            {isLoading || isFiltering ? <UsersLoader/> : (
               <>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {t("No users found matching your search")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMembers.map((member) => (
                      <UserCard key={member.id} user={member} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
