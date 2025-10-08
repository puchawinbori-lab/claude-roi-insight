import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const loadingSteps = [
  "Connecting to JIRA...",
  "Analyzing ticket data...",
  "Calculating productivity metrics...",
  "Generating insights...",
];

const Loading = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Step rotation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);

    // Navigate to dashboard after loading
    const navigationTimeout = setTimeout(() => {
      navigate("/dashboard");
    }, 6000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(navigationTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Animated Logo/Spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-copper animate-pulse-slow"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary/20 animate-spin" style={{ animationDuration: "3s" }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold animate-fade-in">
            {loadingSteps[currentStep]}
          </h2>
          <p className="text-muted-foreground">
            This usually takes 15-30 seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-copper transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
