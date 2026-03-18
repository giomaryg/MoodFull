export const getOuraWellnessData = () => {
  // Simulate fetching Oura data based on the current day
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Create some varied data based on the day of the week to simulate real patterns
  const mockData = {
    0: { score: 85, readiness: 'high', sleep: 'good', activity: 'low', message: 'You had a restful weekend. Ready for a fresh start!' },
    1: { score: 72, readiness: 'medium', sleep: 'fair', activity: 'medium', message: 'Solid start to the week. Keep your energy steady.' },
    2: { score: 65, readiness: 'low', sleep: 'poor', activity: 'high', message: 'Your sleep was a bit restless. Focus on easy, energizing meals today.' },
    3: { score: 78, readiness: 'medium', sleep: 'good', activity: 'medium', message: 'You are recovering well. Maintain a balanced intake.' },
    4: { score: 60, readiness: 'low', sleep: 'poor', activity: 'low', message: 'Your readiness is low today. Consider comforting, low-effort meals and stay hydrated.' },
    5: { score: 88, readiness: 'high', sleep: 'excellent', activity: 'high', message: 'Great recovery! You are primed for an active day and protein-forward meals.' },
    6: { score: 80, readiness: 'high', sleep: 'good', activity: 'medium', message: 'Good balance of activity and rest. Enjoy your weekend!' }
  };

  return mockData[today] || mockData[1];
};

export const getOrderOutPattern = () => {
  const today = new Date().getDay();
  
  // Simulate pattern: User tends to order out on Thursdays (4) and Fridays (5)
  const isLikelyOrderOutDay = today === 4 || today === 5;
  
  if (!isLikelyOrderOutDay) return null;
  
  return {
    isLikelyOrderOutDay: true,
    reason: today === 4 ? 'You often order out on Thursdays.' : 'It\'s Friday! You usually treat yourself to takeout.',
    suggestedCategories: today === 4 ? ['Thai', 'Healthy Bowls', 'Soup'] : ['Pizza', 'Sushi', 'Burgers']
  };
};