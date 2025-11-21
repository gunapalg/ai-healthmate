import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TutorialContextType {
  showTutorial: boolean;
  startTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkTutorialStatus();
  }, [user]);

  const checkTutorialStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      // Check if user is new (created within last 24 hours)
      if (profile) {
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        // Check if tutorial was already completed
        const tutorialCompleted = localStorage.getItem(`tutorial_completed_${user.id}`);

        if (hoursSinceCreation < 24 && !tutorialCompleted) {
          setShowTutorial(true);
        }
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setCurrentStep(0);
  };

  const completeTutorial = () => {
    if (user) {
      localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
    }
    setShowTutorial(false);
    setCurrentStep(0);
  };

  const resetTutorial = () => {
    if (user) {
      localStorage.removeItem(`tutorial_completed_${user.id}`);
    }
    setShowTutorial(false);
    setCurrentStep(0);
  };

  return (
    <TutorialContext.Provider
      value={{
        showTutorial,
        startTutorial,
        completeTutorial,
        resetTutorial,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
