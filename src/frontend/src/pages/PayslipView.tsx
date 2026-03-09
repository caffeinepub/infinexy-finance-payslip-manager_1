import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Payslip } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  id: string;
}

const B = "1px solid #000";
const B2 = "2px solid #000";
const LIGHT = "#f5f5f5";
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
        data-ocid="payslip_view.error_state"
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
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Earnings per row: only Actual Amount + Payable Amount (no arrear column)
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
          className="max-w-5xl mx-auto"
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
                color: "#444",
                fontSize: "11px",
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
              Pay slip for the month of {p.payPeriod.month}-{p.payPeriod.year}
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
                {/* Row 1 */}
                <tr>
                  <td style={labelCell}>Employee Name</td>
                  <td style={{ ...cellBold, width: "32%" }}>
                    {p.employeeName}
                  </td>
                  <td style={labelCell}>PAN No.</td>
                  <td style={{ ...cellBold, width: "32%" }}>{p.pan}</td>
                </tr>
                {/* Row 2 */}
                <tr>
                  <td style={labelCell}>Employee ID</td>
                  <td style={cellBold}>{p.employeeId}</td>
                  <td style={labelCell}>Aadhar Number</td>
                  <td style={cellBold}>{p.pfAccountNumber}</td>
                </tr>
                {/* Row 3 */}
                <tr>
                  <td style={labelCell}>Designation</td>
                  <td style={cellBold}>{p.designation}</td>
                  <td style={labelCell}>Location</td>
                  <td style={cellBold}>{p.location}</td>
                </tr>
                {/* Row 4 */}
                <tr>
                  <td style={labelCell}>Business Unit</td>
                  <td style={cellBold}>{p.businessUnit}</td>
                  <td style={labelCell}>Date of Birth</td>
                  <td style={cellBold}>{p.dateOfBirth}</td>
                </tr>
                {/* Row 5 */}
                <tr>
                  <td style={labelCell}>Date of Joining</td>
                  <td style={cellBold}>{p.dateOfJoining}</td>
                  <td style={cell} />
                  <td style={cell} />
                </tr>
                {/* Row 6 – Attendance */}
                <tr>
                  <td style={labelCell}>Days Paid</td>
                  <td style={cellBold}>{p.daysPaid.toString()}</td>
                  <td style={labelCell}>LOP Days</td>
                  <td style={cellBold}>{p.lopDays.toString()}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Arrear Days</td>
                  <td style={cellBold}>{p.arrearDays.toString()}</td>
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
                marginBottom: "0",
                textTransform: "uppercase",
              }}
            >
              Salary Details
            </div>

            {/* Earnings Table — 3 columns: Particulars | Actual Amount | Payable Amount */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0",
              }}
            >
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
                {/* Earnings Total row */}
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

            {/* Net Payable row */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0",
              }}
            >
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
              This is a computer generated payslip hence does not require any
              signature.
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
