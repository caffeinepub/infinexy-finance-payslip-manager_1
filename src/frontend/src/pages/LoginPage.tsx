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

const NAV_BG = "oklch(0.22 0.05 250)";
const _NAV_BG_DARK = "oklch(0.17 0.04 250)";
const ACCENT = "oklch(0.48 0.10 195)";
const _ACCENT_HOVER = "oklch(0.42 0.10 195)";
const WHITE = "oklch(0.98 0 0)";
const TEXT_DIM = "oklch(0.70 0.02 250)";
const BORDER = "oklch(0.88 0.006 250)";
const BG_PAGE = "oklch(0.97 0.003 250)";

export default function LoginPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isAuthed = !!(identity && !identity.getPrincipal().isAnonymous());

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
    <div className="min-h-screen flex flex-col" style={{ background: BG_PAGE }}>
      {/* Split layout */}
      <div className="flex-1 flex min-h-screen">
        {/* ── Left Panel: Brand ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 relative overflow-hidden"
          style={{ background: NAV_BG }}
        >
          {/* Subtle geometric accent */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 340,
              height: 340,
              borderRadius: "50%",
              background: "oklch(0.30 0.06 250)",
              opacity: 0.5,
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: -60,
              left: -60,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "oklch(0.30 0.06 250)",
              opacity: 0.4,
            }}
          />

          {/* Top branding */}
          <div className="relative z-10 px-10 pt-14 flex flex-col items-center text-center">
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-2-1.jpeg"
              alt="Infinexy Finance Logo"
              style={{
                height: 92,
                width: "auto",
                objectFit: "contain",
                background: "rgba(255,255,255,0.10)",
                borderRadius: 8,
                padding: "6px 14px",
                marginBottom: 24,
              }}
            />
            <h1
              className="font-heading font-black text-3xl tracking-widest mb-4"
              style={{
                color: WHITE,
                letterSpacing: "0.14em",
                lineHeight: 1.2,
              }}
            >
              INFINEXY
              <br />
              FINANCE
            </h1>
            <div
              style={{
                width: 48,
                height: 3,
                background: ACCENT,
                borderRadius: 2,
                marginBottom: 20,
              }}
            />
            <p
              className="text-sm leading-relaxed"
              style={{ color: TEXT_DIM, maxWidth: 260 }}
            >
              401,402 Galav Chamber Dairy Den Sayajigunj
              <br />
              Vadodara, Gujarat – 390005
            </p>
          </div>

          {/* Bottom tagline */}
          <div className="relative z-10 px-10 pb-10 text-center">
            <p
              className="text-xs"
              style={{
                color: "oklch(0.52 0.015 250)",
                letterSpacing: "0.04em",
              }}
            >
              Payslip Management System
            </p>
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          style={{ background: BG_PAGE }}
        >
          {/* Mobile-only brand header */}
          <div className="lg:hidden mb-8 text-center">
            <div
              className="inline-flex items-center gap-3 rounded-lg px-5 py-3 mb-4"
              style={{ background: NAV_BG }}
            >
              <img
                src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-2-1.jpeg"
                alt="Infinexy Finance Logo"
                style={{
                  height: 36,
                  width: "auto",
                  objectFit: "contain",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
              />
              <span
                className="font-heading font-black text-sm tracking-widest"
                style={{ color: WHITE, letterSpacing: "0.12em" }}
              >
                INFINEXY FINANCE
              </span>
            </div>
            <p className="text-xs" style={{ color: "oklch(0.55 0.015 250)" }}>
              401,402 Galav Chamber Dairy Den Sayajigunj, Vadodara
              Gujarat-390005
            </p>
          </div>

          {/* Auth card */}
          <div
            className="w-full max-w-[400px]"
            style={{
              background: "oklch(1 0 0)",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.07)",
            }}
          >
            {/* Card header */}
            <div
              style={{
                borderBottom: `1px solid ${BORDER}`,
                padding: "20px 28px 16px",
              }}
            >
              <h2
                className="font-heading font-bold text-xl"
                style={{ color: NAV_BG }}
              >
                {step === "setup" ? "Create Your Account" : "Sign In"}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "oklch(0.52 0.015 250)" }}
              >
                {step === "setup"
                  ? "Enter your name to complete account setup"
                  : "Access the Infinexy Finance payslip portal"}
              </p>
            </div>

            {/* Card body */}
            <div style={{ padding: "24px 28px 28px" }}>
              {step === "login" && (
                <div className="flex flex-col gap-5">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.45 0.015 250)" }}
                  >
                    Sign in securely with Internet Identity. No password needed.
                  </p>
                  <Button
                    data-ocid="auth.login_button"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="w-full h-11 font-semibold gap-2 text-sm"
                    style={{
                      background: ACCENT,
                      color: WHITE,
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Sign In / Create Account
                      </>
                    )}
                  </Button>
                  <p
                    className="text-center text-xs"
                    style={{ color: "oklch(0.60 0.010 250)" }}
                  >
                    First time? Clicking above will create a new account.
                  </p>
                </div>
              )}

              {step === "checking" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2
                    className="h-6 w-6 animate-spin"
                    style={{ color: ACCENT }}
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
                      background: "oklch(0.95 0.005 250)",
                      border: `1px solid ${BORDER}`,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 34, height: 34, background: ACCENT }}
                    >
                      <User size={15} style={{ color: WHITE }} />
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
                        style={{ color: NAV_BG }}
                      >
                        Connected
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="name-input"
                      className="text-sm font-medium"
                      style={{ color: "oklch(0.30 0.04 250)" }}
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSaveProfile()
                      }
                      className="h-10 text-sm"
                      autoFocus
                    />
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.010 250)" }}
                    >
                      This name will appear on your dashboard.
                    </p>
                  </div>

                  <Button
                    data-ocid="auth.signup_button"
                    onClick={handleSaveProfile}
                    disabled={isSaving || !name.trim()}
                    className="w-full h-11 font-semibold gap-2 text-sm"
                    style={{
                      background: ACCENT,
                      color: WHITE,
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
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

          {/* Footer */}
          <p
            className="mt-8 text-xs text-center"
            style={{ color: "oklch(0.62 0.010 250)" }}
          >
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
        </div>
      </div>
    </div>
  );
}
