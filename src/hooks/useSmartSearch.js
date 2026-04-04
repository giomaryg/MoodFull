import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { debounce } from 'lodash';

export function useSmartSearch(recipes) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [smartResults, setSmartResults] = useState(null); // null means inactive, [] means no results
  const [searchIntent, setSearchIntent] = useState(null);

  const performSearch = useCallback(async (searchQuery, availableRecipes) => {
    if (!searchQuery.trim() || availableRecipes.length === 0) {
      setSmartResults(null);
      setSearchIntent(null);
      return;
    }

    setIsSearching(true);
    try {
      // Basic text filter first to see if we have exact matches
      const lowerQuery = searchQuery.toLowerCase();
      const exactMatches = availableRecipes.filter(r => 
        r.name?.toLowerCase().includes(lowerQuery) || 
        r.description?.toLowerCase().includes(lowerQuery)
      );

      // Prepare context for LLM (limit to 60 recipes to avoid token limits)
      const recipeContext = availableRecipes.slice(0, 60).map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        mood: r.mood,
        cuisine: r.cuisine_type,
        difficulty: r.difficulty
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        model: 'gemini_3_flash',
        prompt: `The user is searching for recipes using this query: "${searchQuery}".
        Here is the list of available recipes: ${JSON.stringify(recipeContext)}.
        
        1. Analyze the user's intent (e.g., "healthy dinner", "quick snack", "chicken dishes").
        2. Find the top matching recipes from the list based on semantic similarity, dietary needs, mood, ingredients, or exact matches.
        3. Score them from 0 to 100. Return recipes with a score > 30.
        4. For each match, provide a very short, punchy 'reason' why it fits (e.g. "Matches your 'cozy' preference", "Quick & easy", "Similar to salmon").
        
        If there are no strong matches, find the closest reasonable alternatives. Never return an empty list if there's anything remotely relevant.`,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string", description: "Brief summary of what the user is looking for" },
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response && response.matches) {
        setSearchIntent(response.intent);
        
        // Merge exact matches that the AI might have missed
        const aiMatches = response.matches;
        const matchedIds = new Set(aiMatches.map(m => m.id));
        
        exactMatches.forEach(em => {
          if (!matchedIds.has(em.id)) {
            aiMatches.push({ id: em.id, score: 80, reason: "Exact text match" });
          }
        });

        setSmartResults(aiMatches.sort((a, b) => b.score - a.score));
      } else {
        setSmartResults(exactMatches.map(m => ({ id: m.id, score: 100, reason: "Exact match" })));
      }
    } catch (error) {
      console.error("Smart search failed:", error);
      // Fallback to basic search
      const lowerQuery = searchQuery.toLowerCase();
      const basicMatches = availableRecipes.filter(r => 
        r.name?.toLowerCase().includes(lowerQuery) || 
        r.description?.toLowerCase().includes(lowerQuery) ||
        r.ingredients?.some(i => i.toLowerCase().includes(lowerQuery))
      );
      setSmartResults(basicMatches.map(m => ({ id: m.id, score: 100, reason: "Text match" })));
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Use a ref to store the latest debounce function so we can cancel it
  const debouncedSearchRef = useRef(
    debounce((q, recs) => performSearch(q, recs), 800)
  );

  useEffect(() => {
    // Update the ref if performSearch changes (though it's wrapped in useCallback)
    debouncedSearchRef.current = debounce((q, recs) => performSearch(q, recs), 800);
  }, [performSearch]);

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      debouncedSearchRef.current(query, recipes);
    } else {
      setSmartResults(null);
      setSearchIntent(null);
      setIsSearching(false);
    }
    
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, [query, recipes]);

  return {
    query,
    setQuery,
    isSearching,
    smartResults,
    searchIntent
  };
}