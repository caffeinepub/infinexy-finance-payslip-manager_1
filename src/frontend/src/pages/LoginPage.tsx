import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Step = "login" | "checking" | "setup";

export default function LoginPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isAuthed = !!(identity && !identity.getPrincipal().isAnonymous());

  // Once identity is set and actor is ready, check profile
  useEffect(() => {
    if (!isAuthed || !actor || step === "setup") return;

    setStep("checking");
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile?.name) {
          navigate("/dashboard");
        } else {
          setStep("setup");
        }
      })
      .catch(() => {
        setStep("setup");
      });
  }, [isAuthed, actor, step]);

  const handleSaveProfile = async () => {
    if (!actor || !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setIsSaving(true);
    try {
      await actor.saveCallerUserProfile({ name: name.trim() });
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.975 0.005 80)" }}
    >
      {/* Top brand stripe */}
      <div style={{ height: 3, background: "oklch(0.28 0.08 250)" }} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Company identity */}
        <div className="mb-10 text-center select-none">
          <div className="flex flex-col items-center gap-3 mb-2">
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-2-1.jpeg"
              alt="Infinexy Finance Logo"
              style={{ height: 90, width: "auto", objectFit: "contain" }}
            />
          </div>
          <p
            className="text-xs font-medium"
            style={{ color: "oklch(0.50 0.015 250)", lineHeight: 1.6 }}
          >
            401,402 Galav Chamber Dairy Den Sayajigunj
            <br />
            Vadodara Gujarat-390005
          </p>
        </div>

        {/* Auth card */}
        <div
          className="w-full max-w-sm"
          style={{
            background: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.008 250)",
            borderRadius: 8,
            boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)",
          }}
        >
          {/* Card header */}
          <div
            style={{
              borderBottom: "1px solid oklch(0.88 0.008 250)",
              padding: "18px 24px 14px",
            }}
          >
            <h2
              className="font-heading font-bold text-lg"
              style={{ color: "oklch(0.18 0.06 250)" }}
            >
              {step === "setup" ? "Create Your Account" : "Sign In"}
            </h2>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.55 0.015 250)" }}
            >
              {step === "setup"
                ? "One last step — enter your name to get started"
                : "Access your payslip management dashboard"}
            </p>
          </div>

          {/* Card body */}
          <div style={{ padding: "20px 24px 24px" }}>
            {step === "login" && (
              <div className="flex flex-col gap-4">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.42 0.025 250)" }}
                >
                  Sign in securely with Internet Identity — no passwords
                  required.
                </p>
                <Button
                  data-ocid="auth.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full h-11 font-semibold"
                  style={{
                    background: "oklch(0.28 0.08 250)",
                    color: "oklch(0.98 0 0)",
                    border: "none",
                  }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In / Create Account
                    </>
                  )}
                </Button>
                <p
                  className="text-center text-xs"
                  style={{ color: "oklch(0.60 0.010 250)" }}
                >
                  First time? Click above to create a new account.
                </p>
              </div>
            )}

            {step === "checking" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: "oklch(0.28 0.08 250)" }}
                />
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.50 0.015 250)" }}
                >
                  Loading your account…
                </p>
              </div>
            )}

            {step === "setup" && (
              <div className="flex flex-col gap-5">
                {/* Identity badge */}
                <div
                  className="flex items-center gap-3 rounded-md"
                  style={{
                    background: "oklch(0.96 0.006 250)",
                    border: "1px solid oklch(0.88 0.008 250)",
                    padding: "10px 14px",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 34,
                      height: 34,
                      background: "oklch(0.28 0.08 250)",
                    }}
                  >
                    <User size={16} style={{ color: "oklch(0.98 0 0)" }} />
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.015 250)" }}
                    >
                      Identity verified
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.28 0.08 250)" }}
                    >
                      Connected
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="name-input"
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.28 0.08 250)" }}
                  >
                    Your Full Name
                  </Label>
                  <Input
                    id="name-input"
                    data-ocid="auth.name_input"
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                    className="h-11"
                    autoFocus
                  />
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.60 0.010 250)" }}
                  >
                    This will appear on your dashboard.
                  </p>
                </div>

                <Button
                  data-ocid="auth.signup_button"
                  onClick={handleSaveProfile}
                  disabled={isSaving || !name.trim()}
                  className="w-full h-11 font-semibold"
                  style={{
                    background: "oklch(0.28 0.08 250)",
                    color: "oklch(0.98 0 0)",
                    border: "none",
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Continue to Dashboard"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-4 text-center"
        style={{ borderTop: "1px solid oklch(0.88 0.008 250)" }}
      >
        <p className="text-xs" style={{ color: "oklch(0.62 0.010 250)" }}>
          © {currentYear}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
