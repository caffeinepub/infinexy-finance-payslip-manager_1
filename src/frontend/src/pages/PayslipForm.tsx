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
  // Pay Period
  payMonth: string;
  payYear: string;
  // Employee Info
  employeeName: string;
  employeeId: string;
  designation: string;
  businessUnit: string;
  location: string;
  dateOfJoining: string;
  dateOfBirth: string;
  pan: string;
  pfAccountNumber: string;
  // Attendance
  daysPaid: string;
  lopDays: string;
  arrearDays: string;
  // Earnings (no arrear columns)
  basicGrossPM: string;
  basicCurrentMonth: string;
  mobileAllowanceGrossPM: string;
  mobileAllowanceCurrentMonth: string;
  statutoryBonusGrossPM: string;
  statutoryBonusCurrentMonth: string;
  // Deductions
  providentFund: string;
  professionTax: string;
  // Payment
  paymentMode: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  // Auto
  amountInWords: string;
  signDate: string;
}

const defaultForm: FormState = {
  payMonth: MONTHS[new Date().getMonth()],
  payYear: String(new Date().getFullYear()),
  employeeName: "",
  employeeId: "",
  designation: "",
  businessUnit: "",
  location: "",
  dateOfJoining: "",
  dateOfBirth: "",
  pan: "",
  pfAccountNumber: "",
  daysPaid: "",
  lopDays: "0",
  arrearDays: "0",
  basicGrossPM: "",
  basicCurrentMonth: "",
  mobileAllowanceGrossPM: "",
  mobileAllowanceCurrentMonth: "",
  statutoryBonusGrossPM: "",
  statutoryBonusCurrentMonth: "",
  providentFund: "0",
  professionTax: "0",
  paymentMode: "",
  accountNumber: "",
  bankName: "",
  ifscCode: "",
  amountInWords: "",
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

// Earnings table row input (2 data columns: Actual Amount + Payable Amount)
function EarningsRow({
  label,
  grossPMId,
  currentMonthId,
  grossPMVal,
  currentMonthVal,
  onGrossPM,
  onCurrentMonth,
}: {
  label: string;
  grossPMId: string;
  currentMonthId: string;
  grossPMVal: string;
  currentMonthVal: string;
  onGrossPM: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrentMonth: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <tr>
      <td
        className="text-sm py-2 px-3"
        style={{
          border: "1px solid oklch(0.88 0.008 250)",
          color: "oklch(0.28 0.06 250)",
        }}
      >
        {label}
      </td>
      <td style={{ border: "1px solid oklch(0.88 0.008 250)", padding: "4px" }}>
        <Input
          id={grossPMId}
          type="number"
          step="0.01"
          value={grossPMVal}
          onChange={onGrossPM}
          placeholder="0.00"
          className="h-8 text-sm text-right"
        />
      </td>
      <td style={{ border: "1px solid oklch(0.88 0.008 250)", padding: "4px" }}>
        <Input
          id={currentMonthId}
          type="number"
          step="0.01"
          value={currentMonthVal}
          onChange={onCurrentMonth}
          placeholder="0.00"
          className="h-8 text-sm text-right"
        />
      </td>
    </tr>
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
          payMonth: data.payPeriod.month,
          payYear: data.payPeriod.year,
          employeeName: data.employeeName,
          employeeId: data.employeeId,
          designation: data.designation,
          businessUnit: data.businessUnit,
          location: data.location,
          dateOfJoining: data.dateOfJoining,
          dateOfBirth: data.dateOfBirth,
          pan: data.pan,
          pfAccountNumber: data.pfAccountNumber,
          daysPaid: data.daysPaid.toString(),
          lopDays: data.lopDays.toString(),
          arrearDays: data.arrearDays.toString(),
          basicGrossPM: data.earnings.basicGrossPM.toFixed(2),
          basicCurrentMonth: data.earnings.basicCurrentMonth.toFixed(2),
          mobileAllowanceGrossPM:
            data.earnings.mobileAllowanceGrossPM.toFixed(2),
          mobileAllowanceCurrentMonth:
            data.earnings.mobileAllowanceCurrentMonth.toFixed(2),
          statutoryBonusGrossPM: data.earnings.statutoryBonusGrossPM.toFixed(2),
          statutoryBonusCurrentMonth:
            data.earnings.statutoryBonusCurrentMonth.toFixed(2),
          providentFund: data.deductions.providentFund.toFixed(2),
          professionTax: data.deductions.professionTax.toFixed(2),
          paymentMode: data.paymentMode,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          ifscCode: data.ifscCode,
          amountInWords: data.amountInWords,
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

  const n = (v: string) => Number.parseFloat(v) || 0;

  // Auto-computed totals
  const totalEarningsGrossPM =
    n(form.basicGrossPM) +
    n(form.mobileAllowanceGrossPM) +
    n(form.statutoryBonusGrossPM);

  const totalEarningsCurrentMonth =
    n(form.basicCurrentMonth) +
    n(form.mobileAllowanceCurrentMonth) +
    n(form.statutoryBonusCurrentMonth);

  const totalDeductions = n(form.providentFund) + n(form.professionTax);

  const netPayable = totalEarningsCurrentMonth - totalDeductions;

  // Auto-update amount in words when netPayable changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, amountInWords: numberToWords(netPayable) }));
  }, [netPayable]);

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
      const earnings = {
        basicGrossPM: n(form.basicGrossPM),
        basicCurrentMonth: n(form.basicCurrentMonth),
        basicArrear: 0,
        hraGrossPM: 0,
        hraCurrentMonth: 0,
        hraArrear: 0,
        specialAllowanceGrossPM: 0,
        specialAllowanceCurrentMonth: 0,
        specialAllowanceArrear: 0,
        mobileAllowanceGrossPM: n(form.mobileAllowanceGrossPM),
        mobileAllowanceCurrentMonth: n(form.mobileAllowanceCurrentMonth),
        mobileAllowanceArrear: 0,
        statutoryBonusGrossPM: n(form.statutoryBonusGrossPM),
        statutoryBonusCurrentMonth: n(form.statutoryBonusCurrentMonth),
        statutoryBonusArrear: 0,
      };
      const deductions = {
        providentFund: n(form.providentFund),
        professionTax: n(form.professionTax),
      };

      const commonArgs = [
        payPeriod,
        form.employeeName,
        form.employeeId,
        form.designation,
        "",
        "",
        form.businessUnit,
        form.location,
        form.dateOfJoining,
        form.dateOfBirth,
        form.pan,
        form.pfAccountNumber,
        "",
        BigInt(Number.parseInt(form.daysPaid) || 0),
        BigInt(Number.parseInt(form.lopDays) || 0),
        BigInt(Number.parseInt(form.arrearDays) || 0),
        earnings,
        deductions,
        totalEarningsGrossPM,
        totalEarningsCurrentMonth,
        0,
        totalDeductions,
        netPayable,
        form.amountInWords,
        form.paymentMode,
        form.accountNumber,
        form.bankName,
        form.ifscCode,
        form.signDate,
      ] as const;

      if (editId) {
        await actor.updatePayslip(BigInt(editId), ...commonArgs);
      } else {
        await actor.createPayslip(...commonArgs);
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

  const thStyle: React.CSSProperties = {
    background: "oklch(0.28 0.08 250)",
    color: "oklch(0.98 0 0)",
    fontWeight: 700,
    fontSize: "11px",
    padding: "8px 10px",
    textAlign: "left",
    letterSpacing: "0.04em",
    border: "1px solid oklch(0.22 0.07 250)",
  };

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
          className="max-w-5xl mx-auto px-4 sm:px-6"
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
                data-ocid="payslip_form.select"
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
              data-ocid="payslip_form.input"
              value={form.employeeName}
              onChange={set("employeeName")}
              placeholder="Full name"
            />
            <Field
              label="Employee ID"
              id="empId"
              value={form.employeeId}
              onChange={set("employeeId")}
              placeholder="e.g. EMP001"
            />
            <Field
              label="Designation"
              id="desig"
              value={form.designation}
              onChange={set("designation")}
              placeholder="e.g. Software Engineer"
            />
            <Field
              label="Business Unit"
              id="bu"
              value={form.businessUnit}
              onChange={set("businessUnit")}
              placeholder="e.g. Operations"
            />
            <Field
              label="Location"
              id="loc"
              value={form.location}
              onChange={set("location")}
              placeholder="Work location"
            />
            <Field
              label="Date of Joining"
              id="doj"
              value={form.dateOfJoining}
              onChange={set("dateOfJoining")}
              placeholder="e.g. 12-Jul-2021"
            />
            <Field
              label="Date of Birth"
              id="dob"
              value={form.dateOfBirth}
              onChange={set("dateOfBirth")}
              placeholder="e.g. 01-Oct-1998"
            />
            <Field
              label="PAN No."
              id="pan"
              value={form.pan}
              onChange={set("pan")}
              placeholder="PAN number"
            />
            <Field
              label="Aadhar Number"
              id="pf"
              value={form.pfAccountNumber}
              onChange={set("pfAccountNumber")}
              placeholder="Aadhar number"
            />
          </div>

          <Separator className="my-5" />

          {/* ── Attendance ── */}
          <SectionTitle title="Attendance" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field
              label="Days Paid"
              id="daysPaid"
              type="number"
              value={form.daysPaid}
              onChange={set("daysPaid")}
              placeholder="e.g. 26"
            />
            <Field
              label="LOP Days"
              id="lopDays"
              type="number"
              value={form.lopDays}
              onChange={set("lopDays")}
              placeholder="0"
            />
            <Field
              label="Arrear Days"
              id="arrearDays"
              type="number"
              value={form.arrearDays}
              onChange={set("arrearDays")}
              placeholder="0"
            />
          </div>

          <Separator className="my-5" />

          {/* ── Earnings ── */}
          <SectionTitle title="Salary – Earnings" />
          <div className="overflow-x-auto">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "40%" }}>Particulars</th>
                  <th style={{ ...thStyle, textAlign: "right", width: "30%" }}>
                    Actual Amount (₹)
                  </th>
                  <th style={{ ...thStyle, textAlign: "right", width: "30%" }}>
                    Payable Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <EarningsRow
                  label="Basic"
                  grossPMId="basicGrossPM"
                  currentMonthId="basicCurrentMonth"
                  grossPMVal={form.basicGrossPM}
                  currentMonthVal={form.basicCurrentMonth}
                  onGrossPM={set("basicGrossPM")}
                  onCurrentMonth={set("basicCurrentMonth")}
                />
                <EarningsRow
                  label="Mobile Allowance"
                  grossPMId="mobileAllowanceGrossPM"
                  currentMonthId="mobileAllowanceCurrentMonth"
                  grossPMVal={form.mobileAllowanceGrossPM}
                  currentMonthVal={form.mobileAllowanceCurrentMonth}
                  onGrossPM={set("mobileAllowanceGrossPM")}
                  onCurrentMonth={set("mobileAllowanceCurrentMonth")}
                />
                <EarningsRow
                  label="Incentive"
                  grossPMId="statutoryBonusGrossPM"
                  currentMonthId="statutoryBonusCurrentMonth"
                  grossPMVal={form.statutoryBonusGrossPM}
                  currentMonthVal={form.statutoryBonusCurrentMonth}
                  onGrossPM={set("statutoryBonusGrossPM")}
                  onCurrentMonth={set("statutoryBonusCurrentMonth")}
                />
                {/* Totals row */}
                <tr
                  style={{
                    background: "oklch(0.93 0.015 250)",
                    fontWeight: 700,
                  }}
                >
                  <td
                    className="text-sm py-2 px-3 font-bold"
                    style={{
                      border: "1px solid oklch(0.82 0.012 250)",
                      color: "oklch(0.18 0.08 250)",
                    }}
                  >
                    Total Earnings
                  </td>
                  <td
                    className="text-sm py-2 px-3 text-right font-bold"
                    style={{
                      border: "1px solid oklch(0.82 0.012 250)",
                      color: "oklch(0.18 0.08 250)",
                    }}
                  >
                    ₹{totalEarningsGrossPM.toFixed(2)}
                  </td>
                  <td
                    className="text-sm py-2 px-3 text-right font-bold"
                    style={{
                      border: "1px solid oklch(0.82 0.012 250)",
                      color: "oklch(0.18 0.08 250)",
                    }}
                  >
                    ₹{totalEarningsCurrentMonth.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Separator className="my-5" />

          {/* ── Deductions ── */}
          <SectionTitle title="Salary – Deductions" />
          <div className="overflow-x-auto">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "70%" }}>Particulars</th>
                  <th style={{ ...thStyle, textAlign: "right", width: "30%" }}>
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    className="text-sm py-2 px-3"
                    style={{
                      border: "1px solid oklch(0.88 0.008 250)",
                      color: "oklch(0.28 0.06 250)",
                    }}
                  >
                    Insurance
                  </td>
                  <td
                    style={{
                      border: "1px solid oklch(0.88 0.008 250)",
                      padding: "4px",
                    }}
                  >
                    <Input
                      id="providentFund"
                      type="number"
                      step="0.01"
                      value={form.providentFund}
                      onChange={set("providentFund")}
                      placeholder="0.00"
                      className="h-8 text-sm text-right"
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    className="text-sm py-2 px-3"
                    style={{
                      border: "1px solid oklch(0.88 0.008 250)",
                      color: "oklch(0.28 0.06 250)",
                    }}
                  >
                    Profession Tax
                  </td>
                  <td
                    style={{
                      border: "1px solid oklch(0.88 0.008 250)",
                      padding: "4px",
                    }}
                  >
                    <Input
                      id="professionTax"
                      type="number"
                      step="0.01"
                      value={form.professionTax}
                      onChange={set("professionTax")}
                      placeholder="0.00"
                      className="h-8 text-sm text-right"
                    />
                  </td>
                </tr>
                {/* Total deductions row */}
                <tr style={{ background: "oklch(0.93 0.015 250)" }}>
                  <td
                    className="text-sm py-2 px-3 font-bold"
                    style={{
                      border: "1px solid oklch(0.82 0.012 250)",
                      color: "oklch(0.18 0.08 250)",
                    }}
                  >
                    Total Deductions
                  </td>
                  <td
                    className="text-sm py-2 px-3 text-right font-bold"
                    style={{
                      border: "1px solid oklch(0.82 0.012 250)",
                      color: "oklch(0.18 0.08 250)",
                    }}
                  >
                    ₹{totalDeductions.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Separator className="my-5" />

          {/* ── Net Payable ── */}
          <SectionTitle title="Net Payable" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Net Payable (Auto)"
              id="netPayable"
              readOnly
              displayValue={`₹${netPayable.toFixed(2)}`}
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
              placeholder="Auto-generated from Net Payable"
              className="h-9 text-sm font-medium"
              style={{ background: "oklch(0.96 0.006 250)" }}
            />
          </div>

          <Separator className="my-5" />

          {/* ── Payment Details ── */}
          <SectionTitle title="Payment Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Payment Mode"
              id="paymentMode"
              value={form.paymentMode}
              onChange={set("paymentMode")}
              placeholder="e.g. Bank Transfer"
            />
            <Field
              label="Account Number"
              id="accountNumber"
              value={form.accountNumber}
              onChange={set("accountNumber")}
              placeholder="Bank account number"
            />
            <Field
              label="Bank Name"
              id="bankName"
              value={form.bankName}
              onChange={set("bankName")}
              placeholder="e.g. State Bank of India"
            />
            <Field
              label="IFSC Code"
              id="ifscCode"
              value={form.ifscCode}
              onChange={set("ifscCode")}
              placeholder="e.g. SBIN0001234"
            />
          </div>

          <Separator className="my-5" />

          {/* ── Sign Date ── */}
          <SectionTitle title="Sign Date" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
