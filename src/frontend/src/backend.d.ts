import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Payslip {
    pan: string;
    uan: string;
    payPeriod: PayPeriod;
    payslipId: bigint;
    netAmount: number;
    totalDeductions: number;
    signatoryName: string;
    employeeName: string;
    functionRole: string;
    ownerId: Principal;
    bankDetails: string;
    designation: string;
    createdAt: bigint;
    pran: string;
    deductions: Deductions;
    employersContributionEPFESIC: number;
    signDate: string;
    leave: Leave;
    dateOfJoining: string;
    earnings: Earnings;
    employeeNumber: string;
    attendance: Attendance;
    totalEarnings: number;
    pfAccountNumber: string;
    esiNumber: string;
    location: string;
    taxRegime: string;
    amountInWords: string;
}
export interface PayslipSummary {
    payPeriod: PayPeriod;
    payslipId: bigint;
    netAmount: number;
    employeeName: string;
}
export interface Attendance {
    overtimeHrs: string;
    weekOff: bigint;
    present: bigint;
    weeklyOffOvertimeDays: bigint;
    utilisedLeave: bigint;
    totalDays: bigint;
}
export interface Leave {
    usedLeaves: bigint;
    balanceLeaves: bigint;
    totalAllowLeaves: bigint;
}
export interface Deductions {
    employeeESIDeduction: number;
    professionalTax: number;
}
export interface PayPeriod {
    month: string;
    year: string;
}
export interface Earnings {
    overtimeAmount: number;
    basicPay: number;
    weeklyOffOvertimeAmount: number;
    employerESI: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPayslip(payPeriod: PayPeriod, employeeName: string, employeeNumber: string, functionRole: string, designation: string, location: string, bankDetails: string, dateOfJoining: string, taxRegime: string, pan: string, uan: string, pfAccountNumber: string, esiNumber: string, pran: string, attendance: Attendance, leave: Leave, earnings: Earnings, deductions: Deductions, totalEarnings: number, totalDeductions: number, employersContributionEPFESIC: number, netAmount: number, amountInWords: string, signatoryName: string, signDate: string): Promise<void>;
    deletePayslip(payslipId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyPayslips(): Promise<Array<PayslipSummary>>;
    getPayslip(payslipId: bigint): Promise<Payslip>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePayslip(payslipId: bigint, payPeriod: PayPeriod, employeeName: string, employeeNumber: string, functionRole: string, designation: string, location: string, bankDetails: string, dateOfJoining: string, taxRegime: string, pan: string, uan: string, pfAccountNumber: string, esiNumber: string, pran: string, attendance: Attendance, leave: Leave, earnings: Earnings, deductions: Deductions, totalEarnings: number, totalDeductions: number, employersContributionEPFESIC: number, netAmount: number, amountInWords: string, signatoryName: string, signDate: string): Promise<void>;
}
