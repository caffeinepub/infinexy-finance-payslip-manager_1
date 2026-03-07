# Infinexy Finance Payslip Manager

## Current State
Full-stack payslip manager with Internet Identity login, a dashboard listing saved payslips, and a form to create/edit payslips. The backend uses an authorization system that requires users to be registered via `_initializeAccessControlWithSecret` before any authorized action. If a user's role is not found, the backend traps with "User is not registered", causing all payslip operations to fail for users who were not properly initialized.

## Requested Changes (Diff)

### Add
- Auto-registration of new users: any non-anonymous principal that calls a user-gated function and is not yet in the role map should be automatically assigned the `#user` role instead of trapping.

### Modify
- `getUserRole` in access-control logic: instead of trapping when the caller has no assigned role, silently assign `#user` and return it.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate Motoko backend with the same data model and API surface, but with auto-registration logic: in `getUserRole`, when a non-anonymous caller has no role entry, automatically add them as `#user` and return `#user` instead of trapping.
2. Keep all existing types, functions, and authorization patterns unchanged except for the registration trap.
