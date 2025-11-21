import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from './ui/progress';

interface WalkthroughStep {
  title: string;
  description: string;
  image: string;
  tip?: string;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: 'Step 1: Log Your First Meal',
    description: 'Take a photo of your meal using the camera or upload from your gallery. Our AI will automatically analyze the nutrition.',
    image: '📸',
    tip: 'Make sure the food is well-lit and visible for best results!'
  },
  {
    title: 'Step 2: Review Nutrition Data',
    description: 'The AI extracts calories, protein, carbs, and fats. You can edit any values if needed.',
    image: '📊',
    tip: 'The more meals you log, the better the AI gets at recognizing your food!'
  },
  {
    title: 'Step 3: Check Your Dashboard',
    description: 'See your progress toward daily goals. The health score updates automatically based on your activities.',
    image: '📈',
    tip: 'Green progress bars mean you\'re on track!'
  },
  {
    title: 'Step 4: Chat with Health Agent',
    description: 'Ask questions, get meal suggestions, or create health goals. The agent remembers your preferences.',
    image: '🤖',
    tip: 'Try: "Help me reach my protein goal" or "Create a meal plan"'
  },
  {
    title: 'Step 5: Rate Suggestions',
    description: 'Give feedback on recommendations using the star rating. This teaches the agent what works for you.',
    image: '⭐',
    tip: '5 stars = loved it, 1 star = not helpful. The agent learns from your ratings!'
  },
  {
    title: 'Step 6: Track Your Progress',
    description: 'View weekly trends, celebrate achievements, and see your health score improve over time.',
    image: '🏆',
    tip: 'Consistency is key! Log daily for best results.'
  }
];

const AnimatedWalkthrough = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % walkthroughSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + walkthroughSteps.length) % walkthroughSteps.length);
  };

  const resetWalkthrough = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-advance when playing
  useState(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        nextStep();
      }, 4000);
      return () => clearInterval(interval);
    }
  });

  const step = walkthroughSteps[currentStep];
  const progress = ((currentStep + 1) / walkthroughSteps.length) * 100;

  return (
    <Card className="shadow-health-md border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Interactive Walkthrough
          </CardTitle>
          <Badge variant="secondary">
            {currentStep + 1} / {walkthroughSteps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Animation Area */}
        <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8 min-h-[280px] flex flex-col items-center justify-center">
          <div className="text-8xl mb-4 animate-bounce-slow">
            {step.image}
          </div>
          <h3 className="text-xl font-bold text-center mb-2">
            {step.title}
          </h3>
          <p className="text-center text-muted-foreground mb-4 max-w-md">
            {step.description}
          </p>
          {step.tip && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-md">
              <p className="text-sm text-foreground">
                <span className="font-semibold">💡 Pro Tip:</span> {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={resetWalkthrough}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextStep}
            disabled={currentStep === walkthroughSteps.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
          {walkthroughSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimatedWalkthrough;
