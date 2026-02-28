import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, Mail, Calendar, Settings, LogOut, ChefHat, Edit2, Save, X, Phone, Languages, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import BillingPanel from './BillingPanel';

export default function AccountInfo({ user, onUpdatePreferences, recipeCount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    preferred_language: user?.preferred_language || 'en',
    advanced_dietary: user?.advanced_dietary || '',
    techniques_to_practice: user?.techniques_to_practice || '',
    extra_equipment: user?.extra_equipment || '',
    vitamin_targets: user?.vitamin_targets || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setIsEditing(false);
      toast.success('Account information updated successfully!');
    } catch (error) {
      toast.error('Failed to update account information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      preferred_language: user?.preferred_language || 'en',
      advanced_dietary: user?.advanced_dietary || '',
      techniques_to_practice: user?.techniques_to_practice || '',
      extra_equipment: user?.extra_equipment || '',
      vitamin_targets: user?.vitamin_targets || ''
    });
    setIsEditing(false);
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
            <div className="flex items-center justify-between gap-4">
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
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Edit2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Preferred Language
                  </label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                    className="w-full border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-md px-3 py-2 bg-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="ar">العربية</option>
                    <option value="he">עברית</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Specific Dietary Restrictions</label>
                  <Input
                    placeholder="e.g., Low FODMAP, Autoimmune Protocol"
                    value={formData.advanced_dietary}
                    onChange={(e) => setFormData({ ...formData, advanced_dietary: e.target.value })}
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Cooking Techniques to Practice</label>
                  <Input
                    placeholder="e.g., Knife skills, Braising, Fermentation"
                    value={formData.techniques_to_practice}
                    onChange={(e) => setFormData({ ...formData, techniques_to_practice: e.target.value })}
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Extra Kitchen Equipment</label>
                  <Input
                    placeholder="e.g., Sous Vide, Air Fryer, Dutch Oven"
                    value={formData.extra_equipment}
                    onChange={(e) => setFormData({ ...formData, extra_equipment: e.target.value })}
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Specific Nutritional Goals</label>
                  <Input
                    placeholder="e.g., High Iron, Vitamin D Focus, Low Sodium"
                    value={formData.vitamin_targets}
                    onChange={(e) => setFormData({ ...formData, vitamin_targets: e.target.value })}
                    className="border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-[#6b9b76] hover:bg-[#5a8a65]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {user?.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone_number}</span>
                    </div>
                  )}
                  {user?.preferred_language && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Languages className="w-4 h-4" />
                      <span>
                        {user.preferred_language === 'en' && 'English'}
                        {user.preferred_language === 'es' && 'Español'}
                        {user.preferred_language === 'fr' && 'Français'}
                        {user.preferred_language === 'de' && 'Deutsch'}
                        {user.preferred_language === 'it' && 'Italiano'}
                        {user.preferred_language === 'pt' && 'Português'}
                        {user.preferred_language === 'ja' && '日本語'}
                        {user.preferred_language === 'zh' && '中文'}
                        {user.preferred_language === 'ar' && 'العربية'}
                        {user.preferred_language === 'he' && 'עברית'}
                      </span>
                    </div>
                  )}
                  {user?.created_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
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
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings / Billing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-[#6b9b76] flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription & Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-[#f5f9f6] rounded-xl border border-[#e0ede4]">
              <div>
                <p className="font-semibold text-gray-800">
                  {user?.is_premium ? 'Premium Plan' : user?.role === 'admin' ? 'Admin Access (Premium)' : 'Free Plan'}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.is_premium ? 'Active subscription' : user?.role === 'admin' ? 'All features unlocked for testing' : 'Basic features only'}
                </p>
              </div>
              <Button 
                onClick={() => setIsBillingOpen(true)}
                variant="outline"
                className="border-2 border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2]"
              >
                Manage
              </Button>
            </div>
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

              {user.advanced_dietary && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Advanced Dietary Restrictions</div>
                  <Badge className="bg-red-50 text-red-700 border-0">
                    {user.advanced_dietary}
                  </Badge>
                </div>
              )}
              {user.cooking_skill && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Cooking Skill</div>
                  <Badge className="bg-[#f5e6dc] text-[#c17a7a] border-0">
                    {user.cooking_skill}
                  </Badge>
                </div>
              )}
              {user.techniques_to_practice && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Techniques to Practice</div>
                  <Badge className="bg-purple-50 text-purple-700 border-0">
                    {user.techniques_to_practice}
                  </Badge>
                </div>
              )}
              {user.vitamin_targets && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Nutritional Goals</div>
                  <Badge className="bg-blue-50 text-blue-700 border-0">
                    {user.vitamin_targets}
                  </Badge>
                </div>
              )}

              {(user.equipment?.length > 0 || user.extra_equipment) && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Available Equipment</div>
                  <div className="flex flex-wrap gap-2">
                    {user.equipment?.map((item, i) => (
                      <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700">
                        {item}
                      </Badge>
                    ))}
                    {user.extra_equipment && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {user.extra_equipment}
                      </Badge>
                    )}
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

      <BillingPanel 
        isOpen={isBillingOpen} 
        onClose={() => setIsBillingOpen(false)} 
        user={user} 
      />
    </div>
  );
}