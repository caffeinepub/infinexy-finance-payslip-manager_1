import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Eye,
  FileText,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PayslipSummary } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

const NAV_BG = "oklch(0.22 0.05 250)";
const NAV_BG_DARK = "oklch(0.17 0.04 250)";
const ACCENT = "oklch(0.48 0.10 195)";
const WHITE = "oklch(0.98 0 0)";
const TEXT_MAIN = "oklch(0.18 0.04 250)";
const TEXT_MID = "oklch(0.52 0.015 250)";
const TEXT_DIM = "oklch(0.70 0.02 250)";
const BORDER = "oklch(0.88 0.006 250)";
const BG_PAGE = "oklch(0.97 0.003 250)";
const BG_CARD = "oklch(1 0 0)";

export default function Dashboard() {
  const { clear, identity } = useInternetIdentity();
  const { actor, connectionTimedOut } = useNetworkStatus(10_000);
  const [payslips, setPayslips] = useState<PayslipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  useEffect(() => {
    if (!actor || !identity || identity.getPrincipal().isAnonymous()) return;
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [slips, profile] = await Promise.all([
          actor.getMyPayslips(),
          actor.getCallerUserProfile().catch(() => null),
        ]);
        if (cancelled) return;
        setPayslips(slips);
        if (profile?.name) setUserName(profile.name);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setLoadError(msg.slice(0, 120));
        toast.error("Failed to load payslips");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [actor, identity]);

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    setDeletingId(id);
    try {
      await actor.deletePayslip(id);
      setPayslips((prev) => prev.filter((p) => p.payslipId !== id));
      toast.success("Payslip deleted");
    } catch {
      toast.error("Failed to delete payslip");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    clear();
    window.location.hash = "/login";
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG_PAGE }}>
      {/* ── Navigation ── */}
      <header
        className="no-print sticky top-0 z-20"
        style={{
          background: NAV_BG,
          borderBottom: `1px solid ${NAV_BG_DARK}`,
          boxShadow: "0 1px 8px 0 rgba(0,0,0,0.12)",
        }}
      >
        <div
          className="max-w-6xl mx-auto"
          style={{
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-2-1.jpeg"
              alt="Infinexy Finance Logo"
              style={{
                height: 36,
                width: "auto",
                objectFit: "contain",
                background: "rgba(255,255,255,0.10)",
                borderRadius: 4,
                padding: "2px 6px",
              }}
            />
            <div>
              <p
                className="font-heading font-black text-sm tracking-widest leading-none"
                style={{ color: WHITE, letterSpacing: "0.12em" }}
              >
                INFINEXY FINANCE
              </p>
              <p
                className="text-xs mt-0.5 hidden md:block"
                style={{ color: TEXT_DIM, letterSpacing: "0.01em" }}
              >
                Payslip Management System
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {userName && (
              <span
                className="text-sm hidden sm:block"
                style={{ color: TEXT_DIM }}
              >
                Welcome,{" "}
                <strong style={{ color: WHITE, fontWeight: 600 }}>
                  {userName}
                </strong>
              </span>
            )}
            <Button
              data-ocid="dashboard.logout_button"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 h-8 text-xs font-medium"
              style={{
                background: "oklch(0.30 0.06 250)",
                color: "oklch(0.88 0.01 250)",
                border: "1px solid oklch(0.34 0.06 250)",
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Network error banner */}
        {connectionTimedOut && !actor && (
          <div
            data-ocid="dashboard.network.error_state"
            className="mb-6 flex items-center gap-3 rounded-md px-4 py-3 text-sm"
            style={{
              background: "oklch(0.97 0.02 60)",
              border: "1px solid oklch(0.82 0.10 60)",
              color: "oklch(0.35 0.06 60)",
            }}
          >
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              Connection issue — network is taking longer than expected.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        )}

        {/* Page heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="font-heading font-bold text-2xl"
              style={{ color: TEXT_MAIN }}
            >
              Payslips
            </h2>
            <p className="text-sm mt-0.5" style={{ color: TEXT_MID }}>
              {!loading && !loadError
                ? payslips.length === 0
                  ? "No payslips saved yet"
                  : `${payslips.length} payslip${payslips.length !== 1 ? "s" : ""}`
                : "\u00A0"}
            </p>
          </div>
          <Button
            data-ocid="dashboard.create_button"
            onClick={() => {
              window.location.hash = "/payslip/new";
            }}
            className="gap-2 font-semibold text-sm h-9"
            style={{
              background: ACCENT,
              color: WHITE,
              border: "none",
              borderRadius: 6,
            }}
          >
            <Plus className="h-4 w-4" />
            New Payslip
          </Button>
        </div>

        {/* Thin separator */}
        <div
          style={{
            height: 1,
            background: BORDER,
            marginBottom: 24,
          }}
        />

        {/* ── States ── */}
        {loading ? (
          <div
            data-ocid="dashboard.loading_state"
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
              style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: TEXT_MID }}>
              Loading payslips…
            </p>
          </div>
        ) : loadError ? (
          <div
            data-ocid="dashboard.error_state"
            className="flex flex-col items-center justify-center py-24 text-center gap-4"
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 52,
                height: 52,
                background: "oklch(0.96 0.01 27)",
              }}
            >
              <FileText
                className="h-5 w-5"
                style={{ color: "oklch(0.55 0.20 27)" }}
              />
            </div>
            <div>
              <h3
                className="font-semibold text-base"
                style={{ color: TEXT_MAIN }}
              >
                Failed to Load
              </h3>
              <p className="text-sm mt-1 max-w-sm" style={{ color: TEXT_MID }}>
                {loadError}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : payslips.length === 0 ? (
          <div
            data-ocid="dashboard.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center gap-5"
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: "oklch(0.93 0.006 250)",
                border: `1px solid ${BORDER}`,
              }}
            >
              <FileText
                className="h-6 w-6"
                style={{ color: "oklch(0.48 0.10 195)" }}
              />
            </div>
            <div>
              <h3
                className="font-semibold text-base font-heading"
                style={{ color: TEXT_MAIN }}
              >
                No Payslips Yet
              </h3>
              <p className="text-sm mt-1 max-w-xs" style={{ color: TEXT_MID }}>
                Create your first payslip to get started.
              </p>
            </div>
            <Button
              onClick={() => {
                window.location.hash = "/payslip/new";
              }}
              className="gap-2 font-semibold text-sm"
              style={{
                background: ACCENT,
                color: WHITE,
                border: "none",
                borderRadius: 6,
              }}
            >
              <Plus className="h-4 w-4" />
              Create First Payslip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {payslips.map((slip, idx) => (
              <div
                key={slip.payslipId.toString()}
                data-ocid={`dashboard.payslip.item.${idx + 1}`}
                style={{
                  background: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${ACCENT}`,
                  borderRadius: 6,
                  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  transition: "box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 14px 0 rgba(0,0,0,0.09)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 1px 4px 0 rgba(0,0,0,0.05)";
                }}
              >
                {/* Card top */}
                <div
                  style={{
                    padding: "14px 16px 10px",
                    borderBottom: "1px solid oklch(0.94 0.004 250)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-semibold text-sm truncate font-heading"
                      style={{ color: TEXT_MAIN }}
                    >
                      {slip.employeeName || "Unknown Employee"}
                    </h3>
                    <span
                      className="text-xs font-medium shrink-0 rounded px-2 py-0.5"
                      style={{
                        background: "oklch(0.93 0.008 250)",
                        color: "oklch(0.40 0.05 250)",
                        border: "1px solid oklch(0.86 0.006 250)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {slip.payPeriod.month} {slip.payPeriod.year}
                    </span>
                  </div>
                </div>

                {/* Card bottom */}
                <div style={{ padding: "12px 16px 14px" }}>
                  <div className="mb-4">
                    <p
                      className="text-xs uppercase tracking-wider mb-0.5 font-medium"
                      style={{ color: TEXT_MID, letterSpacing: "0.06em" }}
                    >
                      Net Payable
                    </p>
                    <p
                      className="text-xl font-bold font-heading"
                      style={{ color: TEXT_MAIN }}
                    >
                      ₹
                      {Number(slip.netPayable).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      data-ocid={`dashboard.payslip.view_button.${idx + 1}`}
                      size="sm"
                      className="flex-1 gap-1.5 font-medium text-xs h-8"
                      style={{
                        background: ACCENT,
                        color: WHITE,
                        border: "none",
                        borderRadius: 5,
                      }}
                      onClick={() => {
                        window.location.hash = `/payslip/${slip.payslipId.toString()}`;
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-ocid={`dashboard.payslip.delete_button.${idx + 1}`}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8"
                          disabled={deletingId === slip.payslipId}
                          style={{
                            borderColor: "oklch(0.84 0.05 27)",
                            color: "oklch(0.50 0.20 27)",
                            borderRadius: 5,
                          }}
                        >
                          {deletingId === slip.payslipId ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="dashboard.payslip.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payslip?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the payslip for{" "}
                            <strong>{slip.employeeName}</strong> (
                            {slip.payPeriod.month} {slip.payPeriod.year}). This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="dashboard.payslip.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid="dashboard.payslip.confirm_button"
                            onClick={() => handleDelete(slip.payslipId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="no-print py-4 text-center"
        style={{ borderTop: `1px solid ${BORDER}` }}
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
