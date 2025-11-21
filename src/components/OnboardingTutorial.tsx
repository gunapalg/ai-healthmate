import { useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useTutorial } from '@/contexts/TutorialContext';
import { useNavigate, useLocation } from 'react-router-dom';

const OnboardingTutorial = () => {
  const { showTutorial, completeTutorial, currentStep, setCurrentStep } = useTutorial();
  const navigate = useNavigate();
  const location = useLocation();

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-3">Welcome to AI Health Mentor! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            Let's take a quick tour to show you how our Autonomous Health Planner Agent can help you achieve your health goals.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="health-score"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Your Health Score</h3>
          <p className="text-sm">
            This shows your overall health performance. The agent monitors your daily progress and calculates a score based on your nutrition, activity, and hydration.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="quick-stats"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Daily Tracking</h3>
          <p className="text-sm">
            Track your calories, protein, water intake, and steps. The agent watches these metrics in real-time and provides suggestions when needed.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="ai-insights"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
          <p className="text-sm">
            Get personalized recommendations based on your current progress. The more you interact, the smarter these become!
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="health-agent-btn"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Your Health Planning Agent</h3>
          <p className="text-sm">
            This is where the magic happens! Chat with your AI health coach, get meal plans, set goals, and receive proactive health suggestions.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tutorial="log-meal-btn"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Log Your Meals</h3>
          <p className="text-sm">
            Simply upload a photo of your food, and AI will analyze the nutrition. The agent uses this data to give you better recommendations.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-3">You're All Set! 🚀</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Start logging your meals and interacting with the Health Agent. It will learn your preferences and provide increasingly personalized suggestions.
          </p>
          <p className="text-sm font-medium">
            Pro tip: Rate the agent's suggestions to help it learn what works best for you!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeTutorial();
    }

    if (action === 'next' || action === 'prev') {
      setCurrentStep(index);
    }
  };

  // Ensure we're on dashboard for tutorial
  useEffect(() => {
    if (showTutorial && location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  }, [showTutorial, location.pathname, navigate]);

  return (
    <Joyride
      steps={steps}
      run={showTutorial && location.pathname === '/dashboard'}
      continuous
      showProgress
      showSkipButton
      stepIndex={currentStep}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 6,
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: 10,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default OnboardingTutorial;
