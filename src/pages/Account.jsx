import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, Edit, Mail, Phone, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PreferenceSurvey from '../components/survey/PreferenceSurvey';

export default function Account() {
  const [showSurvey, setShowSurvey] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleSurveyComplete = async (preferences) => {
    try {
      await base44.auth.updateMe(preferences);
      setShowSurvey(false);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Preferences updated!');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  if (showSurvey) {
    return (
      <div className="min-h-screen bg-[#e8f0ea] pb-20">
        <div className="bg-slate-50 mx-auto px-4 pt-6 pb-8 max-w-6xl">
          <PreferenceSurvey
            onComplete={handleSurveyComplete}
            initialData={currentUser || {}}
            currentUser={currentUser || {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f0ea] pb-20">
      <div className="bg-slate-50 mx-auto px-4 pt-6 pb-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#6b9b76] rounded-xl">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#6b9b76]">Account</h1>
        </div>

        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <Card className="border-[#c5d9c9] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#6b9b76]">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#6b9b76]" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{currentUser.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#6b9b76]" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                </div>
                {currentUser.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#6b9b76]" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{currentUser.phone_number}</p>
                    </div>
                  </div>
                )}
                {currentUser.birthday && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#6b9b76]" />
                    <div>
                      <p className="text-sm text-gray-500">Birthday</p>
                      <p className="font-medium">{new Date(currentUser.birthday).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences Card */}
            {currentUser.survey_completed && (
              <Card className="border-[#c5d9c9] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#6b9b76]">Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentUser.allergies && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Allergies</p>
                      <p className="font-medium">{currentUser.allergies}</p>
                    </div>
                  )}
                  {currentUser.diet_preferences && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Diet Preferences</p>
                      <p className="font-medium">{currentUser.diet_preferences}</p>
                    </div>
                  )}
                  {currentUser.priorities?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Priorities</p>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.priorities.map((priority) => (
                          <span
                            key={priority}
                            className="bg-[#e8f0ea] text-[#6b9b76] px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {priority}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentUser.preferred_cuisines?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Preferred Cuisines</p>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.preferred_cuisines.map((cuisine) => (
                          <span
                            key={cuisine}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowSurvey(true)}
                className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl py-6 text-base font-semibold shadow-md"
              >
                <Settings className="w-5 h-5 mr-2" />
                {currentUser.survey_completed ? 'Update Preferences' : 'Set Up Preferences'}
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-xl py-6 text-base font-semibold"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Log Out
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}