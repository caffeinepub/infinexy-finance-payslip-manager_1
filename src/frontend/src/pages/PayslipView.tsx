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
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await actor.getPayslip(BigInt(id));
        if (!cancelled) setPayslip(data);
      } catch {
        if (!cancelled) toast.error("Failed to load payslip");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
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

  // B&W colour constants
  const border = "#000000";
  const lightBg = "#f2f2f2";
  const totalBg = "#e0e0e0";

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
          className="bg-white text-black text-sm"
          style={{
            fontFamily: "Arial, sans-serif",
            border: `2px solid ${border}`,
            overflow: "hidden",
          }}
        >
          {/* ── Company Header ── */}
          <div
            style={{
              background: "#ffffff",
              padding: "16px 24px 10px",
              textAlign: "center",
              borderBottom: `2px solid ${border}`,
            }}
          >
            <h1
              style={{
                color: "#000000",
                fontSize: "20px",
                fontWeight: "900",
                letterSpacing: "3px",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              INFINEXY FINANCE
            </h1>
            <p
              style={{
                color: "#333333",
                fontSize: "11px",
                margin: 0,
                letterSpacing: "0.4px",
              }}
            >
              401,402 Galav Chamber Dairy Den Sayajigunj Vadodara Gujarat-390005
            </p>
          </div>

          {/* ── Pay Slip Title Band ── */}
          <div
            style={{
              background: "#ffffff",
              padding: "7px 24px",
              textAlign: "center",
              borderBottom: `1px solid ${border}`,
            }}
          >
            <h2
              style={{
                color: "#000000",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: "0 0 2px",
              }}
            >
              PAY SLIP
            </h2>
            <p style={{ color: "#333333", fontSize: "11px", margin: 0 }}>
              for{" "}
              <strong style={{ color: "#000000" }}>
                {p.payPeriod.month}-{p.payPeriod.year}
              </strong>
            </p>
          </div>

          {/* ── Employee Name Banner ── */}
          <div
            style={{
              background: lightBg,
              borderBottom: `1px solid ${border}`,
              padding: "8px 24px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                color: "#000000",
                fontSize: "14px",
                fontWeight: "900",
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {p.employeeName}
            </h3>
          </div>

          {/* ── Document body ── */}
          <div style={{ padding: "14px 14px 18px" }}>
            {/* Employee Info Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: `1px solid ${border}`,
                marginBottom: "12px",
                fontSize: "11px",
              }}
            >
              <tbody>
                {(
                  [
                    [
                      "Employee Number",
                      p.employeeNumber,
                      "Tax Regime",
                      p.taxRegime,
                    ],
                    [
                      "Function",
                      p.functionRole,
                      "Income Tax Number (PAN)",
                      p.pan,
                    ],
                    [
                      "Designation",
                      p.designation,
                      "Universal Account Number (UAN)",
                      p.uan,
                    ],
                    [
                      "Location",
                      p.location,
                      "PF Account Number",
                      p.pfAccountNumber,
                    ],
                    ["Bank Details", p.bankDetails, "ESI Number", p.esiNumber],
                    [
                      "Date of Joining",
                      p.dateOfJoining,
                      "PR Account Number (PRAN)",
                      p.pran,
                    ],
                  ] as [string, string, string, string][]
                ).map(([label1, val1, label2, val2], idx) => (
                  <tr
                    key={label1}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f7f7f7",
                    }}
                  >
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "4px 8px",
                        width: "25%",
                        fontWeight: "700",
                        color: "#000000",
                      }}
                    >
                      {label1}
                    </td>
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "4px 8px",
                        width: "25%",
                        fontWeight: "700",
                        color: "#000000",
                      }}
                    >
                      : {val1}
                    </td>
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "4px 8px",
                        width: "25%",
                        fontWeight: "700",
                        color: "#000000",
                      }}
                    >
                      {label2}
                    </td>
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "4px 8px",
                        width: "25%",
                        fontWeight: "700",
                        color: "#000000",
                      }}
                    >
                      : {val2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Attendance + Leave Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: `1px solid ${border}`,
                marginBottom: "12px",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "800",
                      width: "33%",
                    }}
                  >
                    Attendance Details
                  </th>
                  <th
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "800",
                      width: "17%",
                    }}
                  >
                    Value
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "800",
                    }}
                  >
                    Leave Details (In Days)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Total Number of Days",
                    `${p.attendance.totalDays.toString()} Days`,
                    "Total Allow Leaves",
                    `: ${p.leave.totalAllowLeaves.toString()} Days`,
                  ],
                  [
                    "Present",
                    `${p.attendance.present.toString()} Days`,
                    "Used Leaves",
                    `: ${p.leave.usedLeaves.toString()} Days`,
                  ],
                  [
                    "Utilised Leave",
                    `${p.attendance.utilisedLeave.toString()} Days`,
                    "Balance Leaves",
                    `: ${p.leave.balanceLeaves.toString()} Days`,
                  ],
                  [
                    "Week Off",
                    `${p.attendance.weekOff.toString()} Days`,
                    "",
                    "",
                  ],
                  ["Overtime", String(p.attendance.overtimeHrs), "", ""],
                  [
                    "Weekly Off Overtime",
                    `${p.attendance.weeklyOffOvertimeDays.toString()} Day`,
                    "",
                    "",
                  ],
                ].map(([a, b, c, d], idx) => (
                  <tr
                    key={a || String(idx)}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f7f7f7",
                    }}
                  >
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "3px 8px",
                        fontWeight: "700",
                      }}
                    >
                      {a}
                    </td>
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "3px 8px",
                        fontWeight: "700",
                      }}
                    >
                      {b}
                    </td>
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "3px 8px",
                        fontWeight: "600",
                        color: "#333333",
                      }}
                    >
                      {c}
                    </td>
                    <td
                      style={{
                        border: `1px solid ${border}`,
                        padding: "3px 8px",
                        fontWeight: "700",
                      }}
                    >
                      {d}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Earnings + Deductions Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: `1px solid ${border}`,
                marginBottom: "12px",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "800",
                      width: "33%",
                    }}
                  >
                    Earnings
                  </th>
                  <th
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                      width: "17%",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "800",
                      width: "33%",
                    }}
                  >
                    Deductions
                  </th>
                  <th
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: `1px solid ${border}`,
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                      width: "17%",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr style={{ backgroundColor: "#ffffff" }}>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  >
                    Basic Pay
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                    }}
                  >
                    {fmt(p.earnings.basicPay)}
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  >
                    Employees ESI Deduction 0.75%
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                    }}
                  >
                    {fmt(p.deductions.employeeESIDeduction)}
                  </td>
                </tr>
                {/* Row 2 */}
                <tr style={{ backgroundColor: "#f7f7f7" }}>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  >
                    Overtime
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                    }}
                  >
                    {fmt(p.earnings.overtimeAmount)}
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  >
                    Professional Tax
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                    }}
                  >
                    {fmt(p.deductions.professionalTax)}
                  </td>
                </tr>
                {/* Row 3 */}
                <tr style={{ backgroundColor: "#ffffff" }}>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  >
                    Weekly Off Overtime
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                    }}
                  >
                    {fmt(p.earnings.weeklyOffOvertimeAmount)}
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  />
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  />
                </tr>
                {/* Row 4 */}
                <tr style={{ backgroundColor: "#f7f7f7" }}>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  >
                    Employer E.S.I @3.25%
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                    }}
                  >
                    {fmt(p.earnings.employerESI)}
                  </td>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  />
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  />
                </tr>

                {/* Total Row */}
                <tr style={{ backgroundColor: totalBg }}>
                  <td
                    style={{
                      border: `2px solid ${border}`,
                      padding: "5px 8px",
                      fontWeight: "900",
                      color: "#000000",
                    }}
                  >
                    Total Earnings
                  </td>
                  <td
                    style={{
                      border: `2px solid ${border}`,
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: "900",
                      color: "#000000",
                    }}
                  >
                    {fmt(totalEarnings)}
                  </td>
                  <td
                    style={{
                      border: `2px solid ${border}`,
                      padding: "5px 8px",
                      fontWeight: "900",
                      color: "#000000",
                    }}
                  >
                    Total Deductions
                  </td>
                  <td
                    style={{
                      border: `2px solid ${border}`,
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: "900",
                      color: "#000000",
                    }}
                  >
                    {fmt(totalDeductions)}
                  </td>
                </tr>

                {/* Employers Contribution Row */}
                <tr style={{ backgroundColor: "#ebebeb" }}>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  />
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                    }}
                  />
                  <td
                    style={{
                      border: `2px solid ${border}`,
                      padding: "5px 8px",
                      fontWeight: "800",
                      color: "#000000",
                    }}
                  >
                    Employers Contribution (EPF &amp; ESIC)
                  </td>
                  <td
                    style={{
                      border: `2px solid ${border}`,
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: "800",
                      color: "#000000",
                    }}
                  >
                    {fmt(p.employersContributionEPFESIC)}
                  </td>
                </tr>

                {/* Net Amount Row */}
                <tr>
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <td
                    style={{
                      border: `1px solid ${border}`,
                      padding: "3px 8px",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <td
                    style={{
                      background: "#ffffff",
                      border: `2px solid ${border}`,
                      padding: "8px 8px",
                      fontWeight: "900",
                      color: "#000000",
                      letterSpacing: "0.5px",
                      fontSize: "12px",
                    }}
                  >
                    Net Amount (in bank remittances)
                  </td>
                  <td
                    style={{
                      background: "#ffffff",
                      border: `2px solid ${border}`,
                      padding: "8px 8px",
                      textAlign: "right",
                      fontWeight: "900",
                      color: "#000000",
                      fontSize: "13px",
                    }}
                  >
                    {fmt(p.netAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in Words Banner */}
            {p.amountInWords && (
              <div
                style={{
                  background: "#f2f2f2",
                  border: `1px solid ${border}`,
                  padding: "7px 14px",
                  marginBottom: "14px",
                  fontSize: "11px",
                }}
              >
                <span
                  style={{
                    color: "#000000",
                    fontWeight: "900",
                    marginRight: "6px",
                  }}
                >
                  Amount (in words):
                </span>
                <span style={{ color: "#000000", fontWeight: "700" }}>
                  {p.amountInWords}
                </span>
              </div>
            )}

            {/* Computerised Document Notice */}
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                color: "#444444",
                fontStyle: "italic",
                marginBottom: "12px",
                padding: "4px 0",
                borderTop: "1px dashed #aaaaaa",
                borderBottom: "1px dashed #aaaaaa",
              }}
            >
              This is a computerised document and does not require a signature.
            </div>

            {/* Signatory Footer Strip (date only) */}
            {p.signDate && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "10px",
                  color: "#555555",
                }}
              >
                <span>
                  Date:{" "}
                  <strong style={{ color: "#000000" }}>{p.signDate}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
