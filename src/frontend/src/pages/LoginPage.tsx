import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn, isLoginSuccess, identity } =
    useInternetIdentity();
  const { actor } = useActor();
  const [showSetupName, setShowSetupName] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // After login, check if profile exists
  useEffect(() => {
    const checkProfile = async () => {
      if (!actor || !identity || identity.getPrincipal().isAnonymous()) return;
      try {
        const profile = await actor.getCallerUserProfile();
        if (!profile || !profile.name) {
          setShowSetupName(true);
        } else {
          // Profile exists, navigate to dashboard
          window.location.hash = "/dashboard";
        }
      } catch {
        setShowSetupName(true);
      }
    };
    if (
      isLoginSuccess ||
      (identity && !identity.getPrincipal().isAnonymous())
    ) {
      checkProfile();
    }
  }, [actor, identity, isLoginSuccess]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setIsSaving(true);
    try {
      await actor.saveCallerUserProfile({ name: name.trim() });
      toast.success("Account setup complete!");
      window.location.hash = "/dashboard";
    } catch (_err) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (showSetupName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-heading tracking-wide">
              INFINEXY FINANCE
            </h1>
            <p className="text-primary/70 font-medium text-sm">
              401,402 Galav Chamber Dairy Den Sayajigunj Vadodara Gujarat-390005
            </p>
          </div>
          <Card className="shadow-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg text-center">
                Setup Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup-name">Your Name</Label>
                <Input
                  id="setup-name"
                  data-ocid="auth.name_input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                />
              </div>
              <Button
                data-ocid="auth.signup_button"
                className="w-full"
                onClick={handleSaveName}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-heading tracking-wide">
            INFINEXY FINANCE
          </h1>
          <p className="text-primary/70 font-medium text-xs">
            401,402 Galav Chamber Dairy Den Sayajigunj
            <br />
            Vadodara Gujarat-390005
          </p>
        </div>

        <Card className="shadow-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Sign In to Continue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Use your Internet Identity to securely access the payslip
              dashboard.
            </p>
            <Button
              data-ocid="auth.login_button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={login}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In / Create Account"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              First time? Click above to create a new account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
