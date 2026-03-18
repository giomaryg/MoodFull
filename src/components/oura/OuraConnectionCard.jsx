import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Activity, CheckCircle2, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function OuraConnectionCard({ user }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isConnected = user?.oura_connected || false;
  const hasConsent = user?.oura_data_consent || false;

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate OAuth flow delay
    setTimeout(async () => {
      try {
        await base44.auth.updateMe({
          oura_connected: true,
          oura_data_consent: true
        });
        toast.success('Successfully connected to Oura Ring!');
      } catch (error) {
        toast.error('Failed to connect to Oura Ring.');
      } finally {
        setIsConnecting(false);
      }
    }, 1500);
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await base44.auth.updateMe({
        oura_connected: false,
        oura_data_consent: false
      });
      toast.success('Oura Ring disconnected.');
    } catch (error) {
      toast.error('Failed to disconnect.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const toggleConsent = async (checked) => {
    try {
      await base44.auth.updateMe({
        oura_data_consent: checked
      });
      if (checked) {
        toast.success('Wellness data will now be used for recommendations.');
      } else {
        toast.success('Wellness data recommendations paused.');
      }
    } catch (error) {
      toast.error('Failed to update preferences.');
    }
  };

  return (
    <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Oura Ring Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your Oura Ring to receive personalized food and hydration recommendations based on your sleep, readiness, and activity levels.
            </p>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <strong>Privacy First:</strong> Your wellness data is only used to suggest meals and is never shared. You can disconnect at any time.
              </p>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
            >
              {isConnecting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting securely...</>
              ) : (
                <><LinkIcon className="w-4 h-4 mr-2" /> Connect Oura Account</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800 text-sm">Oura Ring Connected</p>
                <p className="text-xs text-green-700">Syncing daily wellness data</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-800">Use Data for Recommendations</p>
                <p className="text-xs text-gray-500">Allow MoodFull to suggest meals based on your readiness and sleep.</p>
              </div>
              <Switch 
                checked={hasConsent} 
                onCheckedChange={toggleConsent}
              />
            </div>

            <Button 
              onClick={handleDisconnect} 
              disabled={isDisconnecting}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect Oura Ring'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}