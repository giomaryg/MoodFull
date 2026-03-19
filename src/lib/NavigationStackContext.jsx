import React, { createContext, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationStackContext = createContext();

export function NavigationStackProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabStacks = location.state?.tabStacks || {
    home: [],
    saved: [],
    planner: [],
    inventory: [],
    analytics: [],
    account: []
  };

  const updateStacks = useCallback((newStacks) => {
    navigate(location.pathname + location.search, {
      state: { ...location.state, tabStacks: newStacks },
      replace: true
    });
  }, [navigate, location]);

  const pushToStack = useCallback((tab, state) => {
    updateStacks({
      ...tabStacks,
      [tab]: [...(tabStacks[tab] || []), state]
    });
  }, [tabStacks, updateStacks]);

  const popFromStack = useCallback((tab) => {
    const stack = tabStacks[tab] || [];
    if (stack.length === 0) return;
    updateStacks({
      ...tabStacks,
      [tab]: stack.slice(0, -1)
    });
  }, [tabStacks, updateStacks]);

  const getStack = useCallback((tab) => {
    return tabStacks[tab] || [];
  }, [tabStacks]);
  
  const clearStack = useCallback((tab) => {
    updateStacks({
      ...tabStacks,
      [tab]: []
    });
  }, [tabStacks, updateStacks]);

  const replaceTopStack = useCallback((tab, state) => {
    const stack = tabStacks[tab] || [];
    if (stack.length === 0) {
      updateStacks({ ...tabStacks, [tab]: [state] });
    } else {
      updateStacks({
        ...tabStacks,
        [tab]: [...stack.slice(0, -1), state]
      });
    }
  }, [tabStacks, updateStacks]);

  const peekStack = useCallback((tab) => {
    const stack = tabStacks[tab] || [];
    return stack.length > 0 ? stack[stack.length - 1] : null;
  }, [tabStacks]);

  return (
    <NavigationStackContext.Provider value={{ tabStacks, pushToStack, popFromStack, clearStack, replaceTopStack, peekStack, getStack }}>
      <div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] min-h-screen w-full">
        {children}
      </div>
    </NavigationStackContext.Provider>
  );
}

export function useNavigationStack() {
  return useContext(NavigationStackContext);
}