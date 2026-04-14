import { useCallback } from 'react';

export function useRecipeCache() {
  const getCacheKey = (type, params) => {
    return `moodfull_recipes_cache_${type}_${JSON.stringify(params)}`;
  };

  const getCachedRecipes = useCallback((type, params) => {
    try {
      const key = getCacheKey(type, params);
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to parse cache', e);
    }
    return null;
  }, []);

  const setCachedRecipes = useCallback((type, params, recipes) => {
    try {
      // Only cache if they are fully loaded (no skeletons)
      if (!recipes.some(r => r._loading || r.imageLoading)) {
        const key = getCacheKey(type, params);
        localStorage.setItem(key, JSON.stringify(recipes));
      }
    } catch (e) {
      console.error('Failed to set cache', e);
    }
  }, []);

  return { getCachedRecipes, setCachedRecipes };
}