import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
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

  type Earnings = {
    basicGrossPM : Float;
    basicCurrentMonth : Float;
    basicArrear : Float;

    hraGrossPM : Float;
    hraCurrentMonth : Float;
    hraArrear : Float;

    specialAllowanceGrossPM : Float;
    specialAllowanceCurrentMonth : Float;
    specialAllowanceArrear : Float;

    mobileAllowanceGrossPM : Float;
    mobileAllowanceCurrentMonth : Float;
    mobileAllowanceArrear : Float;

    statutoryBonusGrossPM : Float;
    statutoryBonusCurrentMonth : Float;
    statutoryBonusArrear : Float;
  };

  type Deductions = {
    providentFund : Float;
    professionTax : Float;
  };

  type PayslipSummary = {
    payslipId : Nat;
    employeeName : Text;
    payPeriod : PayPeriod;
    netPayable : Float;
  };

  public type Payslip = {
    payslipId : Nat;
    ownerId : Principal;
    payPeriod : PayPeriod;
    employeeName : Text;
    employeeId : Text;
    designation : Text;
    subFunction : Text;
    grade : Text;
    businessUnit : Text;
    location : Text;
    dateOfJoining : Text;
    dateOfBirth : Text;
    pan : Text;
    pfAccountNumber : Text;
    uan : Text;
    daysPaid : Nat;
    lopDays : Nat;
    arrearDays : Nat;
    earnings : Earnings;
    deductions : Deductions;
    totalEarningsGrossPM : Float;
    totalEarningsCurrentMonth : Float;
    totalEarningsArrear : Float;
    totalDeductions : Float;
    netPayable : Float;
    amountInWords : Text;
    paymentMode : Text;
    accountNumber : Text;
    bankName : Text;
    ifscCode : Text;
    signDate : Text;
    createdAt : Int;
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

  func autoRegisterUser(caller : Principal) {
    if (caller.toText() != "2vxsx-fae") {
      let currentRole = AccessControl.getUserRole(accessControlState, caller);
      if (currentRole == #guest) {
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createPayslip(
    payPeriod : PayPeriod,
    employeeName : Text,
    employeeId : Text,
    designation : Text,
    subFunction : Text,
    grade : Text,
    businessUnit : Text,
    location : Text,
    dateOfJoining : Text,
    dateOfBirth : Text,
    pan : Text,
    pfAccountNumber : Text,
    uan : Text,
    daysPaid : Nat,
    lopDays : Nat,
    arrearDays : Nat,
    earnings : Earnings,
    deductions : Deductions,
    totalEarningsGrossPM : Float,
    totalEarningsCurrentMonth : Float,
    totalEarningsArrear : Float,
    totalDeductions : Float,
    netPayable : Float,
    amountInWords : Text,
    paymentMode : Text,
    accountNumber : Text,
    bankName : Text,
    ifscCode : Text,
    signDate : Text
  ) : async () {
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create payslips");
    };
    let payslipId = generatePayslipId();
    let payslip : Payslip = {
      payslipId;
      ownerId = caller;
      payPeriod;
      employeeName;
      employeeId;
      designation;
      subFunction;
      grade;
      businessUnit;
      location;
      dateOfJoining;
      dateOfBirth;
      pan;
      pfAccountNumber;
      uan;
      daysPaid;
      lopDays;
      arrearDays;
      earnings;
      deductions;
      totalEarningsGrossPM;
      totalEarningsCurrentMonth;
      totalEarningsArrear;
      totalDeductions;
      netPayable;
      amountInWords;
      paymentMode;
      accountNumber;
      bankName;
      ifscCode;
      signDate;
      createdAt = Time.now();
    };
    payslips.add(payslipId, payslip);
  };

  public query ({ caller }) func getMyPayslips() : async [PayslipSummary] {
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access payslips");
    };
    let iter = payslips.values().filter(
      func(p) { p.ownerId == caller }
    ).map(
      func(p) {
        {
          payslipId = p.payslipId;
          employeeName = p.employeeName;
          payPeriod = p.payPeriod;
          netPayable = p.netPayable;
        };
      }
    );
    iter.toArray();
  };

  public query ({ caller }) func getPayslip(payslipId : Nat) : async Payslip {
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access payslips");
    };
    switch (payslips.get(payslipId)) {
      case (?p) {
        if (not isOwner(caller, p.ownerId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not have access to this payslip");
        };
        p;
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
  };

  public shared ({ caller }) func updatePayslip(
    payslipId : Nat,
    payPeriod : PayPeriod,
    employeeName : Text,
    employeeId : Text,
    designation : Text,
    subFunction : Text,
    grade : Text,
    businessUnit : Text,
    location : Text,
    dateOfJoining : Text,
    dateOfBirth : Text,
    pan : Text,
    pfAccountNumber : Text,
    uan : Text,
    daysPaid : Nat,
    lopDays : Nat,
    arrearDays : Nat,
    earnings : Earnings,
    deductions : Deductions,
    totalEarningsGrossPM : Float,
    totalEarningsCurrentMonth : Float,
    totalEarningsArrear : Float,
    totalDeductions : Float,
    netPayable : Float,
    amountInWords : Text,
    paymentMode : Text,
    accountNumber : Text,
    bankName : Text,
    ifscCode : Text,
    signDate : Text
  ) : async () {
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update payslips");
    };
    switch (payslips.get(payslipId)) {
      case (?existingPayslip) {
        if (not isOwner(caller, existingPayslip.ownerId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You cannot update this payslip");
        };
        let updatedPayslip : Payslip = {
          payslipId;
          ownerId = existingPayslip.ownerId;
          payPeriod;
          employeeName;
          employeeId;
          designation;
          subFunction;
          grade;
          businessUnit;
          location;
          dateOfJoining;
          dateOfBirth;
          pan;
          pfAccountNumber;
          uan;
          daysPaid;
          lopDays;
          arrearDays;
          earnings;
          deductions;
          totalEarningsGrossPM;
          totalEarningsCurrentMonth;
          totalEarningsArrear;
          totalDeductions;
          netPayable;
          amountInWords;
          paymentMode;
          accountNumber;
          bankName;
          ifscCode;
          signDate;
          createdAt = existingPayslip.createdAt;
        };
        payslips.add(payslipId, updatedPayslip);
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
  };

  public shared ({ caller }) func deletePayslip(payslipId : Nat) : async () {
    autoRegisterUser(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete payslips");
    };
    switch (payslips.get(payslipId)) {
      case (?payslip) {
        if (not isOwner(caller, payslip.ownerId) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You cannot delete this payslip");
        };
        payslips.remove(payslipId);
      };
      case (null) { Runtime.trap("Payslip not found") };
    };
  };
};
