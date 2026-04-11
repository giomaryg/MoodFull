import { Sparkles, ArrowDownToLine } from 'lucide-react';

export const FEATURE_ANNOUNCEMENTS = [
  {
    id: 'feature_custom_mood_1',
    version: 1,
    title: 'Custom Mood Input',
    description: 'You can now type your own mood if it isn’t listed.',
    icon: Sparkles,
  },
  {
    id: 'feature_swipe_nav_2',
    version: 2,
    title: 'Swipe-Down Navigation',
    description: 'Quickly reveal navigation with a smooth swipe-down gesture.',
    icon: ArrowDownToLine,
  }
];

export const getLatestFeatures = (limit = 2) => {
  return [...FEATURE_ANNOUNCEMENTS]
    .sort((a, b) => b.version - a.version)
    .slice(0, limit);
};

export const getLatestVersion = () => {
  return Math.max(...FEATURE_ANNOUNCEMENTS.map(f => f.version), 0);
};