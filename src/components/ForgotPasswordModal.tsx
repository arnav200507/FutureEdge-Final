import { useState } from "react";
import { X, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!registrationNumber.trim()) {
      setError("Please enter your registration number");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("request-password-reset", {
        body: {
          registrationNumber: registrationNumber.trim(),
          siteUrl: window.location.origin,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRegistrationNumber("");
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-card w-full max-w-md p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          // Success State
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display text-foreground mb-2">
              Check Your Email
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              If an account exists with this registration number, we've sent a password reset link to the associated email address.
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              The link will expire in 1 hour. Don't forget to check your spam folder.
            </p>
            <Button
              onClick={handleClose}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          // Form State
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-display text-foreground mb-1">
                Forgot Password?
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your registration number and we'll send you a reset link
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-3 animate-scale-in">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-registration" className="text-sm font-medium text-foreground">
                  Registration Number
                </Label>
                <Input
                  id="reset-registration"
                  type="text"
                  placeholder="Enter your registration number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="h-11 bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
