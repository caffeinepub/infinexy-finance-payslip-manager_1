import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  id: string;
}

// ── Print document styles (pure black & white) ────────────────────────────
const B = "1px solid #000";
const B2 = "2px solid #000";
const LIGHT = "#f0f0f0";
const WHITE = "#ffffff";

const cell: React.CSSProperties = {
  border: B,
  padding: "5px 8px",
  color: "#000",
  fontSize: "11px",
};
const cellBold: React.CSSProperties = {
  ...cell,
  fontWeight: 700,
};
const labelCell: React.CSSProperties = {
  ...cellBold,
  background: LIGHT,
  width: "18%",
  whiteSpace: "nowrap",
};

// ── Screen design constants ───────────────────────────────────────────────
const _NAV_BG = "oklch(0.22 0.05 250)";
const ACCENT = "oklch(0.48 0.10 195)";
const WHITE_TOKEN = "oklch(0.98 0 0)";
const TEXT_MAIN = "oklch(0.18 0.04 250)";
const TEXT_MID = "oklch(0.52 0.015 250)";
const BORDER = "oklch(0.88 0.006 250)";
const BG_PAGE = "oklch(0.97 0.003 250)";

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
        data-ocid="payslip_view.loading_state"
        className="min-h-screen flex items-center justify-center"
        style={{ background: BG_PAGE }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
          <p className="text-sm" style={{ color: TEXT_MID }}>
            Loading payslip…
          </p>
        </div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div
        data-ocid="payslip_view.error_state"
        className="min-h-screen flex items-center justify-center"
        style={{ background: BG_PAGE }}
      >
        <div className="text-center">
          <p style={{ color: TEXT_MID }}>Payslip not found.</p>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.hash = "/dashboard";
            }}
            style={{ background: ACCENT, color: WHITE_TOKEN, border: "none" }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const p = payslip;
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const earningsRows: Array<{
    label: string;
    grossPM: number;
    currentMonth: number;
  }> = [
    {
      label: "Basic",
      grossPM: p.earnings.basicGrossPM,
      currentMonth: p.earnings.basicCurrentMonth,
    },
    {
      label: "Mobile Allowance",
      grossPM: p.earnings.mobileAllowanceGrossPM,
      currentMonth: p.earnings.mobileAllowanceCurrentMonth,
    },
    {
      label: "Incentive",
      grossPM: p.earnings.statutoryBonusGrossPM,
      currentMonth: p.earnings.statutoryBonusCurrentMonth,
    },
  ];

  const totalGrossPM = p.totalEarningsGrossPM;
  const totalCurrentMonth = p.totalEarningsCurrentMonth;

  return (
    <div className="min-h-screen" style={{ background: BG_PAGE }}>
      {/* ── Top action bar (screen only) ── */}
      <div
        className="no-print"
        style={{
          background: "oklch(1 0 0)",
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="max-w-5xl mx-auto"
          style={{
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: back + title */}
          <div className="flex items-center gap-4">
            <Button
              data-ocid="payslip_view.back_button"
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.hash = "/dashboard";
              }}
              className="gap-2 text-sm font-medium -ml-1"
              style={{ color: TEXT_MAIN }}
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <span
              style={{
                height: 18,
                width: 1,
                background: BORDER,
                display: "inline-block",
              }}
            />
            <span
              className="text-sm font-medium font-heading hidden sm:inline"
              style={{ color: TEXT_MID }}
            >
              {p.employeeName} — {p.payPeriod.month} {p.payPeriod.year}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex gap-2">
            <Button
              data-ocid="payslip_view.edit_button"
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.hash = `/payslip/edit/${id}`;
              }}
              className="gap-2 h-8 text-sm"
              style={{ color: TEXT_MAIN, borderColor: BORDER }}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              data-ocid="payslip_view.print_button"
              size="sm"
              onClick={() => window.print()}
              className="gap-2 h-8 text-sm font-semibold"
              style={{ background: ACCENT, color: WHITE_TOKEN, border: "none" }}
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* ── Payslip Document ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div
          id="payslip-document"
          style={{
            background: WHITE,
            color: "#000",
            fontFamily: "'Arial', 'Helvetica', sans-serif",
            fontSize: "11px",
            border: B2,
            overflow: "hidden",
          }}
        >
          {/* ── Company Header ── */}
          <div
            style={{
              background: WHITE,
              padding: "16px 24px 12px",
              textAlign: "center",
              borderBottom: B2,
            }}
          >
            <img
              src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-2-1.jpeg"
              alt="Infinexy Finance Logo"
              style={{
                height: 70,
                width: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto 8px",
              }}
            />
            <p
              style={{
                color: "#000",
                fontSize: "18px",
                fontWeight: 900,
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              INFINEXY FINANCE
            </p>
            <p
              style={{
                color: "#555",
                fontSize: "10px",
                margin: 0,
                letterSpacing: "0.3px",
              }}
            >
              401,402 Galav Chamber Dairy Den Sayajigunj Vadodara Gujarat-390005
            </p>
          </div>

          {/* ── Pay Slip Title ── */}
          <div
            style={{
              background: LIGHT,
              padding: "8px 24px",
              textAlign: "center",
              borderBottom: B,
            }}
          >
            <p
              style={{
                color: "#000",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Pay Slip for the Month of {p.payPeriod.month} – {p.payPeriod.year}
            </p>
          </div>

          {/* ── Document body ── */}
          <div style={{ padding: "14px 16px 18px" }}>
            {/* Employee Info Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "12px",
              }}
            >
              <tbody>
                <tr>
                  <td style={labelCell}>Employee Name</td>
                  <td style={{ ...cellBold, width: "32%" }}>
                    {p.employeeName}
                  </td>
                  <td style={labelCell}>PAN No.</td>
                  <td style={{ ...cellBold, width: "32%" }}>{p.pan}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Employee ID</td>
                  <td style={cellBold}>{p.employeeId}</td>
                  <td style={labelCell}>Aadhar Number</td>
                  <td style={cellBold}>{p.pfAccountNumber}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Designation</td>
                  <td style={cellBold}>{p.designation}</td>
                  <td style={labelCell}>Location</td>
                  <td style={cellBold}>{p.location}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Business Unit</td>
                  <td style={cellBold}>{p.businessUnit}</td>
                  <td style={labelCell}>Date of Birth</td>
                  <td style={cellBold}>{p.dateOfBirth}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Date of Joining</td>
                  <td style={cellBold}>{p.dateOfJoining}</td>
                  <td style={cell} />
                  <td style={cell} />
                </tr>
                <tr>
                  <td style={labelCell}>Days Paid</td>
                  <td style={cellBold}>{p.daysPaid.toString()}</td>
                  <td style={cell} />
                  <td style={cell} />
                </tr>
              </tbody>
            </table>

            {/* Salary Details header */}
            <div
              style={{
                background: "#000",
                color: WHITE,
                fontWeight: 800,
                fontSize: "12px",
                letterSpacing: "1px",
                padding: "6px 10px",
                textTransform: "uppercase",
              }}
            >
              Salary Details
            </div>

            {/* Earnings Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: LIGHT }}>
                  <th
                    style={{
                      ...cellBold,
                      textAlign: "left",
                      width: "40%",
                      background: LIGHT,
                    }}
                  >
                    Particulars
                  </th>
                  <th
                    style={{
                      ...cellBold,
                      textAlign: "right",
                      width: "30%",
                      background: LIGHT,
                    }}
                  >
                    Actual Amount
                  </th>
                  <th
                    style={{
                      ...cellBold,
                      textAlign: "right",
                      width: "30%",
                      background: LIGHT,
                    }}
                  >
                    Payable Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningsRows.map((row, idx) => (
                  <tr
                    key={row.label}
                    style={{ background: idx % 2 === 0 ? WHITE : "#fafafa" }}
                  >
                    <td style={cell}>{row.label}</td>
                    <td style={{ ...cell, textAlign: "right" }}>
                      {fmt(row.grossPM)}
                    </td>
                    <td
                      style={{ ...cell, textAlign: "right", fontWeight: 700 }}
                    >
                      {fmt(row.currentMonth)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#e8e8e8" }}>
                  <td
                    style={{
                      border: B2,
                      padding: "6px 8px",
                      fontWeight: 900,
                      fontSize: "11px",
                      color: "#000",
                    }}
                  >
                    Total Earnings
                  </td>
                  <td
                    style={{
                      border: B2,
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: 900,
                      fontSize: "11px",
                    }}
                  >
                    {fmt(totalGrossPM)}
                  </td>
                  <td
                    style={{
                      border: B2,
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: 900,
                      fontSize: "11px",
                    }}
                  >
                    {fmt(totalCurrentMonth)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Net Payable */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ background: WHITE }}>
                  <td
                    colSpan={3}
                    style={{
                      border: B2,
                      padding: "8px 10px",
                      fontWeight: 900,
                      fontSize: "12px",
                      color: "#000",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Net Payable{" "}
                    <span style={{ fontSize: "14px" }}>
                      ₹{fmt(p.netPayable)}
                    </span>
                    {p.amountInWords && (
                      <span
                        style={{
                          marginLeft: "16px",
                          fontWeight: 700,
                          fontSize: "11px",
                          color: "#333",
                        }}
                      >
                        {p.amountInWords}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Deductions Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              <thead>
                <tr style={{ background: LIGHT }}>
                  <th
                    style={{
                      ...cellBold,
                      textAlign: "left",
                      width: "70%",
                      background: LIGHT,
                    }}
                  >
                    Deductions – Particulars
                  </th>
                  <th
                    style={{
                      ...cellBold,
                      textAlign: "right",
                      width: "30%",
                      background: LIGHT,
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: WHITE }}>
                  <td style={cell}>Insurance</td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    {fmt(p.deductions.providentFund)}
                  </td>
                </tr>
                <tr style={{ background: "#fafafa" }}>
                  <td style={cell}>Profession Tax</td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    {fmt(p.deductions.professionTax)}
                  </td>
                </tr>
                <tr style={{ background: "#e8e8e8" }}>
                  <td
                    style={{
                      border: B2,
                      padding: "6px 8px",
                      fontWeight: 900,
                      fontSize: "11px",
                      color: "#000",
                    }}
                  >
                    Total Deductions
                  </td>
                  <td
                    style={{
                      border: B2,
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: 900,
                      fontSize: "11px",
                      color: "#000",
                    }}
                  >
                    {fmt(p.totalDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Payment Details */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                marginBottom: "14px",
              }}
            >
              <thead>
                <tr style={{ background: LIGHT }}>
                  <th
                    colSpan={4}
                    style={{
                      ...cellBold,
                      textAlign: "left",
                      background: LIGHT,
                    }}
                  >
                    Payment Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={labelCell}>Payment Mode</td>
                  <td style={{ ...cell, width: "32%" }}>{p.paymentMode}</td>
                  <td style={labelCell}>Bank Name</td>
                  <td style={{ ...cell, width: "32%" }}>{p.bankName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Account Number</td>
                  <td style={cell}>{p.accountNumber}</td>
                  <td style={labelCell}>IFSC Code</td>
                  <td style={cell}>{p.ifscCode}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer notice */}
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                color: "#555",
                fontStyle: "italic",
                padding: "6px 0 4px",
                borderTop: "1px dashed #bbb",
                borderBottom: "1px dashed #bbb",
                marginBottom: "10px",
              }}
            >
              This is a computerised document and does not require a signature.
            </div>

            {/* Sign Date */}
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
