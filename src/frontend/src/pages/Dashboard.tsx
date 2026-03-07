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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, LogOut, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PayslipSummary } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Dashboard() {
  const { clear, identity } = useInternetIdentity();
  const { actor } = useActor();
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
        const slips = await actor.getMyPayslips();
        if (!cancelled) setPayslips(slips);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setLoadError(msg.slice(0, 120));
        toast.error(`Failed to load payslips: ${msg.slice(0, 80)}`);
      }
      try {
        const profile = await actor.getCallerUserProfile();
        if (!cancelled && profile?.name) setUserName(profile.name);
      } catch {
        // Profile load failure is non-critical
      }
      if (!cancelled) setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-base font-bold tracking-wide">
                INFINEXY FINANCE
              </p>
              <p className="text-xs text-primary-foreground/70 hidden sm:block">
                401,402 Galav Chamber Sayajigunj Vadodara Gujarat-390005
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-primary-foreground/80 hidden sm:block">
                Welcome, <strong>{userName}</strong>
              </span>
            )}
            <Button
              data-ocid="dashboard.logout_button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading text-foreground">
              Payslips
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {payslips.length} payslip{payslips.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Button
            data-ocid="dashboard.create_button"
            onClick={() => {
              window.location.hash = "/payslip/new";
            }}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Payslip
          </Button>
        </div>

        {loading ? (
          <div
            data-ocid="dashboard.loading_state"
            className="flex items-center justify-center py-20"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : loadError ? (
          <div
            data-ocid="dashboard.error_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <FileText className="h-14 w-14 text-destructive/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              Failed to Load Payslips
            </h3>
            <p className="text-muted-foreground text-sm mt-1 mb-2 max-w-sm">
              {loadError}
            </p>
            <p className="text-muted-foreground text-xs mb-6 max-w-sm">
              This may be a temporary issue. Try refreshing the page.
            </p>
            <Button
              data-ocid="dashboard.error.button"
              onClick={() => window.location.reload()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        ) : payslips.length === 0 ? (
          <div
            data-ocid="dashboard.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <FileText className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              No Payslips Yet
            </h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-sm">
              Create your first payslip by clicking the "New Payslip" button
              above.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  window.location.hash = "/payslip/new";
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Payslip
              </Button>
              <Button
                data-ocid="dashboard.empty.refresh_button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {payslips.map((slip, idx) => (
              <div
                key={slip.payslipId.toString()}
                data-ocid={`dashboard.payslip.item.${idx + 1}`}
              >
                <Card className="shadow-card hover:shadow-md transition-shadow border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {slip.employeeName || "Unknown Employee"}
                      </CardTitle>
                      <Badge className="bg-primary/10 text-primary border-0 shrink-0 text-xs">
                        {slip.payPeriod.month} {slip.payPeriod.year}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Net Amount
                      </p>
                      <p className="text-xl font-bold text-accent">
                        ₹
                        {Number(slip.netAmount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-ocid={`dashboard.payslip.view_button.${idx + 1}`}
                        variant="default"
                        size="sm"
                        className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
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
                            className="gap-1.5 text-destructive hover:text-destructive"
                            disabled={deletingId === slip.payslipId}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="dashboard.payslip.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Payslip?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the payslip for{" "}
                              <strong>{slip.employeeName}</strong> (
                              {slip.payPeriod.month} {slip.payPeriod.year}).
                              This action cannot be undone.
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
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
