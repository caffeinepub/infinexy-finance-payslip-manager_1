import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  id: string;
}

const BORDER = "1px solid #000";
const BORDER2 = "2px solid #000";
const LIGHT = "#f2f2f2";
const TOTAL = "#e0e0e0";
const WHITE = "#ffffff";

const td: React.CSSProperties = {
  border: BORDER,
  padding: "4px 8px",
  color: "#000",
};

const tdBold: React.CSSProperties = {
  ...td,
  fontWeight: 700,
};

export default function PayslipView({ id }: Props) {
  const { actor } = useActor();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    let cancelled = false;
    setLoading(true);

    actor
      .getPayslip(BigInt(id))
      .then((data) => {
        if (!cancelled) setPayslip(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load payslip");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, id]);

  if (loading) {
    return (
      <div
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

  if (!payslip) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.975 0.005 80)" }}
      >
        <div className="text-center">
          <p style={{ color: "oklch(0.55 0.015 250)" }}>Payslip not found.</p>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.hash = "/dashboard";
            }}
            style={{
              background: "oklch(0.28 0.08 250)",
              color: "oklch(0.98 0 0)",
              border: "none",
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

  const employeeInfoRows: [string, string, string, string][] = [
    ["Employee Number", p.employeeNumber, "Tax Regime", p.taxRegime],
    ["Function", p.functionRole, "Income Tax Number (PAN)", p.pan],
    ["Designation", p.designation, "Universal Account Number (UAN)", p.uan],
    ["Location", p.location, "PF Account Number", p.pfAccountNumber],
    ["Bank Details", p.bankDetails, "ESI Number", p.esiNumber],
    ["Date of Joining", p.dateOfJoining, "PR Account Number (PRAN)", p.pran],
  ];

  const attendanceRows: [string, string, string, string][] = [
    [
      "Total Number of Days",
      `${p.attendance.totalDays} Days`,
      "Total Allow Leaves",
      `${p.leave.totalAllowLeaves} Days`,
    ],
    [
      "Present",
      `${p.attendance.present} Days`,
      "Used Leaves",
      `${p.leave.usedLeaves} Days`,
    ],
    [
      "Utilised Leave",
      `${p.attendance.utilisedLeave} Days`,
      "Balance Leaves",
      `${p.leave.balanceLeaves} Days`,
    ],
    ["Week Off", `${p.attendance.weekOff} Days`, "", ""],
    ["Overtime", p.attendance.overtimeHrs, "", ""],
    [
      "Weekly Off Overtime",
      `${p.attendance.weeklyOffOvertimeDays} Day`,
      "",
      "",
    ],
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.975 0.005 80)" }}
    >
      {/* Top action bar (no-print) */}
      <div
        className="no-print"
        style={{
          background: "oklch(1 0 0)",
          borderBottom: "1px solid oklch(0.88 0.008 250)",
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6"
          style={{
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
              style={{
                background: "oklch(0.28 0.08 250)",
                color: "oklch(0.98 0 0)",
                border: "none",
              }}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Payslip document */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div
          id="payslip-document"
          style={{
            background: WHITE,
            color: "#000",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "11px",
            border: BORDER2,
            overflow: "hidden",
          }}
        >
          {/* ── Company Header ── */}
          <div
            style={{
              background: WHITE,
              padding: "16px 24px 10px",
              textAlign: "center",
              borderBottom: BORDER2,
            }}
          >
            <h1
              style={{
                color: "#000",
                fontSize: "20px",
                fontWeight: 900,
                letterSpacing: "3px",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              INFINEXY FINANCE
            </h1>
            <p
              style={{
                color: "#333",
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
              background: WHITE,
              padding: "7px 24px",
              textAlign: "center",
              borderBottom: BORDER,
            }}
          >
            <h2
              style={{
                color: "#000",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: "0 0 2px",
              }}
            >
              PAY SLIP
            </h2>
            <p style={{ color: "#333", fontSize: "11px", margin: 0 }}>
              for{" "}
              <strong style={{ color: "#000" }}>
                {p.payPeriod.month}-{p.payPeriod.year}
              </strong>
            </p>
          </div>

          {/* ── Employee Name Banner ── */}
          <div
            style={{
              background: LIGHT,
              borderBottom: BORDER,
              padding: "8px 24px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                color: "#000",
                fontSize: "13px",
                fontWeight: 900,
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
                border: BORDER,
                marginBottom: "12px",
                fontSize: "11px",
              }}
            >
              <tbody>
                {employeeInfoRows.map(([l1, v1, l2, v2], idx) => (
                  <tr
                    key={l1}
                    style={{
                      backgroundColor: idx % 2 === 0 ? WHITE : "#f7f7f7",
                    }}
                  >
                    <td style={{ ...tdBold, width: "25%" }}>{l1}</td>
                    <td style={{ ...tdBold, width: "25%" }}>: {v1}</td>
                    <td style={{ ...tdBold, width: "25%" }}>{l2}</td>
                    <td style={{ ...tdBold, width: "25%" }}>: {v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Attendance + Leave Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: BORDER,
                marginBottom: "12px",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...tdBold,
                      width: "33%",
                      background: WHITE,
                      textAlign: "left",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Attendance Details
                  </th>
                  <th
                    style={{
                      ...tdBold,
                      width: "17%",
                      background: WHITE,
                      textAlign: "left",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Value
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      ...tdBold,
                      background: WHITE,
                      textAlign: "left",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Leave Details (In Days)
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map(([a, b, c, d], idx) => (
                  <tr
                    key={a || String(idx)}
                    style={{
                      backgroundColor: idx % 2 === 0 ? WHITE : "#f7f7f7",
                    }}
                  >
                    <td style={tdBold}>{a}</td>
                    <td style={tdBold}>{b}</td>
                    <td style={{ ...td, fontWeight: 600, color: "#333" }}>
                      {c}
                    </td>
                    <td style={tdBold}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Earnings + Deductions Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: BORDER,
                marginBottom: "12px",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...tdBold,
                      width: "33%",
                      background: WHITE,
                      textAlign: "left",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Earnings
                  </th>
                  <th
                    style={{
                      ...tdBold,
                      width: "17%",
                      background: WHITE,
                      textAlign: "right",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      ...tdBold,
                      width: "33%",
                      background: WHITE,
                      textAlign: "left",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Deductions
                  </th>
                  <th
                    style={{
                      ...tdBold,
                      width: "17%",
                      background: WHITE,
                      textAlign: "right",
                      fontWeight: 800,
                      padding: "6px 8px",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: WHITE }}>
                  <td style={td}>Basic Pay</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>
                    {fmt(p.earnings.basicPay)}
                  </td>
                  <td style={td}>Employees ESI Deduction 0.75%</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>
                    {fmt(p.deductions.employeeESIDeduction)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#f7f7f7" }}>
                  <td style={td}>Overtime</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>
                    {fmt(p.earnings.overtimeAmount)}
                  </td>
                  <td style={td}>Professional Tax</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>
                    {fmt(p.deductions.professionalTax)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: WHITE }}>
                  <td style={td}>Weekly Off Overtime</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>
                    {fmt(p.earnings.weeklyOffOvertimeAmount)}
                  </td>
                  <td style={td} />
                  <td style={td} />
                </tr>
                <tr style={{ backgroundColor: "#f7f7f7" }}>
                  <td style={td}>Employer E.S.I @3.25%</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 800 }}>
                    {fmt(p.earnings.employerESI)}
                  </td>
                  <td style={td} />
                  <td style={td} />
                </tr>

                {/* Totals row */}
                <tr style={{ backgroundColor: TOTAL }}>
                  <td
                    style={{
                      border: BORDER2,
                      padding: "5px 8px",
                      fontWeight: 900,
                      color: "#000",
                    }}
                  >
                    Total Earnings
                  </td>
                  <td
                    style={{
                      border: BORDER2,
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: 900,
                      color: "#000",
                    }}
                  >
                    {fmt(totalEarnings)}
                  </td>
                  <td
                    style={{
                      border: BORDER2,
                      padding: "5px 8px",
                      fontWeight: 900,
                      color: "#000",
                    }}
                  >
                    Total Deductions
                  </td>
                  <td
                    style={{
                      border: BORDER2,
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: 900,
                      color: "#000",
                    }}
                  >
                    {fmt(totalDeductions)}
                  </td>
                </tr>

                {/* Employers contribution row */}
                <tr style={{ backgroundColor: "#ebebeb" }}>
                  <td style={{ border: BORDER, padding: "3px 8px" }} />
                  <td style={{ border: BORDER, padding: "3px 8px" }} />
                  <td
                    style={{
                      border: BORDER2,
                      padding: "5px 8px",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    Employers Contribution (EPF &amp; ESIC)
                  </td>
                  <td
                    style={{
                      border: BORDER2,
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: 800,
                      color: "#000",
                    }}
                  >
                    {fmt(p.employersContributionEPFESIC)}
                  </td>
                </tr>

                {/* Net Amount row */}
                <tr>
                  <td
                    style={{
                      border: BORDER,
                      padding: "3px 8px",
                      backgroundColor: WHITE,
                    }}
                  />
                  <td
                    style={{
                      border: BORDER,
                      padding: "3px 8px",
                      backgroundColor: WHITE,
                    }}
                  />
                  <td
                    style={{
                      background: WHITE,
                      border: BORDER2,
                      padding: "8px 8px",
                      fontWeight: 900,
                      color: "#000",
                      letterSpacing: "0.5px",
                      fontSize: "12px",
                    }}
                  >
                    Net Amount (in bank remittances)
                  </td>
                  <td
                    style={{
                      background: WHITE,
                      border: BORDER2,
                      padding: "8px 8px",
                      textAlign: "right",
                      fontWeight: 900,
                      color: "#000",
                      fontSize: "13px",
                    }}
                  >
                    {fmt(p.netAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in Words */}
            {p.amountInWords && (
              <div
                style={{
                  background: LIGHT,
                  border: BORDER,
                  padding: "7px 14px",
                  marginBottom: "14px",
                  fontSize: "11px",
                }}
              >
                <span
                  style={{ color: "#000", fontWeight: 900, marginRight: 6 }}
                >
                  Amount (in words):
                </span>
                <span style={{ color: "#000", fontWeight: 700 }}>
                  {p.amountInWords}
                </span>
              </div>
            )}

            {/* Computerised notice */}
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                color: "#444",
                fontStyle: "italic",
                marginBottom: "12px",
                padding: "4px 0",
                borderTop: "1px dashed #aaa",
                borderBottom: "1px dashed #aaa",
              }}
            >
              This is a computerised document and does not require a signature.
            </div>

            {/* Date footer */}
            {p.signDate && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "10px",
                  color: "#555",
                }}
              >
                <span>
                  Date: <strong style={{ color: "#000" }}>{p.signDate}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
