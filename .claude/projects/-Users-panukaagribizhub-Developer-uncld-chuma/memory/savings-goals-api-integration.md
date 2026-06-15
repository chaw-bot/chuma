---
name: savings-goals-api-integration
description: How the app talks to the savings backend for wallet charges and goal balances
metadata:
  type: project
---

The Expo app charges goals via a sandbox savings backend (default `http://localhost:4033/api`, override with `EXPO_PUBLIC_GOALS_API_URL`). Client lives in `api/goalsApi.ts`; charge UI is `components/ChargeGoalSheet.tsx`, surfaced as "Save now" / "Request withdrawal" buttons on `screens/SavingsProgress.tsx`.

Key fact: the backend writes credited balances to the **same Firestore** (`users/:uid/goals/:goalId`) the app already listens to via `onSnapshot` in `context/AppDataContext.tsx`, so confirmed charges update the UI automatically — no manual write needed after confirm.

Charge flow: `chargeGoal()` → poll `confirmCharge()` every 4s up to 60s → applied. `listDueGoals()` drives the "Due now" badge. Withdraw endpoint shape is assumed — see [[withdraw-endpoint-assumed]].
