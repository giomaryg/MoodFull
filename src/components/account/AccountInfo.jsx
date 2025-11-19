import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Settings, LogOut, ChefHat } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AccountInfo({ user, onUpdatePreferences, recipeCount }) {
  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#6b9b76] to-[#5a8a65] text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.full_name || 'User'}</CardTitle>
                <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user?.email}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f5e6dc] rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#6b9b76]">{recipeCount || 0}</div>
                <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  Saved Recipes
                </div>
              </div>
              
              <div className="bg-[#e8f0ea] rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#6b9b76]">
                  {user?.role === 'admin' ? '👑' : '🌟'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </div>
              </div>
            </div>

            {user?.created_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences Card */}
      {user?.survey_completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-[#6b9b76] flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Your Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.diet_preferences && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Dietary Preferences</div>
                  <Badge className="bg-[#e8f0ea] text-[#6b9b76] border-0">
                    {user.diet_preferences}
                  </Badge>
                </div>
              )}
              
              {user.allergies && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Allergies</div>
                  <Badge className="bg-red-50 text-red-700 border-0">
                    {user.allergies}
                  </Badge>
                </div>
              )}

              {user.blood_sugar_friendly && (
                <div>
                  <Badge className="bg-blue-50 text-blue-700 border-0">
                    Blood Sugar Friendly
                  </Badge>
                </div>
              )}
              
              {user.preferred_cuisines && user.preferred_cuisines.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Preferred Cuisines</div>
                  <div className="flex flex-wrap gap-2">
                    {user.preferred_cuisines.map((cuisine, i) => (
                      <Badge key={i} variant="outline" className="border-[#c5d9c9]">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={onUpdatePreferences}
                variant="outline"
                className="w-full mt-4 border-2 border-[#6b9b76] hover:bg-[#f5e8e8] text-[#6b9b76]"
              >
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-2 border-red-300 hover:bg-red-50 text-red-600 rounded-xl py-6"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </motion.div>
    </div>
  );
}