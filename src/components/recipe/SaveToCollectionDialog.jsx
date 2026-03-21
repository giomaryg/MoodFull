import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FolderPlus, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SaveToCollectionDialog({ recipe, onClose, onSaveComplete }) {
  const queryClient = useQueryClient();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState(recipe.collections || []);

  const { data: allRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const existingCollections = React.useMemo(() => {
    const collections = new Set();
    allRecipes.forEach(r => {
      if (r.collections && Array.isArray(r.collections)) {
        r.collections.forEach(c => collections.add(c));
      }
    });
    return Array.from(collections);
  }, [allRecipes]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (recipe.id) {
        return base44.entities.Recipe.update(recipe.id, { collections: selectedCollections });
      } else {
        const { imageUrl, imageUrls, imageLoading, _loading, ...rest } = recipe;
        const recipeData = { 
          ...rest, 
          collections: selectedCollections,
          image_url: rest.image_url || imageUrl || (imageUrls ? imageUrls[0] : null)
        };
        delete recipeData.id;
        return base44.entities.Recipe.create(recipeData);
      }
    },
    onSuccess: (savedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe saved to collections!');
      if (onSaveComplete) onSaveComplete(savedRecipe);
      onClose();
    }
  });

  const toggleCollection = (collection) => {
    setSelectedCollections(prev => 
      prev.includes(collection) ? prev.filter(c => c !== collection) : [...prev, collection]
    );
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim() && !selectedCollections.includes(newCollectionName.trim())) {
      setSelectedCollections(prev => [...prev, newCollectionName.trim()]);
      setNewCollectionName('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#3d5244] flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#6b9b76]" />
            Save to Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Select collections to save "{recipe.name}" to:</p>
          
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
            {existingCollections.map(collection => (
              <Badge 
                key={collection}
                onClick={() => toggleCollection(collection)}
                variant={selectedCollections.includes(collection) ? "default" : "outline"}
                className={`cursor-pointer text-sm px-3 py-1.5 transition-colors ${
                  selectedCollections.includes(collection) 
                    ? 'bg-[#6b9b76] hover:bg-[#5a8a65] text-white' 
                    : 'hover:border-[#6b9b76] hover:text-[#6b9b76]'
                }`}
              >
                {selectedCollections.includes(collection) && <Check className="w-3 h-3 mr-1" />}
                {collection}
              </Badge>
            ))}
            {selectedCollections.filter(c => !existingCollections.includes(c)).map(collection => (
              <Badge 
                key={collection}
                onClick={() => toggleCollection(collection)}
                className="cursor-pointer text-sm px-3 py-1.5 transition-colors bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                {collection}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Input 
              placeholder="New collection name..." 
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
            />
            <Button onClick={handleCreateCollection} variant="outline" className="shrink-0">
              Add
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white">
            Save Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}