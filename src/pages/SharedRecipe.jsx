import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Home } from 'lucide-react';
import RecipeDisplay from '@/components/recipe/RecipeDisplay';
import { useAuth } from '@/lib/AuthContext';

export default function SharedRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await base44.entities.Recipe.get(id);
        setRecipe(data);
      } catch (e) {
        setError('Recipe not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b9b76]" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 px-4 text-center">
        <p className="text-gray-500">{error || 'Recipe not found'}</p>
        <Button onClick={() => navigate('/')} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-full">
          <Home className="w-4 h-4 mr-2" /> Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative z-[100] pb-24">
      <RecipeDisplay 
        recipe={recipe} 
        isSaved={isAuthenticated && recipe.created_by === base44.auth.me()?.email} 
        onBack={() => navigate('/')} 
      />
    </div>
  );
}