import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  User, 
  FileText, 
  Download, 
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AdmissionProgressTracker from "@/components/AdmissionProgressTracker";
import NewsCarousel from "@/components/NewsCarousel";
import futureEdgeLogo from "@/assets/future-edge-logo.png";

interface DashboardData {
  student: {
    id: string;
    full_name: string;
    email: string;
    registration_number: string;
    admission_stage: string;
  };
  progress: {
    stages: string[];
    currentStageIndex: number;
    isProfileComplete: boolean;
  };
  whatsNext: string;
  alerts: {
    id: string;
    title: string;
    message: string;
    alert_type: string;
    created_at: string;
  }[];
  notices: {
    id: string;
    title: string;
    content: string;
    is_important: boolean;
    published_at: string;
  }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const studentId = sessionStorage.getItem("studentId");
    const mustChangePassword = sessionStorage.getItem("mustChangePassword");
    
    if (!studentId) {
      navigate("/");
      return;
    }

    if (mustChangePassword === "true") {
      navigate("/change-password");
      return;
    }

    fetchDashboardData(studentId);
  }, [navigate]);

  const fetchDashboardData = async (studentId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-dashboard?studentId=${studentId}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, progress, whatsNext, alerts, notices } = dashboardData!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header - Fixed height for consistent offset */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border h-16">
        <div className="max-w-2xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={futureEdgeLogo}
              alt="Future Edge Logo"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="text-base font-semibold font-display text-foreground">
              Future Edge
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content - Add pt-16 to offset fixed header */}
      <main className="relative z-10 flex-1 pt-16 py-6 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Welcome Section */}
          <div className="animate-slide-up">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Welcome back, {student.full_name || "Student"}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your admission process here
            </p>
          </div>

          {/* Admission Progress Tracker */}
          <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <AdmissionProgressTracker 
              stages={progress.stages} 
              currentStageIndex={progress.currentStageIndex} 
            />
          </div>

          {/* News & Updates Carousel */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <NewsCarousel notices={notices} />
          </div>

          {/* What's Next Card */}
          <Card className="bg-primary/5 border-primary/20 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">What's Next?</h3>
                  <p className="text-sm text-muted-foreground mt-1">{whatsNext}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions / Alerts */}
          {alerts.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{alert.title}</p>
                      {alert.message && (
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Grid */}
          <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <Card 
                className="cursor-pointer hover:shadow-hover transition-all active:scale-[0.98]"
                onClick={() => navigate("/documents")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Documents</span>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-hover transition-all active:scale-[0.98]"
                onClick={() => navigate("/forms")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Forms</span>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-hover transition-all active:scale-[0.98]"
                onClick={() => navigate("/profile")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Profile</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Help & Support */}
          <Card className="bg-muted/30 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">Need Help?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Need help with your admission process?
                  </p>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  Ask
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Future Edge. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
