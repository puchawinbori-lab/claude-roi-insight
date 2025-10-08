import { Link } from "react-router-dom";
import { ArrowRight, Link as LinkIcon, TrendingUp, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import fintechcoLogo from "@/assets/fintechco-logo.png";
import claudeLogo from "@/assets/claude-logo.webp";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={fintechcoLogo} alt="FinTechCo" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <img src={claudeLogo} alt="Claude" className="h-10 w-auto" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary">
                Claude Code Live ROI Tracking
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Quantify developer productivity gains and cost savings with data-driven insights
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
              <div className="bg-card rounded-xl p-6 border hover-lift shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <LinkIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Connect JIRA</h3>
                <p className="text-muted-foreground">
                  Integrate your existing project data seamlessly
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border hover-lift shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analyze Impact</h3>
                <p className="text-muted-foreground">
                  Automatic productivity calculations and insights
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border hover-lift shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Prove Value</h3>
                <p className="text-muted-foreground">
                  Executive-ready ROI metrics and reports
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link to="/form">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 gradient-copper hover:opacity-90 transition-opacity"
                >
                  Calculate Your ROI
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Prototype built for FinTechCo • Powered by Claude
        </div>
      </footer>
    </div>
  );
};

export default Landing;
