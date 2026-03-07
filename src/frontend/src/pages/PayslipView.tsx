import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  id: string;
}

export default function PayslipView({ id }: Props) {
  const { actor } = useActor();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    const load = async () => {
      try {
        const data = await actor.getPayslip(BigInt(id));
        setPayslip(data);
      } catch {
        toast.error("Failed to load payslip");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actor, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Payslip not found.</p>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.hash = "/dashboard";
            }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const p = payslip;
  const totalEarnings =
    p.earnings.basicPay +
    p.earnings.overtimeAmount +
    p.earnings.weeklyOffOvertimeAmount +
    p.earnings.employerESI;
  const totalDeductions =
    p.deductions.employeeESIDeduction + p.deductions.professionalTax;

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Action Bar - hidden in print */}
      <div className="no-print bg-card border-b border-border shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Button
            data-ocid="payslip_view.back_button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = "/dashboard";
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div className="flex gap-2">
            <Button
              data-ocid="payslip_view.edit_button"
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.hash = `/payslip/edit/${id}`;
              }}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              data-ocid="payslip_view.print_button"
              size="sm"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Payslip Document */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div
          id="payslip-document"
          className="bg-white text-black border border-gray-300 p-8 font-sans text-sm"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Company Header */}
          <div className="text-center mb-2 flex justify-center">
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-1.jpeg"
              alt="Infinexy Finance"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="text-center mb-1">
            <p className="text-xs text-gray-600">
              401,402 Galav Chamber Dairy Den Sayajigunj Vadodara Gujarat-390005
            </p>
          </div>
          <div className="text-center mb-1">
            <h2 className="text-base font-bold">Pay Slip</h2>
            <p className="text-sm">
              for {p.payPeriod.month}-{p.payPeriod.year}
            </p>
          </div>

          <div className="text-center mt-4 mb-4">
            <h3 className="text-base font-bold uppercase underline tracking-wider">
              {p.employeeName}
            </h3>
          </div>

          {/* Employee Info Table */}
          <table className="w-full border-collapse border border-gray-400 mb-4 text-xs">
            <tbody>
              <tr>
                <td className="border border-gray-300 px-2 py-1 w-1/4 text-gray-600">
                  Employee Number
                </td>
                <td className="border border-gray-300 px-2 py-1 w-1/4">
                  : {p.employeeNumber}
                </td>
                <td className="border border-gray-300 px-2 py-1 w-1/4 text-gray-600">
                  Tax Regime
                </td>
                <td className="border border-gray-300 px-2 py-1 w-1/4">
                  : {p.taxRegime}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Function
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.functionRole}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Income Tax Number (PAN)
                </td>
                <td className="border border-gray-300 px-2 py-1">: {p.pan}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Designation
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.designation}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Universal Account Number (UAN)
                </td>
                <td className="border border-gray-300 px-2 py-1">: {p.uan}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Location
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.location}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  PF account number
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.pfAccountNumber}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Bank Details
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.bankDetails}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  ESI Number
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.esiNumber}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  Date of joining
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  : {p.dateOfJoining}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-gray-600">
                  PR Account Number (PRAN)
                </td>
                <td className="border border-gray-300 px-2 py-1">: {p.pran}</td>
              </tr>
            </tbody>
          </table>

          {/* Attendance + Leave Table */}
          <table className="w-full border-collapse border border-gray-400 mb-4 text-xs">
            <thead>
              <tr>
                <th className="border border-gray-400 px-2 py-1 text-left font-bold bg-gray-50 w-1/3">
                  Attendance Details
                </th>
                <th className="border border-gray-400 px-2 py-1 text-left font-bold bg-gray-50 w-1/6">
                  Value
                </th>
                <th
                  className="border border-gray-400 px-2 py-1 text-left font-bold bg-gray-50"
                  colSpan={2}
                >
                  Leave Details (In Days)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5 font-bold">
                  Total Number of Days
                </td>
                <td className="border border-gray-300 px-2 py-0.5 font-bold">
                  {p.attendance.totalDays.toString()} Days
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-gray-600">
                  Total Allow Leaves
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  : {p.leave.totalAllowLeaves.toString()} Days
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5 pl-6">
                  Present
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  {p.attendance.present.toString()} Days
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-gray-600">
                  Used Leaves
                </td>
                <td className="border border-gray-300 px-2 py-0.5 font-bold">
                  : {p.leave.usedLeaves.toString()} Days
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5 pl-6">
                  Utilised Leave
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  {p.attendance.utilisedLeave.toString()} Days
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-gray-600">
                  Balance Leaves
                </td>
                <td className="border border-gray-300 px-2 py-0.5 font-bold">
                  : {p.leave.balanceLeaves.toString()} Days
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5 pl-6">
                  Week Off
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  {p.attendance.weekOff.toString()} Days
                </td>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5">Overtime</td>
                <td className="border border-gray-300 px-2 py-0.5">
                  {p.attendance.overtimeHrs}
                </td>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5">
                  Weekly Off Overtime
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  {p.attendance.weeklyOffOvertimeDays.toString()} Day
                </td>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
              </tr>
            </tbody>
          </table>

          {/* Earnings + Deductions Table */}
          <table className="w-full border-collapse border border-gray-400 mb-4 text-xs">
            <thead>
              <tr>
                <th className="border border-gray-400 px-2 py-1 text-left font-bold bg-gray-50 w-1/3">
                  Earnings
                </th>
                <th className="border border-gray-400 px-2 py-1 text-right font-bold bg-gray-50 w-1/6">
                  Amount
                </th>
                <th className="border border-gray-400 px-2 py-1 text-left font-bold bg-gray-50 w-1/3">
                  Deductions
                </th>
                <th className="border border-gray-400 px-2 py-1 text-right font-bold bg-gray-50 w-1/6">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5">
                  Basic Pay
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-right">
                  {fmt(p.earnings.basicPay)}
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  Employees ESI Deduction 0.75%
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-right">
                  {fmt(p.deductions.employeeESIDeduction)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5">Overtime</td>
                <td className="border border-gray-300 px-2 py-0.5 text-right">
                  {fmt(p.earnings.overtimeAmount)}
                </td>
                <td className="border border-gray-300 px-2 py-0.5">
                  Professional Tax
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-right">
                  {fmt(p.deductions.professionalTax)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5">
                  Weekly Off Overtime
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-right">
                  {fmt(p.earnings.weeklyOffOvertimeAmount)}
                </td>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5">
                  Employer E.S.I @3.25%
                </td>
                <td className="border border-gray-300 px-2 py-0.5 text-right">
                  {fmt(p.earnings.employerESI)}
                </td>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
              </tr>
              <tr className="font-bold bg-gray-50">
                <td className="border border-gray-400 px-2 py-1">
                  Total Earnings
                </td>
                <td className="border border-gray-400 px-2 py-1 text-right">
                  {fmt(totalEarnings)}
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  Total Deductions
                </td>
                <td className="border border-gray-400 px-2 py-1 text-right">
                  {fmt(totalDeductions)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-400 px-2 py-1 font-bold">
                  Employers Contribution (EPF & ESIC)
                </td>
                <td className="border border-gray-400 px-2 py-1 text-right font-bold">
                  {fmt(p.employersContributionEPFESIC)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-300 px-2 py-0.5" />
                <td className="border border-gray-400 px-2 py-1 font-bold">
                  Net Amount (in bank remittances)
                </td>
                <td className="border border-gray-400 px-2 py-1 text-right font-bold">
                  {fmt(p.netAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in Words */}
          {p.amountInWords && (
            <div className="mb-6 text-xs">
              <span className="text-gray-600">Amount (in words): </span>
              <span>{p.amountInWords}</span>
            </div>
          )}

          {/* Signatory */}
          {(p.signatoryName || p.signDate) && (
            <div className="flex justify-end mt-4">
              <div className="text-right text-xs">
                {p.signatoryName && (
                  <p className="font-bold uppercase">{p.signatoryName}</p>
                )}
                {p.signDate && (
                  <p className="text-gray-500 text-xs">
                    Digitally signed on {p.signDate}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
