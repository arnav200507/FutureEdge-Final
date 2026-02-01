import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LoginCard from "@/components/LoginCard";
import futureEdgeLogo from "@/assets/future-edge-logo.png";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-4 border-b border-border">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={futureEdgeLogo}
              alt="Future Edge Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-base font-semibold font-display text-foreground">
              Future Edge
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8 px-4">
        <LoginCard />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Future Edge. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Login;
