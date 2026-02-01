import LoginCard from "@/components/LoginCard";
import futureEdgeLogo from "@/assets/future-edge-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="flex items-center justify-center gap-3">
          <img
            src={futureEdgeLogo}
            alt="Future Edge Logo"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold font-display text-foreground">
            Future Edge
          </span>
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

export default Index;
