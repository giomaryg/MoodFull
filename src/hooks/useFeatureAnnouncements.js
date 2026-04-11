import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getLatestFeatures, getLatestVersion } from '@/lib/featureAnnouncements';

export function useFeatureAnnouncements() {
  const queryClient = useQueryClient();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [featuresToShow, setFeaturesToShow] = useState([]);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity
  });

  useEffect(() => {
    if (user && !isLoading) {
      // Don't show to users who are still completing their initial onboarding
      if (!user.survey_completed) return;
      
      const localFallback = parseInt(localStorage.getItem('moodfull_last_seen_features_version') || '0', 10);
      const userSeenVersion = Math.max(user.last_seen_features_version || 0, localFallback);
      const latestVersion = getLatestVersion();

      if (latestVersion > userSeenVersion) {
        // Find features newer than what user has seen, up to the maximum available
        const allNewFeatures = getLatestFeatures(10).filter(f => f.version > userSeenVersion);
        
        if (allNewFeatures.length > 0) {
          // Only show the 2 most recent features
          setFeaturesToShow(allNewFeatures.slice(0, 2));
          setShowAnnouncements(true);
        }
      }
    }
  }, [user, isLoading]);

  const acknowledgeMutation = useMutation({
    mutationFn: async (version) => {
      // Save locally as a robust fallback for cross-device or schema-strictness issues
      localStorage.setItem('moodfull_last_seen_features_version', version.toString());
      return await base44.auth.updateMe({ last_seen_features_version: version });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setShowAnnouncements(false);
    }
  });

  const acknowledgeFeatures = () => {
    const latestVersion = getLatestVersion();
    acknowledgeMutation.mutate(latestVersion);
  };

  return {
    showAnnouncements,
    featuresToShow,
    acknowledgeFeatures,
    isAcknowledging: acknowledgeMutation.isPending
  };
}