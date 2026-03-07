import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend.d";
import { useActor } from "../hooks/useActor";

// ---------------------------------------------------------------------------
// Utility: convert a number to Indian-style words (handles paise)
// ---------------------------------------------------------------------------
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

function numToWordsBelow100(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ` ${ones[n % 10]}` : "");
}

function numToWordsBelow1000(n: number): string {
  if (n < 100) return numToWordsBelow100(n);
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` ${numToWordsBelow100(n % 100)}` : ""}`;
}

function numberToWords(amount: number): string {
  if (Number.isNaN(amount) || amount < 0) return "";
  const rupees = Math.floor(amount);
  const paiseRaw = Math.round((amount - rupees) * 100);
  const paise = paiseRaw > 99 ? 99 : paiseRaw;

  if (rupees === 0 && paise === 0) return "INR Zero Only";

  const parts: string[] = [];
  let rem = rupees;

  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const rest = rem;

  if (crore > 0) parts.push(`${numToWordsBelow1000(crore)} Crore`);
  if (lakh > 0) parts.push(`${numToWordsBelow1000(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${numToWordsBelow1000(thousand)} Thousand`);
  if (rest > 0) parts.push(numToWordsBelow1000(rest));

  let result = `INR ${parts.join(" ")}`;
  if (paise > 0) {
    result += ` and ${numToWordsBelow100(paise)} Paise`;
  }
  return `${result} Only`;
}

// Format current date-time as DD-MM-YYYY HH:MM:SS
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
  // Employee
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
  // Attendance
  totalDays: string;
  present: string;
  utilisedLeave: string;
  weekOff: string;
  overtimeHrs: string;
  weeklyOffOvertimeDays: string;
  // Leave
  totalAllowLeaves: string;
  usedLeaves: string;
  // Earnings
  basicPay: string;
  overtimeAmount: string;
  weeklyOffOvertimeAmount: string;
  employerESI: string;
  // Deductions
  employeeESIDeduction: string;
  professionalTax: string;
  // Extra
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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mt-6 mb-3 pl-3 border-l-4 border-primary">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

function Field({
  label,
  id,
  ...props
}: {
  label: string;
  id: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} {...props} className="h-9 text-sm" />
    </div>
  );
}

export default function PayslipForm({ editId }: Props) {
  const { actor, isFetching } = useActor();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) {
      setIsLoading(false);
      return;
    }
    if (!actor) return; // wait until actor is ready
    let cancelled = false;
    const load = async () => {
      try {
        const data: Payslip = await actor.getPayslip(BigInt(editId));
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
      } catch {
        if (!cancelled) toast.error("Failed to load payslip");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [editId, actor]);

  const update =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // Computed values
  const bp = Number.parseFloat(form.basicPay) || 0;
  const ot = Number.parseFloat(form.overtimeAmount) || 0;
  const wot = Number.parseFloat(form.weeklyOffOvertimeAmount) || 0;
  const empESI = Number.parseFloat(form.employerESI) || 0;
  const totalEarnings = bp + ot + wot + empESI;

  const esiDed = Number.parseFloat(form.employeeESIDeduction) || 0;
  const pt = Number.parseFloat(form.professionalTax) || 0;
  const totalDeductions = esiDed + pt;

  const epfEsic = Number.parseFloat(form.employersContributionEPFESIC) || 0;
  const netAmount = totalEarnings - totalDeductions;

  // Auto-update Amount in Words whenever netAmount changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, amountInWords: numberToWords(netAmount) }));
  }, [netAmount]);

  const balanceLeaves =
    (Number.parseInt(form.totalAllowLeaves) || 0) -
    (Number.parseInt(form.usedLeaves) || 0);

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
        balanceLeaves: BigInt(balanceLeaves < 0 ? 0 : balanceLeaves),
      };
      const earnings = {
        basicPay: bp,
        overtimeAmount: ot,
        weeklyOffOvertimeAmount: wot,
        employerESI: empESI,
      };
      const deductions = {
        employeeESIDeduction: esiDed,
        professionalTax: pt,
      };

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
      console.error("Payslip save error:", err);
      if (
        msg.includes("not registered") ||
        msg.includes("Unauthorized") ||
        msg.includes("not authorized")
      ) {
        toast.error("Not authorized. Please refresh the page and try again.");
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-primary-foreground/70 hidden sm:block">
              Payslip Manager
            </p>
          </div>
          <Button
            data-ocid="payslip_form.cancel_button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = "/dashboard";
            }}
            className="gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-heading text-primary">
            {editId ? "Edit Payslip" : "New Payslip"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Fill in the employee details and salary information below.
          </p>
        </div>

        {isFetching && (
          <div
            data-ocid="payslip_form.loading_state"
            className="mb-4 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Connecting to the network… Save will be available shortly.
          </div>
        )}

        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-2">
            {/* Pay Period */}
            <SectionTitle title="Pay Period" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Month</Label>
                <select
                  className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background text-foreground"
                  value={form.payMonth}
                  onChange={update("payMonth")}
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
                onChange={update("payYear")}
                placeholder="e.g. 2025"
              />
            </div>

            {/* Employee Info */}
            <SectionTitle title="Employee Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Employee Name *"
                id="empName"
                value={form.employeeName}
                onChange={update("employeeName")}
                placeholder="Full name"
              />
              <Field
                label="Employee Number"
                id="empNum"
                value={form.employeeNumber}
                onChange={update("employeeNumber")}
                placeholder="e.g. 044"
              />
              <Field
                label="Function / Role"
                id="funcRole"
                value={form.functionRole}
                onChange={update("functionRole")}
                placeholder="e.g. Flight Ticket Booking"
              />
              <Field
                label="Designation"
                id="desig"
                value={form.designation}
                onChange={update("designation")}
                placeholder="e.g. INTERNATIONAL BOOKING"
              />
              <Field
                label="Location"
                id="loc"
                value={form.location}
                onChange={update("location")}
                placeholder="Work location"
              />
              <Field
                label="Bank Details"
                id="bank"
                value={form.bankDetails}
                onChange={update("bankDetails")}
                placeholder="Bank account / details"
              />
              <Field
                label="Date of Joining"
                id="doj"
                value={form.dateOfJoining}
                onChange={update("dateOfJoining")}
                placeholder="e.g. 6-May-24"
              />
              <Field
                label="Tax Regime"
                id="taxRegime"
                value={form.taxRegime}
                onChange={update("taxRegime")}
                placeholder="e.g. Regular Tax Regime"
              />
              <Field
                label="PAN (Income Tax Number)"
                id="pan"
                value={form.pan}
                onChange={update("pan")}
                placeholder="PAN number"
              />
              <Field
                label="UAN (Universal Account Number)"
                id="uan"
                value={form.uan}
                onChange={update("uan")}
                placeholder="UAN number"
              />
              <Field
                label="PF Account Number"
                id="pf"
                value={form.pfAccountNumber}
                onChange={update("pfAccountNumber")}
                placeholder="PF account number"
              />
              <Field
                label="ESI Number"
                id="esi"
                value={form.esiNumber}
                onChange={update("esiNumber")}
                placeholder="ESI number"
              />
              <Field
                label="PRAN (PR Account Number)"
                id="pran"
                value={form.pran}
                onChange={update("pran")}
                placeholder="PRAN number"
              />
            </div>

            <Separator className="my-4" />

            {/* Attendance */}
            <SectionTitle title="Attendance Details" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field
                label="Total Number of Days"
                id="totalDays"
                type="number"
                value={form.totalDays}
                onChange={update("totalDays")}
                placeholder="30"
              />
              <Field
                label="Present"
                id="present"
                type="number"
                value={form.present}
                onChange={update("present")}
                placeholder="Days present"
              />
              <Field
                label="Utilised Leave"
                id="utilisedLeave"
                type="number"
                value={form.utilisedLeave}
                onChange={update("utilisedLeave")}
                placeholder="Leave days used"
              />
              <Field
                label="Week Off"
                id="weekOff"
                type="number"
                value={form.weekOff}
                onChange={update("weekOff")}
                placeholder="Week off days"
              />
              <Field
                label="Overtime (Hrs)"
                id="otHrs"
                value={form.overtimeHrs}
                onChange={update("overtimeHrs")}
                placeholder="e.g. 33-57.00 Hrs"
              />
              <Field
                label="Weekly Off Overtime (Days)"
                id="wotDays"
                type="number"
                value={form.weeklyOffOvertimeDays}
                onChange={update("weeklyOffOvertimeDays")}
                placeholder="Days"
              />
            </div>

            <Separator className="my-4" />

            {/* Leave */}
            <SectionTitle title="Leave Details (In Days)" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field
                label="Total Allow Leaves"
                id="totalLeaves"
                type="number"
                value={form.totalAllowLeaves}
                onChange={update("totalAllowLeaves")}
                placeholder="Total"
              />
              <Field
                label="Used Leaves"
                id="usedLeaves"
                type="number"
                value={form.usedLeaves}
                onChange={update("usedLeaves")}
                placeholder="Used"
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Balance Leaves (Auto)
                </Label>
                <div className="h-9 px-3 flex items-center bg-secondary rounded-md text-sm font-medium text-secondary-foreground">
                  {balanceLeaves < 0 ? 0 : balanceLeaves} Days
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Earnings */}
            <SectionTitle title="Earnings" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field
                label="Basic Pay (₹)"
                id="basicPay"
                type="number"
                step="0.01"
                value={form.basicPay}
                onChange={update("basicPay")}
                placeholder="0.00"
              />
              <Field
                label="Overtime Amount (₹)"
                id="otAmt"
                type="number"
                step="0.01"
                value={form.overtimeAmount}
                onChange={update("overtimeAmount")}
                placeholder="0.00"
              />
              <Field
                label="Weekly Off Overtime Amount (₹)"
                id="wotAmt"
                type="number"
                step="0.01"
                value={form.weeklyOffOvertimeAmount}
                onChange={update("weeklyOffOvertimeAmount")}
                placeholder="0.00"
              />
              <Field
                label="Employer E.S.I @3.25% (₹)"
                id="empESI"
                type="number"
                step="0.01"
                value={form.employerESI}
                onChange={update("employerESI")}
                placeholder="0.00"
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Total Earnings (Auto)
                </Label>
                <div className="h-9 px-3 flex items-center bg-primary/10 rounded-md text-sm font-bold text-primary">
                  ₹{totalEarnings.toFixed(2)}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Deductions */}
            <SectionTitle title="Deductions" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field
                label="Employees ESI Deduction 0.75% (₹)"
                id="esiDed"
                type="number"
                step="0.01"
                value={form.employeeESIDeduction}
                onChange={update("employeeESIDeduction")}
                placeholder="0.00"
              />
              <Field
                label="Professional Tax (₹)"
                id="pt"
                type="number"
                step="0.01"
                value={form.professionalTax}
                onChange={update("professionalTax")}
                placeholder="0.00"
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Total Deductions (Auto)
                </Label>
                <div className="h-9 px-3 flex items-center bg-destructive/10 rounded-md text-sm font-bold text-destructive">
                  ₹{totalDeductions.toFixed(2)}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Summary */}
            <SectionTitle title="Summary" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field
                label="Employers Contribution EPF & ESIC (₹)"
                id="epfEsic"
                type="number"
                step="0.01"
                value={form.employersContributionEPFESIC}
                onChange={update("employersContributionEPFESIC")}
                placeholder="0.00"
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Net Amount in Bank (Auto)
                </Label>
                <div className="h-9 px-3 flex items-center bg-accent/15 rounded-md text-sm font-bold text-accent-foreground border border-accent/30">
                  ₹{netAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label
                htmlFor="amtWords"
                className="text-xs text-muted-foreground"
              >
                Amount in Words{" "}
                <span className="text-primary font-medium">(Auto)</span>
              </Label>
              <Input
                id="amtWords"
                value={form.amountInWords}
                onChange={update("amountInWords")}
                placeholder="Auto-generated from Net Amount"
                className="text-sm bg-primary/5 font-medium"
              />
            </div>

            <Separator className="my-4" />

            {/* Signatory */}
            <SectionTitle title="Signatory" />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Signatory Name"
                id="sigName"
                value={form.signatoryName}
                onChange={update("signatoryName")}
                placeholder="Name of signatory"
              />
              <div className="space-y-1.5">
                <Label
                  htmlFor="signDate"
                  className="text-xs text-muted-foreground"
                >
                  Sign Date{" "}
                  <span className="text-primary font-medium">(Auto)</span>
                </Label>
                <Input
                  id="signDate"
                  value={form.signDate}
                  onChange={update("signDate")}
                  placeholder="DD-MM-YYYY HH:MM:SS"
                  className="h-9 text-sm bg-primary/5 font-medium"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6">
              <Button
                data-ocid="payslip_form.submit_button"
                onClick={handleSave}
                disabled={isSaving || !actor}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Payslip
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.hash = "/dashboard";
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
