import { useState, useEffect, useCallback } from "react";
import {
  getSkillSuggestions,
  getAllSkills,
  getPopularSkills,
  getSkillsByCategory,
} from "../services/skillAPI";

export const useSkills = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch skill suggestions based on user input
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getSkillSuggestions(query);
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (err) {
      setError("Failed to fetch skill suggestions");
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch popular skills
  const fetchPopularSkills = useCallback(async (limit = 20, category = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPopularSkills(limit, category);
      if (response.success) {
        setPopularSkills(response.data);
      }
    } catch (err) {
      setError("Failed to fetch popular skills");
      console.error("Error fetching popular skills:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (query) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchSuggestions(query);
        }, 300); // 300ms debounce
      };
    })(),
    [fetchSuggestions]
  );

  return {
    suggestions,
    popularSkills,
    loading,
    error,
    fetchSuggestions,
    fetchPopularSkills,
    debouncedSearch,
  };
};
