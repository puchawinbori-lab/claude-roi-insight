import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  subtitle: string;
  icon: LucideIcon;
}

const MetricCard = ({ title, value, trend, subtitle, icon: Icon }: MetricCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm hover-lift animate-fade-in">
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
  );
};

export default MetricCard;
