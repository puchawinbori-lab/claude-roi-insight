import { useState } from "react";
import { TrendingUp, TrendingDown, LucideIcon, RotateCcw } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  subtitle: string;
  icon: LucideIcon;
  calculation?: {
    formula: string;
    explanation: string[];
  };
}

const MetricCard = ({ title, value, trend, subtitle, icon: Icon, calculation }: MetricCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (calculation) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`relative ${calculation ? 'cursor-pointer' : ''}`}
      style={{ perspective: '1000px', minHeight: '200px' }}
      onClick={handleClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '200px',
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full bg-card rounded-xl p-6 border shadow-sm hover-lift animate-fade-in"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up" ? "text-success" : "text-destructive"
            }`}>
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-3xl font-bold tracking-tight animate-count-up">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Back of card */}
        {calculation && (
          <div
            className="absolute w-full h-full bg-card rounded-xl p-6 border shadow-sm"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-primary">Calculation Method</h3>
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Formula:</p>
              <code className="text-sm bg-muted px-3 py-2 rounded block font-mono leading-relaxed">
                {calculation.formula}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
