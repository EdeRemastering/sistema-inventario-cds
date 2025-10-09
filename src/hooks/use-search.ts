"use client";

import { useState, useMemo, useCallback } from "react";

type UseSearchOptions<T> = {
  data: T[];
  searchFields: (keyof T)[];
  initialQuery?: string;
};

export function useSearch<T extends Record<string, unknown>>({
  data,
  searchFields,
  initialQuery = "",
}: UseSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === "number") {
          return value.toString().includes(query);
        }
        return false;
      });
    });
  }, [data, searchFields, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    filteredData,
    handleSearch,
    clearSearch,
    hasResults: filteredData.length > 0,
    hasData: data.length > 0,
  };
}
