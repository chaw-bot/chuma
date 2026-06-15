---
name: withdraw-endpoint-assumed
description: The goal withdrawal API endpoint shape is assumed, not confirmed against the backend
metadata:
  type: project
---

The savings backend's charge/confirm contract is documented, but the **withdrawal endpoint was not**. In `api/goalsApi.ts`, `withdrawGoal()` assumes `POST /sandbox/users/:uid/goals/:goalId/withdraw` with body `{ phone, operator, country?, amount? }` returning `{ reference, amount, goalId, status, message, goal? }` — mirroring the charge pattern.

**Why:** User confirmed a withdraw endpoint exists but didn't paste its contract.

**How to apply:** When the real withdrawal contract is provided, update `WithdrawRequest`/`WithdrawResponse` and the `withdrawGoal()` path/body in `api/goalsApi.ts`. The UI (Request withdrawal button in `screens/SavingsProgress.tsx`) only needs the function to resolve/reject. Related: [[savings-goals-api-integration]].
