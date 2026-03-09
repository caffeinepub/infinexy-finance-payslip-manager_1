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
    totalDeductions: number;
    employeeName: string;
    totalEarningsCurrentMonth: number;
    totalEarningsGrossPM: number;
    ifscCode: string;
    ownerId: Principal;
    dateOfBirth: string;
    arrearDays: bigint;
    designation: string;
    createdAt: bigint;
    deductions: Deductions;
    businessUnit: string;
    bankName: string;
    signDate: string;
    dateOfJoining: string;
    subFunction: string;
    netPayable: number;
    earnings: Earnings;
    employeeId: string;
    lopDays: bigint;
    grade: string;
    totalEarningsArrear: number;
    paymentMode: string;
    accountNumber: string;
    pfAccountNumber: string;
    location: string;
    daysPaid: bigint;
    amountInWords: string;
}
export interface PayslipSummary {
    payPeriod: PayPeriod;
    payslipId: bigint;
    employeeName: string;
    netPayable: number;
}
export interface Deductions {
    professionTax: number;
    providentFund: number;
}
export interface PayPeriod {
    month: string;
    year: string;
}
export interface Earnings {
    hraGrossPM: number;
    specialAllowanceCurrentMonth: number;
    statutoryBonusGrossPM: number;
    specialAllowanceGrossPM: number;
    basicGrossPM: number;
    mobileAllowanceCurrentMonth: number;
    basicArrear: number;
    basicCurrentMonth: number;
    statutoryBonusCurrentMonth: number;
    mobileAllowanceGrossPM: number;
    mobileAllowanceArrear: number;
    statutoryBonusArrear: number;
    specialAllowanceArrear: number;
    hraCurrentMonth: number;
    hraArrear: number;
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
    createPayslip(payPeriod: PayPeriod, employeeName: string, employeeId: string, designation: string, subFunction: string, grade: string, businessUnit: string, location: string, dateOfJoining: string, dateOfBirth: string, pan: string, pfAccountNumber: string, uan: string, daysPaid: bigint, lopDays: bigint, arrearDays: bigint, earnings: Earnings, deductions: Deductions, totalEarningsGrossPM: number, totalEarningsCurrentMonth: number, totalEarningsArrear: number, totalDeductions: number, netPayable: number, amountInWords: string, paymentMode: string, accountNumber: string, bankName: string, ifscCode: string, signDate: string): Promise<void>;
    deletePayslip(payslipId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyPayslips(): Promise<Array<PayslipSummary>>;
    getPayslip(payslipId: bigint): Promise<Payslip>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePayslip(payslipId: bigint, payPeriod: PayPeriod, employeeName: string, employeeId: string, designation: string, subFunction: string, grade: string, businessUnit: string, location: string, dateOfJoining: string, dateOfBirth: string, pan: string, pfAccountNumber: string, uan: string, daysPaid: bigint, lopDays: bigint, arrearDays: bigint, earnings: Earnings, deductions: Deductions, totalEarningsGrossPM: number, totalEarningsCurrentMonth: number, totalEarningsArrear: number, totalDeductions: number, netPayable: number, amountInWords: string, paymentMode: string, accountNumber: string, bankName: string, ifscCode: string, signDate: string): Promise<void>;
}
