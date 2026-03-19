import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const pushToStack = useCallback((tab, state) => {
    setTabStacks(prev => ({
      ...prev,
      [tab]: [...(prev[tab] || []), state]
    }));
  }, []);

  const popFromStack = useCallback((tab) => {
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

  const contextValue = React.useMemo(() => ({
    tabStacks,
    pushToStack,
    popFromStack,
    clearStack,
    replaceTopStack,
    peekStack,
    getStack
  }), [tabStacks, pushToStack, popFromStack, clearStack, replaceTopStack, peekStack, getStack]);

  return (
    <NavigationStackContext.Provider value={contextValue}>
      <div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] min-h-screen w-full bg-background text-foreground transition-colors">
        {children}
      </div>
    </NavigationStackContext.Provider>
  );
}

export function useNavigationStack() {
  return useContext(NavigationStackContext);
}