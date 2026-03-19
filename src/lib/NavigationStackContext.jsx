import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationStackContext = createContext();

export function NavigationStackProvider({ children }) {
  const [tabStacks, setTabStacks] = useState({
    home: [],
    saved: [],
    planner: [],
    inventory: [],
    analytics: [],
    account: []
  });

  const [direction, setDirection] = useState('forward');
  const scrollPositions = React.useRef({});
  const navigate = useNavigate();
  const location = useLocation();

  const saveScrollPosition = useCallback((tab, position) => {
    scrollPositions.current[tab] = position;
  }, []);

  const getScrollPosition = useCallback((tab) => {
    return scrollPositions.current[tab] || 0;
  }, []);

  const pushToStack = useCallback((tab, state) => {
    setDirection('forward');
    setTabStacks(prev => ({
      ...prev,
      [tab]: [...(prev[tab] || []), state]
    }));
    window.history.pushState({ isApp: true }, '');
  }, []);

  const popFromStack = useCallback((tab) => {
    setDirection('backward');
    setTabStacks(prev => {
      const stack = prev[tab] || [];
      if (stack.length === 0) return prev;
      return {
        ...prev,
        [tab]: stack.slice(0, -1)
      };
    });
  }, []);

  const getStack = useCallback((tab) => {
    return tabStacks[tab] || [];
  }, [tabStacks]);
  
  const clearStack = useCallback((tab) => {
    setDirection('backward');
    setTabStacks(prev => ({
      ...prev,
      [tab]: []
    }));
  }, []);

  const replaceTopStack = useCallback((tab, state) => {
    setTabStacks(prev => {
      const stack = prev[tab] || [];
      if (stack.length === 0) {
        return { ...prev, [tab]: [state] };
      } else {
        return {
          ...prev,
          [tab]: [...stack.slice(0, -1), state]
        };
      }
    });
  }, []);

  const peekStack = useCallback((tab) => {
    const stack = tabStacks[tab] || [];
    return stack.length > 0 ? stack[stack.length - 1] : null;
  }, [tabStacks]);

  useEffect(() => {
    // Push initial state to trap back button
    window.history.pushState({ isApp: true }, '');

    const handlePopState = (event) => {
      setDirection('backward');
      
      const params = new URLSearchParams(window.location.search);
      const currentTab = params.get('tab') || 'home';
      
      setTabStacks(prev => {
        const stack = prev[currentTab] || [];
        if (stack.length > 0) {
          // Trap the back button again
          window.history.pushState({ isApp: true }, '');
          return {
            ...prev,
            [currentTab]: stack.slice(0, -1)
          };
        } else {
          // No stack, let it go back
          setTimeout(() => {
             window.history.back();
          }, 0);
          return prev;
        }
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const globalNavigate = useCallback((to, options) => {
    setDirection('forward');
    navigate(to, options);
  }, [navigate]);

  const globalGoBack = useCallback(() => {
    setDirection('backward');
    navigate(-1);
  }, [navigate]);

  const contextValue = React.useMemo(() => ({
    tabStacks,
    direction,
    setDirection,
    pushToStack,
    popFromStack,
    clearStack,
    replaceTopStack,
    peekStack,
    getStack,
    saveScrollPosition,
    getScrollPosition,
    globalNavigate,
    globalGoBack
  }), [tabStacks, direction, pushToStack, popFromStack, clearStack, replaceTopStack, peekStack, getStack, saveScrollPosition, getScrollPosition, globalNavigate, globalGoBack]);

  return (
    <NavigationStackContext.Provider value={contextValue}>
      <div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] min-h-screen w-full bg-background text-foreground transition-colors overflow-x-hidden">
        {children}
      </div>
    </NavigationStackContext.Provider>
  );
}

export function useNavigationStack() {
  return useContext(NavigationStackContext);
}