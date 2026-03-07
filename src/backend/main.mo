import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type PayPeriod = { month : Text; year : Text };
  type Attendance = { totalDays : Nat; present : Nat; utilisedLeave : Nat; weekOff : Nat; overtimeHrs : Text; weeklyOffOvertimeDays : Nat };
  type Leave = { totalAllowLeaves : Nat; usedLeaves : Nat; balanceLeaves : Nat };
  type Earnings = { basicPay : Float; overtimeAmount : Float; weeklyOffOvertimeAmount : Float; employerESI : Float };
  type Deductions = { employeeESIDeduction : Float; professionalTax : Float };
  type PayslipSummary = {
    payslipId : Nat;
    employeeName : Text;
    payPeriod : PayPeriod;
    netAmount : Float;
  };

  type Payslip = {
    payslipId : Nat;
    ownerId : Principal;
    payPeriod : PayPeriod;
    employeeName : Text;
    employeeNumber : Text;
    functionRole : Text;
    designation : Text;
    location : Text;
    bankDetails : Text;
    dateOfJoining : Text;
    taxRegime : Text;
    pan : Text;
    uan : Text;
    pfAccountNumber : Text;
    esiNumber : Text;
    pran : Text;
    attendance : Attendance;
    leave : Leave;
    earnings : Earnings;
    deductions : Deductions;
    totalEarnings : Float;
    totalDeductions : Float;
    employersContributionEPFESIC : Float;
    netAmount : Float;
    amountInWords : Text;
    signatoryName : Text;
    signDate : Text;
    createdAt : Int;
  };

  module PayslipSummary {
    public func compare(p1 : PayslipSummary, p2 : PayslipSummary) : Order.Order {
      switch (Text.compare(p1.employeeName, p2.employeeName)) {
        case (#equal) { Nat.compare(p1.payslipId, p2.payslipId) };
        case (order) { order };
      };
    };
  };

  module Payslip {
    public func compareByNetAmount(p1 : Payslip, p2 : Payslip) : Order.Order {
      Float.compare(p1.netAmount, p2.netAmount);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let payslips = Map.empty<Nat, Payslip>();
  var nextPayslipId = 1;

  func generatePayslipId() : Nat {
    let newId = nextPayslipId;
    nextPayslipId += 1;
    newId;
  };

  func isOwner(caller : Principal, ownerId : Principal) : Bool {
    caller == ownerId;
  };

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Payslip Management Functions
  public shared ({ caller }) func createPayslip(
    payPeriod : PayPeriod,
    employeeName : Text,
    employeeNumber : Text,
    functionRole : Text,
    designation : Text,
    location : Text,
    bankDetails : Text,
    dateOfJoining : Text,
    taxRegime : Text,
    pan : Text,
    uan : Text,
    pfAccountNumber : Text,
    esiNumber : Text,
    pran : Text,
    attendance : Attendance,
    leave : Leave,
    earnings : Earnings,
    deductions : Deductions,
    totalEarnings : Float,
    totalDeductions : Float,
    employersContributionEPFESIC : Float,
    netAmount : Float,
    amountInWords : Text,
    signatoryName : Text,
    signDate : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payslips");
    };
    let payslipId = generatePayslipId();
    let payslip : Payslip = {
      payslipId;
      ownerId = caller;
      payPeriod;
      employeeName;
      employeeNumber;
      functionRole;
      designation;
      location;
      bankDetails;
      dateOfJoining;
      taxRegime;
      pan;
      uan;
      pfAccountNumber;
      esiNumber;
      pran;
      attendance;
      leave;
      earnings;
      deductions;
      totalEarnings;
      totalDeductions;
      employersContributionEPFESIC;
      netAmount;
      amountInWords;
      signatoryName;
      signDate;
      createdAt = Time.now();
    };
    payslips.add(payslipId, payslip);
  };

  public query ({ caller }) func getMyPayslips() : async [PayslipSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payslips");
    };
    let iter = payslips.values().filter(
      func(p) { p.ownerId == caller }
    ).map(
      func(p) {
        {
          payslipId = p.payslipId;
          employeeName = p.employeeName;
          payPeriod = p.payPeriod;
          netAmount = p.netAmount;
        };
      }
    );
    iter.toArray().sort();
  };

  public query ({ caller }) func getPayslip(payslipId : Nat) : async Payslip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payslips");
    };
    switch (payslips.get(payslipId)) {
      case (?p) {
        if (isOwner(caller, p.ownerId)) { p } else {
          Runtime.trap("Unauthorized: You do not have access to this payslip");
        };
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
  };

  public shared ({ caller }) func updatePayslip(
    payslipId : Nat,
    payPeriod : PayPeriod,
    employeeName : Text,
    employeeNumber : Text,
    functionRole : Text,
    designation : Text,
    location : Text,
    bankDetails : Text,
    dateOfJoining : Text,
    taxRegime : Text,
    pan : Text,
    uan : Text,
    pfAccountNumber : Text,
    esiNumber : Text,
    pran : Text,
    attendance : Attendance,
    leave : Leave,
    earnings : Earnings,
    deductions : Deductions,
    totalEarnings : Float,
    totalDeductions : Float,
    employersContributionEPFESIC : Float,
    netAmount : Float,
    amountInWords : Text,
    signatoryName : Text,
    signDate : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payslips");
    };
    switch (payslips.get(payslipId)) {
      case (?existingPayslip) {
        if (not isOwner(caller, existingPayslip.ownerId)) {
          Runtime.trap("Unauthorized: You cannot update this payslip");
        };
        let updatedPayslip : Payslip = {
          payslipId;
          ownerId = existingPayslip.ownerId;
          payPeriod;
          employeeName;
          employeeNumber;
          functionRole;
          designation;
          location;
          bankDetails;
          dateOfJoining;
          taxRegime;
          pan;
          uan;
          pfAccountNumber;
          esiNumber;
          pran;
          attendance;
          leave;
          earnings;
          deductions;
          totalEarnings;
          totalDeductions;
          employersContributionEPFESIC;
          netAmount;
          amountInWords;
          signatoryName;
          signDate;
          createdAt = existingPayslip.createdAt;
        };
        payslips.add(payslipId, updatedPayslip);
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
  };

  public shared ({ caller }) func deletePayslip(payslipId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete payslips");
    };
    switch (payslips.get(payslipId)) {
      case (?payslip) {
        if (not isOwner(caller, payslip.ownerId)) {
          Runtime.trap("Unauthorized: You cannot delete this payslip");
        };
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
    payslips.remove(payslipId);
  };
};
