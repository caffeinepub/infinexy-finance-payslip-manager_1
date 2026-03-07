import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
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

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash),
  );

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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
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
