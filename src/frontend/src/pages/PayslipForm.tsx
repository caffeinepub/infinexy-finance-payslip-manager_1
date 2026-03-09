import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, RefreshCw, Save, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend.d";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

// ─── Indian number words ────────────────────────────────────────────────────
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function below100(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ` ${ones[n % 10]}` : "");
}
function below1000(n: number): string {
  if (n < 100) return below100(n);
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` ${below100(n % 100)}` : ""}`;
}
function numberToWords(amount: number): string {
  if (Number.isNaN(amount) || amount < 0) return "";
  const rupees = Math.floor(amount);
  const paiseRaw = Math.round((amount - rupees) * 100);
  const paise = paiseRaw > 99 ? 99 : paiseRaw;
  if (rupees === 0 && paise === 0) return "INR Zero Only";
  const parts: string[] = [];
  let rem = rupees;
  const crore = Math.floor(rem / 10_000_000);
  rem %= 10_000_000;
  const lakh = Math.floor(rem / 100_000);
  rem %= 100_000;
  const thou = Math.floor(rem / 1_000);
  rem %= 1_000;
  if (crore > 0) parts.push(`${below1000(crore)} Crore`);
  if (lakh > 0) parts.push(`${below1000(lakh)} Lakh`);
  if (thou > 0) parts.push(`${below1000(thou)} Thousand`);
  if (rem > 0) parts.push(below1000(rem));
  let result = `INR ${parts.join(" ")}`;
  if (paise > 0) result += ` and ${below100(paise)} Paise`;
  return `${result} Only`;
}

function getCurrentDateTime(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Props {
  editId?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface FormState {
  employeeName: string;
  employeeNumber: string;
  functionRole: string;
  designation: string;
  location: string;
  bankDetails: string;
  dateOfJoining: string;
  taxRegime: string;
  pan: string;
  uan: string;
  pfAccountNumber: string;
  esiNumber: string;
  pran: string;
  payMonth: string;
  payYear: string;
  totalDays: string;
  present: string;
  utilisedLeave: string;
  weekOff: string;
  overtimeHrs: string;
  weeklyOffOvertimeDays: string;
  totalAllowLeaves: string;
  usedLeaves: string;
  basicPay: string;
  overtimeAmount: string;
  weeklyOffOvertimeAmount: string;
  employerESI: string;
  employeeESIDeduction: string;
  professionalTax: string;
  employersContributionEPFESIC: string;
  amountInWords: string;
  signatoryName: string;
  signDate: string;
}

const defaultForm: FormState = {
  employeeName: "",
  employeeNumber: "",
  functionRole: "",
  designation: "",
  location: "",
  bankDetails: "",
  dateOfJoining: "",
  taxRegime: "Regular Tax Regime",
  pan: "",
  uan: "",
  pfAccountNumber: "",
  esiNumber: "",
  pran: "",
  payMonth: MONTHS[new Date().getMonth()],
  payYear: String(new Date().getFullYear()),
  totalDays: "30",
  present: "",
  utilisedLeave: "",
  weekOff: "",
  overtimeHrs: "",
  weeklyOffOvertimeDays: "",
  totalAllowLeaves: "",
  usedLeaves: "",
  basicPay: "",
  overtimeAmount: "0",
  weeklyOffOvertimeAmount: "0",
  employerESI: "0",
  employeeESIDeduction: "0",
  professionalTax: "0",
  employersContributionEPFESIC: "0",
  amountInWords: "",
  signatoryName: "",
  signDate: getCurrentDateTime(),
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <div
      className="mt-7 mb-4"
      style={{
        borderLeft: "3px solid oklch(0.28 0.08 250)",
        paddingLeft: 10,
      }}
    >
      <h3
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "oklch(0.28 0.08 250)", letterSpacing: "0.1em" }}
      >
        {title}
      </h3>
    </div>
  );
}

function Field({
  label,
  id,
  readOnly,
  displayValue,
  ...props
}: {
  label: string;
  id: string;
  readOnly?: boolean;
  displayValue?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium"
        style={{ color: "oklch(0.50 0.015 250)" }}
      >
        {label}
      </Label>
      {readOnly ? (
        <div
          className="h-9 px-3 flex items-center rounded-md text-sm font-bold"
          style={{
            background: "oklch(0.93 0.015 250)",
            color: "oklch(0.28 0.08 250)",
            border: "1px solid oklch(0.86 0.012 250)",
          }}
        >
          {displayValue}
        </div>
      ) : (
        <Input id={id} {...props} className="h-9 text-sm" />
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PayslipForm({ editId }: Props) {
  const { actor, isFetching, connectionTimedOut } = useNetworkStatus(8_000);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);

  // Load existing payslip for edit
  useEffect(() => {
    if (!editId) {
      setIsLoading(false);
      return;
    }
    if (!actor) return;
    let cancelled = false;

    actor
      .getPayslip(BigInt(editId))
      .then((data: Payslip) => {
        if (cancelled) return;
        setForm({
          employeeName: data.employeeName,
          employeeNumber: data.employeeNumber,
          functionRole: data.functionRole,
          designation: data.designation,
          location: data.location,
          bankDetails: data.bankDetails,
          dateOfJoining: data.dateOfJoining,
          taxRegime: data.taxRegime,
          pan: data.pan,
          uan: data.uan,
          pfAccountNumber: data.pfAccountNumber,
          esiNumber: data.esiNumber,
          pran: data.pran,
          payMonth: data.payPeriod.month,
          payYear: data.payPeriod.year,
          totalDays: data.attendance.totalDays.toString(),
          present: data.attendance.present.toString(),
          utilisedLeave: data.attendance.utilisedLeave.toString(),
          weekOff: data.attendance.weekOff.toString(),
          overtimeHrs: data.attendance.overtimeHrs,
          weeklyOffOvertimeDays:
            data.attendance.weeklyOffOvertimeDays.toString(),
          totalAllowLeaves: data.leave.totalAllowLeaves.toString(),
          usedLeaves: data.leave.usedLeaves.toString(),
          basicPay: data.earnings.basicPay.toFixed(2),
          overtimeAmount: data.earnings.overtimeAmount.toFixed(2),
          weeklyOffOvertimeAmount:
            data.earnings.weeklyOffOvertimeAmount.toFixed(2),
          employerESI: data.earnings.employerESI.toFixed(2),
          employeeESIDeduction: data.deductions.employeeESIDeduction.toFixed(2),
          professionalTax: data.deductions.professionalTax.toFixed(2),
          employersContributionEPFESIC:
            data.employersContributionEPFESIC.toFixed(2),
          amountInWords: data.amountInWords,
          signatoryName: data.signatoryName,
          signDate: data.signDate,
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load payslip");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editId, actor]);

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Computed values
  const bp = Number.parseFloat(form.basicPay) || 0;
  const ot = Number.parseFloat(form.overtimeAmount) || 0;
  const wot = Number.parseFloat(form.weeklyOffOvertimeAmount) || 0;
  const eESI = Number.parseFloat(form.employerESI) || 0;
  const totalEarnings = bp + ot + wot + eESI;

  const esiDed = Number.parseFloat(form.employeeESIDeduction) || 0;
  const pt = Number.parseFloat(form.professionalTax) || 0;
  const totalDeductions = esiDed + pt;

  const epfEsic = Number.parseFloat(form.employersContributionEPFESIC) || 0;
  const netAmount = totalEarnings - totalDeductions;

  const balanceLeaves = Math.max(
    0,
    (Number.parseInt(form.totalAllowLeaves) || 0) -
      (Number.parseInt(form.usedLeaves) || 0),
  );

  // Auto-update amount in words when netAmount changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, amountInWords: numberToWords(netAmount) }));
  }, [netAmount]);

  const handleSave = async () => {
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    if (!form.employeeName.trim()) {
      toast.error("Employee name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payPeriod = { month: form.payMonth, year: form.payYear };
      const attendance = {
        totalDays: BigInt(Number.parseInt(form.totalDays) || 0),
        present: BigInt(Number.parseInt(form.present) || 0),
        utilisedLeave: BigInt(Number.parseInt(form.utilisedLeave) || 0),
        weekOff: BigInt(Number.parseInt(form.weekOff) || 0),
        overtimeHrs: form.overtimeHrs,
        weeklyOffOvertimeDays: BigInt(
          Number.parseInt(form.weeklyOffOvertimeDays) || 0,
        ),
      };
      const leave = {
        totalAllowLeaves: BigInt(Number.parseInt(form.totalAllowLeaves) || 0),
        usedLeaves: BigInt(Number.parseInt(form.usedLeaves) || 0),
        balanceLeaves: BigInt(balanceLeaves),
      };
      const earnings = {
        basicPay: bp,
        overtimeAmount: ot,
        weeklyOffOvertimeAmount: wot,
        employerESI: eESI,
      };
      const deductions = { employeeESIDeduction: esiDed, professionalTax: pt };

      if (editId) {
        await actor.updatePayslip(
          BigInt(editId),
          payPeriod,
          form.employeeName,
          form.employeeNumber,
          form.functionRole,
          form.designation,
          form.location,
          form.bankDetails,
          form.dateOfJoining,
          form.taxRegime,
          form.pan,
          form.uan,
          form.pfAccountNumber,
          form.esiNumber,
          form.pran,
          attendance,
          leave,
          earnings,
          deductions,
          totalEarnings,
          totalDeductions,
          epfEsic,
          netAmount,
          form.amountInWords,
          form.signatoryName,
          form.signDate,
        );
      } else {
        await actor.createPayslip(
          payPeriod,
          form.employeeName,
          form.employeeNumber,
          form.functionRole,
          form.designation,
          form.location,
          form.bankDetails,
          form.dateOfJoining,
          form.taxRegime,
          form.pan,
          form.uan,
          form.pfAccountNumber,
          form.esiNumber,
          form.pran,
          attendance,
          leave,
          earnings,
          deductions,
          totalEarnings,
          totalDeductions,
          epfEsic,
          netAmount,
          form.amountInWords,
          form.signatoryName,
          form.signDate,
        );
      }
      toast.success("Payslip saved successfully!");
      window.location.hash = "/dashboard";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("not registered") ||
        msg.includes("Unauthorized") ||
        msg.includes("not authorized")
      ) {
        toast.error("Not authorized. Please refresh and try again.");
      } else if (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("timeout")
      ) {
        toast.error(
          "Network error. Please check your connection and try again.",
        );
      } else {
        toast.error(`Failed to save: ${msg.slice(0, 100)}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        data-ocid="payslip_form.loading_state"
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.975 0.005 80)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "oklch(0.28 0.08 250)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.55 0.015 250)" }}>
            Loading payslip…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.975 0.005 80)" }}
    >
      {/* Header */}
      <header
        className="no-print"
        style={{
          background: "oklch(0.28 0.08 250)",
          borderBottom: "1px solid oklch(0.22 0.07 250)",
        }}
      >
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6"
          style={{
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              className="font-heading font-black tracking-widest text-sm"
              style={{ color: "oklch(0.98 0 0)", letterSpacing: "0.12em" }}
            >
              INFINEXY FINANCE
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.78 0.03 250)" }}
            >
              {editId ? "Edit Payslip" : "New Payslip"}
            </p>
          </div>
          <Button
            data-ocid="payslip_form.cancel_button"
            size="sm"
            onClick={() => {
              window.location.hash = "/dashboard";
            }}
            className="gap-2 h-8"
            style={{
              background: "oklch(0.36 0.07 250)",
              color: "oklch(0.95 0.01 250)",
              border: "none",
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h2
            className="font-heading font-bold text-2xl"
            style={{ color: "oklch(0.18 0.06 250)" }}
          >
            {editId ? "Edit Payslip" : "New Payslip"}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "oklch(0.55 0.015 250)" }}
          >
            Fill in all employee and salary information below.
          </p>
        </div>

        {/* Network banners */}
        {isFetching && !connectionTimedOut && (
          <div
            data-ocid="payslip_form.loading_state"
            className="mb-4 flex items-center gap-2 rounded-md px-4 py-3 text-sm"
            style={{
              background: "oklch(0.96 0.006 250)",
              border: "1px solid oklch(0.88 0.008 250)",
              color: "oklch(0.50 0.015 250)",
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Connecting to the network… Save will be available shortly.
          </div>
        )}
        {connectionTimedOut && !actor && (
          <div
            data-ocid="payslip_form.network.error_state"
            className="mb-4 flex items-center gap-3 rounded-md px-4 py-3 text-sm"
            style={{
              background: "oklch(0.97 0.02 75)",
              border: "1px solid oklch(0.80 0.10 75)",
              color: "oklch(0.35 0.06 75)",
            }}
          >
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              Unable to connect to the network. Check your internet connection.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              style={{
                borderColor: "oklch(0.70 0.10 75)",
                color: "oklch(0.35 0.06 75)",
              }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        )}

        {/* Form card */}
        <div
          className="rounded-lg"
          style={{
            background: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.008 250)",
            boxShadow: "0 2px 10px 0 rgba(0,0,0,0.06)",
            padding: "8px 24px 28px",
          }}
        >
          {/* ── Pay Period ── */}
          <SectionTitle title="Pay Period" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                className="text-xs font-medium"
                style={{ color: "oklch(0.50 0.015 250)" }}
              >
                Month
              </Label>
              <select
                className="h-9 text-sm rounded-md px-3"
                style={{
                  background: "oklch(1 0 0)",
                  border: "1px solid oklch(0.88 0.008 250)",
                  color: "oklch(0.18 0.06 250)",
                }}
                value={form.payMonth}
                onChange={set("payMonth")}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Year"
              id="payYear"
              value={form.payYear}
              onChange={set("payYear")}
              placeholder="e.g. 2025"
            />
          </div>

          <Separator className="my-5" />

          {/* ── Employee Information ── */}
          <SectionTitle title="Employee Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Employee Name *"
              id="empName"
              value={form.employeeName}
              onChange={set("employeeName")}
              placeholder="Full name"
            />
            <Field
              label="Employee Number"
              id="empNum"
              value={form.employeeNumber}
              onChange={set("employeeNumber")}
              placeholder="e.g. 044"
            />
            <Field
              label="Function / Role"
              id="funcRole"
              value={form.functionRole}
              onChange={set("functionRole")}
              placeholder="e.g. Flight Ticket Booking"
            />
            <Field
              label="Designation"
              id="desig"
              value={form.designation}
              onChange={set("designation")}
              placeholder="e.g. INTERNATIONAL BOOKING"
            />
            <Field
              label="Location"
              id="loc"
              value={form.location}
              onChange={set("location")}
              placeholder="Work location"
            />
            <Field
              label="Bank Details"
              id="bank"
              value={form.bankDetails}
              onChange={set("bankDetails")}
              placeholder="Bank account / details"
            />
            <Field
              label="Date of Joining"
              id="doj"
              value={form.dateOfJoining}
              onChange={set("dateOfJoining")}
              placeholder="e.g. 6-May-24"
            />
            <Field
              label="Tax Regime"
              id="taxRegime"
              value={form.taxRegime}
              onChange={set("taxRegime")}
              placeholder="e.g. Regular Tax Regime"
            />
            <Field
              label="PAN (Income Tax Number)"
              id="pan"
              value={form.pan}
              onChange={set("pan")}
              placeholder="PAN number"
            />
            <Field
              label="UAN (Universal Account Number)"
              id="uan"
              value={form.uan}
              onChange={set("uan")}
              placeholder="UAN number"
            />
            <Field
              label="PF Account Number"
              id="pf"
              value={form.pfAccountNumber}
              onChange={set("pfAccountNumber")}
              placeholder="PF account number"
            />
            <Field
              label="ESI Number"
              id="esi"
              value={form.esiNumber}
              onChange={set("esiNumber")}
              placeholder="ESI number"
            />
            <Field
              label="PRAN (PR Account Number)"
              id="pran"
              value={form.pran}
              onChange={set("pran")}
              placeholder="PRAN number"
            />
          </div>

          <Separator className="my-5" />

          {/* ── Attendance ── */}
          <SectionTitle title="Attendance Details" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field
              label="Total Days"
              id="totalDays"
              type="number"
              value={form.totalDays}
              onChange={set("totalDays")}
              placeholder="30"
            />
            <Field
              label="Present"
              id="present"
              type="number"
              value={form.present}
              onChange={set("present")}
              placeholder="Days present"
            />
            <Field
              label="Utilised Leave"
              id="utilisedLeave"
              type="number"
              value={form.utilisedLeave}
              onChange={set("utilisedLeave")}
              placeholder="Days"
            />
            <Field
              label="Week Off"
              id="weekOff"
              type="number"
              value={form.weekOff}
              onChange={set("weekOff")}
              placeholder="Week off days"
            />
            <Field
              label="Overtime (Hrs)"
              id="otHrs"
              value={form.overtimeHrs}
              onChange={set("overtimeHrs")}
              placeholder="e.g. 33-57.00 Hrs"
            />
            <Field
              label="Weekly Off Overtime (Days)"
              id="wotDays"
              type="number"
              value={form.weeklyOffOvertimeDays}
              onChange={set("weeklyOffOvertimeDays")}
              placeholder="Days"
            />
          </div>

          <Separator className="my-5" />

          {/* ── Leave ── */}
          <SectionTitle title="Leave Details (In Days)" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field
              label="Total Allow Leaves"
              id="totalLeaves"
              type="number"
              value={form.totalAllowLeaves}
              onChange={set("totalAllowLeaves")}
              placeholder="Total"
            />
            <Field
              label="Used Leaves"
              id="usedLeaves"
              type="number"
              value={form.usedLeaves}
              onChange={set("usedLeaves")}
              placeholder="Used"
            />
            <Field
              label="Balance Leaves (Auto)"
              id="balLeaves"
              readOnly
              displayValue={`${balanceLeaves} Days`}
            />
          </div>

          <Separator className="my-5" />

          {/* ── Earnings ── */}
          <SectionTitle title="Earnings" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field
              label="Basic Pay (₹)"
              id="basicPay"
              type="number"
              step="0.01"
              value={form.basicPay}
              onChange={set("basicPay")}
              placeholder="0.00"
            />
            <Field
              label="Overtime Amount (₹)"
              id="otAmt"
              type="number"
              step="0.01"
              value={form.overtimeAmount}
              onChange={set("overtimeAmount")}
              placeholder="0.00"
            />
            <Field
              label="Weekly Off Overtime Amount (₹)"
              id="wotAmt"
              type="number"
              step="0.01"
              value={form.weeklyOffOvertimeAmount}
              onChange={set("weeklyOffOvertimeAmount")}
              placeholder="0.00"
            />
            <Field
              label="Employer E.S.I @3.25% (₹)"
              id="empESI"
              type="number"
              step="0.01"
              value={form.employerESI}
              onChange={set("employerESI")}
              placeholder="0.00"
            />
            <Field
              label="Total Earnings (Auto)"
              id="totalEarnings"
              readOnly
              displayValue={`₹${totalEarnings.toFixed(2)}`}
            />
          </div>

          <Separator className="my-5" />

          {/* ── Deductions ── */}
          <SectionTitle title="Deductions" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field
              label="Employees ESI Deduction 0.75% (₹)"
              id="esiDed"
              type="number"
              step="0.01"
              value={form.employeeESIDeduction}
              onChange={set("employeeESIDeduction")}
              placeholder="0.00"
            />
            <Field
              label="Professional Tax (₹)"
              id="pt"
              type="number"
              step="0.01"
              value={form.professionalTax}
              onChange={set("professionalTax")}
              placeholder="0.00"
            />
            <Field
              label="Total Deductions (Auto)"
              id="totalDeductions"
              readOnly
              displayValue={`₹${totalDeductions.toFixed(2)}`}
            />
          </div>

          <Separator className="my-5" />

          {/* ── Summary ── */}
          <SectionTitle title="Summary" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field
              label="Employers Contribution EPF & ESIC (₹)"
              id="epfEsic"
              type="number"
              step="0.01"
              value={form.employersContributionEPFESIC}
              onChange={set("employersContributionEPFESIC")}
              placeholder="0.00"
            />
            <Field
              label="Net Amount in Bank (Auto)"
              id="netAmount"
              readOnly
              displayValue={`₹${netAmount.toFixed(2)}`}
            />
          </div>

          {/* Amount in Words */}
          <div className="mt-4 flex flex-col gap-1.5">
            <Label
              htmlFor="amtWords"
              className="text-xs font-medium"
              style={{ color: "oklch(0.50 0.015 250)" }}
            >
              Amount in Words{" "}
              <span
                className="font-semibold"
                style={{ color: "oklch(0.28 0.08 250)" }}
              >
                (Auto)
              </span>
            </Label>
            <Input
              id="amtWords"
              value={form.amountInWords}
              onChange={set("amountInWords")}
              placeholder="Auto-generated from Net Amount"
              className="h-9 text-sm font-medium"
              style={{ background: "oklch(0.96 0.006 250)" }}
            />
          </div>

          <Separator className="my-5" />

          {/* ── Signatory ── */}
          <SectionTitle title="Signatory" />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Signatory Name"
              id="sigName"
              value={form.signatoryName}
              onChange={set("signatoryName")}
              placeholder="Name of signatory"
            />
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signDate"
                className="text-xs font-medium"
                style={{ color: "oklch(0.50 0.015 250)" }}
              >
                Sign Date{" "}
                <span
                  className="font-semibold"
                  style={{ color: "oklch(0.28 0.08 250)" }}
                >
                  (Auto)
                </span>
              </Label>
              <Input
                id="signDate"
                value={form.signDate}
                onChange={set("signDate")}
                placeholder="DD-MM-YYYY HH:MM:SS"
                className="h-9 text-sm font-medium"
                style={{ background: "oklch(0.96 0.006 250)" }}
              />
            </div>
          </div>

          {/* ── Actions ── */}
          <div
            className="flex gap-3 mt-8 pt-4"
            style={{ borderTop: "1px solid oklch(0.90 0.006 250)" }}
          >
            <Button
              data-ocid="payslip_form.submit_button"
              onClick={handleSave}
              disabled={isSaving || !actor}
              className="gap-2 font-semibold px-6"
              style={{
                background: "oklch(0.28 0.08 250)",
                color: "oklch(0.98 0 0)",
                border: "none",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Payslip
                </>
              )}
            </Button>
            <Button
              data-ocid="payslip_form.cancel_button"
              variant="outline"
              onClick={() => {
                window.location.hash = "/dashboard";
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
