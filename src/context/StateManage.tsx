import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our context state
interface StateContextProps {
  // Timer related states
  activeTimer: boolean;
  timerDuration: number;
  timerModalOpen: boolean;
  timerExpired: boolean;
  
  // Timer related functions
  setActiveTimer: (active: boolean) => void;
  setTimerDuration: (duration: number) => void;
  openTimerModal: () => void;
  closeTimerModal: () => void;
  startTimer: (duration: number) => void;
  resetTimer: () => void;
  markTimerExpired: () => void;
}

// Create the context with a default value
const StateContext = createContext<StateContextProps | undefined>(undefined);

// Provider component
export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Timer state
  const [activeTimer, setActiveTimer] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [timerModalOpen, setTimerModalOpen] = useState<boolean>(false);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);
  
  // Timer functions
  const openTimerModal = () => {
    setTimerModalOpen(true);
  };
  
  const closeTimerModal = () => {
    setTimerModalOpen(false);
  };
  
  const startTimer = (duration: number) => {
    setTimerDuration(duration);
    setActiveTimer(true);
    setTimerExpired(false);
    closeTimerModal();
  };
  
  const resetTimer = () => {
    setActiveTimer(false);
    setTimerDuration(0);
    setTimerExpired(false);
  };
  
  const markTimerExpired = () => {
    setTimerExpired(true);
    setActiveTimer(false);
  };
  
  // Create the context value object
  const contextValue: StateContextProps = {
    activeTimer,
    timerDuration,
    timerModalOpen,
    timerExpired,
    setActiveTimer,
    setTimerDuration,
    openTimerModal,
    closeTimerModal,
    startTimer,
    resetTimer,
    markTimerExpired
  };
  
  // Provide the context to children components
  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

// Custom hook to use the context
export const useStateContext = (): StateContextProps => {
  const context = useContext(StateContext);
  
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  
  return context;
};

export default StateContext;