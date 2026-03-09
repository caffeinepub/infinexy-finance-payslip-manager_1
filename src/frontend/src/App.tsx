import { Toaster } from "@/components/ui/sonner";
import { WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import PayslipForm from "./pages/PayslipForm";
import PayslipView from "./pages/PayslipView";

export type Route =
  | { page: "login" }
  | { page: "dashboard" }
  | { page: "payslip-new" }
  | { page: "payslip-edit"; id: string }
  | { page: "payslip-view"; id: string };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "");
  if (path === "/dashboard") return { page: "dashboard" };
  if (path === "/payslip/new") return { page: "payslip-new" };
  const editMatch = path.match(/^\/payslip\/edit\/(.+)$/);
  if (editMatch) return { page: "payslip-edit", id: editMatch[1] };
  const viewMatch = path.match(/^\/payslip\/(.+)$/);
  if (viewMatch) return { page: "payslip-view", id: viewMatch[1] };
  return { page: "login" };
}

export function navigate(to: string) {
  window.location.hash = to;
}

const INIT_TIMEOUT_MS = 8_000;

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash),
  );
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      const isAuthed = identity && !identity.getPrincipal().isAnonymous();
      if (!isAuthed && route.page !== "login") {
        navigate("/login");
      } else if (isAuthed && route.page === "login") {
        navigate("/dashboard");
      }
    }
  }, [identity, isInitializing, route.page]);

  // Show a network warning banner if initialization takes too long
  useEffect(() => {
    if (isInitializing) {
      initTimerRef.current = setTimeout(() => {
        setShowNetworkWarning(true);
      }, INIT_TIMEOUT_MS);
    } else {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
      setShowNetworkWarning(false);
    }
    return () => {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
    };
  }, [isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
          {showNetworkWarning && (
            <div
              data-ocid="app.network_warning.error_state"
              className="flex items-center gap-2 mt-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 max-w-sm text-center"
            >
              <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Having trouble connecting — please check your internet
                connection.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isAuthed = identity && !identity.getPrincipal().isAnonymous();

  return (
    <>
      <Toaster position="top-right" richColors />
      {route.page === "login" || !isAuthed ? (
        <LoginPage />
      ) : route.page === "dashboard" ? (
        <Dashboard />
      ) : route.page === "payslip-new" ? (
        <PayslipForm />
      ) : route.page === "payslip-edit" ? (
        <PayslipForm editId={route.id} />
      ) : route.page === "payslip-view" ? (
        <PayslipView id={route.id} />
      ) : (
        <LoginPage />
      )}
    </>
  );
}
