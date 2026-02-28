import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WeeklyGoalsDialog({ currentUser, isOpen, onClose, onUpdated }) {
  const [target, setTarget] = useState(currentUser?.daily_calorie_target || 2000);
  const [protein, setProtein] = useState(currentUser?.macro_protein_ratio || 30);
  const [carbs, setCarbs] = useState(currentUser?.macro_carbs_ratio || 40);
  const [fat, setFat] = useState(currentUser?.macro_fat_ratio || 30);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (protein + carbs + fat !== 100) {
      toast.error('Macronutrient ratios must add up to exactly 100%');
      return;
    }
    
    setLoading(true);
    try {
      await base44.auth.updateMe({
        daily_calorie_target: target,
        macro_protein_ratio: protein,
        macro_carbs_ratio: carbs,
        macro_fat_ratio: fat
      });
      toast.success('Dietary goals saved!');
      if (onUpdated) onUpdated();
      onClose();
    } catch (e) {
      toast.error('Failed to save goals.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#6b9b76] text-xl">Daily Dietary Goals</DialogTitle>
          <DialogDescription>
            Set your daily calorie target and preferred macronutrient breakdown for meal generation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Daily Calorie Target (kcal)</label>
            <Input type="number" value={target} onChange={(e) => setTarget(parseInt(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Protein Ratio (%)</label>
            <Input type="number" value={protein} onChange={(e) => setProtein(parseInt(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Carbs Ratio (%)</label>
            <Input type="number" value={carbs} onChange={(e) => setCarbs(parseInt(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fat Ratio (%)</label>
            <Input type="number" value={fat} onChange={(e) => setFat(parseInt(e.target.value) || 0)} className="mt-1" />
          </div>
          <div className={`text-xs pt-2 text-right font-medium ${protein + carbs + fat === 100 ? 'text-green-600' : 'text-red-500'}`}>
            Total: {protein + carbs + fat}% (Must be 100%)
          </div>
          <Button onClick={handleSave} disabled={loading || protein + carbs + fat !== 100} className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white mt-4">
            {loading ? 'Saving...' : 'Save Goals'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}