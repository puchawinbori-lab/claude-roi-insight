import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

const DataForm = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<string>("fintechco");
  const [apiToken, setApiToken] = useState<string>("");
  const [showApiToken, setShowApiToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Hardcoded launch date: August 25th, 2025
      const claudeAdoptionDate = "2025-08-25";

      // Navigate to loading screen first
      navigate("/loading");

      // Call backend API for demo data
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiEndpoint = `${API_URL}/api/fetch-demo-data`;

      console.log('🔍 [FORM] Fetching demo data for:', selectedCompany);
      console.log('🚀 Endpoint:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claude_adoption_date: claudeAdoptionDate,
          company: selectedCompany,
          api_token: apiToken || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FORM] Demo data fetched successfully');

      // Store the analysis results
      sessionStorage.setItem("dashboardData", JSON.stringify(data));
      sessionStorage.setItem("selectedCompany", selectedCompany);
      if (apiToken) {
        sessionStorage.setItem("apiToken", apiToken);
      }

      // Navigate to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error('❌ [FORM] Failed to load demo data:', error);
      alert('Failed to load demo data. Please check the console for details.');
      setIsSubmitting(false);
      navigate("/form");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
              {selectedCompany === "fintechco" ? "FinTechCo" : "PharmaCo"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
              Claude Code
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-primary">Step 1</span>
            <span>of</span>
            <span>2</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg border p-8 md:p-10 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Select Your Company</h1>
            <p className="text-muted-foreground">
              Choose a company to view their Claude Code ROI analysis
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Company</Label>
              <RadioGroup
                value={selectedCompany}
                onValueChange={setSelectedCompany}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="fintechco" id="fintechco" />
                  <Label htmlFor="fintechco" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">FinTechCo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Financial technology company with 50+ developers
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="pharmaco" id="pharmaco" />
                  <Label htmlFor="pharmaco" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">PharmaCo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pharmaceutical research company with 30+ developers
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Optional JIRA API Token */}
            <div className="space-y-3">
              <Label htmlFor="apiToken" className="text-base font-semibold">
                JIRA API Token <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Enter your JIRA API token to fetch live data, or leave blank to use demo data
              </p>
              <div className="relative">
                <Input
                  id="apiToken"
                  type={showApiToken ? "text" : "password"}
                  placeholder="Enter your JIRA API token (optional)"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiToken(!showApiToken)}
                >
                  {showApiToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 gradient-copper hover:opacity-90"
              >
                {isSubmitting ? "Loading..." : "View ROI Analysis"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DataForm;
