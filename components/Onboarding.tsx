import React, { useState, useEffect, useRef } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  targets: string[];
  position: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, targets, position }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const targetElements = targets.map(target => document.querySelector(target));
    if (targetElements.every(el => el) && tooltipRef.current) {
      const targetRects = targetElements.map(el => el!.getBoundingClientRect());
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Calculate the bounding box that encompasses all targets
      const left = Math.min(...targetRects.map(rect => rect.left));
      const top = Math.min(...targetRects.map(rect => rect.top));
      const right = Math.max(...targetRects.map(rect => rect.right));
      const bottom = Math.max(...targetRects.map(rect => rect.bottom));
      const width = right - left;
      const height = bottom - top;

      let tooltipLeft, tooltipTop;

      switch (position) {
        case 'top':
          tooltipLeft = left + (width - tooltipRect.width) / 2;
          tooltipTop = top - tooltipRect.height - 10;
          break;
        case 'bottom':
          tooltipLeft = left + (width - tooltipRect.width) / 2;
          tooltipTop = bottom + 10;
          break;
        case 'left':
          tooltipLeft = left - tooltipRect.width - 10;
          tooltipTop = top + (height - tooltipRect.height) / 2;
          break;
        case 'right':
          tooltipLeft = right + 10;
          tooltipTop = top + (height - tooltipRect.height) / 2;
          break;
      }

      tooltipRef.current.style.left = `${tooltipLeft}px`;
      tooltipRef.current.style.top = `${tooltipTop}px`;

      // Position and size the highlight elements
      targetElements.forEach((el, index) => {
        if (el && highlightRefs.current[index]) {
          const rect = el.getBoundingClientRect();
          highlightRefs.current[index].style.left = `${rect.left - 5}px`;
          highlightRefs.current[index].style.top = `${rect.top - 5}px`;
          highlightRefs.current[index].style.width = `${rect.width + 10}px`;
          highlightRefs.current[index].style.height = `${rect.height + 10}px`;
        }
      });
    }
  }, [targets, position]);

  return (
    <>
      {targets.map((_, index) => (
        <div
          key={index}
          ref={el => {
            if (el) highlightRefs.current[index] = el;
          }}
          className="fixed z-40 border-4 border-blue-500 rounded-lg animate-pulse"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease-in-out',
          }}
        />
      ))}
      <div ref={tooltipRef} className="fixed z-50 p-4 bg-white text-black rounded shadow-lg max-w-xs">
        {content}
      </div>
    </>
  );
};

interface OnboardingStep {
  targets: string[];
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    targets: ['#editor'],
    content: 'Start by defining your DAG in DAGML format. It\'s similar to YAML and allows you to specify tasks, dependencies, and DAG properties.',
    position: 'right',
  },
  {
    targets: ['#graph', '.react-flow'],
    content: 'As you define your DAG, the graph visualization will automatically update. Tasks and their relationships will be displayed here in real-time.',
    position: 'left',
  },
  {
    targets: ['#code-tab'],
    content: 'Switch to this tab to see the automatically generated Python code for your DAG. This code is ready to use in Apache Airflow.',
    position: 'bottom',
  },
  {
    targets: ['#repl-output'],
    content: 'The REPL output provides helpful information for tracing and checking errors in your DAG definition.',
    position: 'top',
  },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setIsVisible(false);
    localStorage.setItem('onboardingCompleted', 'true');
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <Tooltip
        content={
          <div className="pointer-events-auto">
            <p className="mb-4">{step.content}</p>
            <div className="flex justify-between">
              <button
                onClick={handleSkip}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        }
        targets={step.targets}
        position={step.position}
      />
    </div>
  );
}