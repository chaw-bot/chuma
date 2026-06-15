# Technical Report: Chuma Mobile Micro-Savings Application

**System:** Chuma
**Version:** 1.0.0
**Platform:** Android / iOS (React Native)
**Date:** June 2026

---

## Abstract

This report describes the design, architecture, and implementation of Chuma, a mobile micro-savings application developed for the Zambian market. The system enables users to define savings goals and fund them through scheduled or manual deductions from an MTN Mobile Money wallet. The application is built on React Native with the Expo managed workflow and integrates Firebase for authentication and data persistence, alongside a proprietary REST API for mobile money payment processing. This report covers the technology stack, system architecture, data model, security design, third-party integrations, and known limitations of the version 1.0.0 release.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
   - 3.1 High-Level Overview
   - 3.2 Frontend Architecture
   - 3.3 State Management
   - 3.4 Navigation Model
4. [Data Model](#4-data-model)
   - 4.1 Firestore Collections
   - 4.2 Core Data Types
5. [Authentication](#5-authentication)
6. [Savings Goals API Integration](#6-savings-goals-api-integration)
   - 6.1 Charge Flow
   - 6.2 Withdrawal Flow
7. [Security Model](#7-security-model)
8. [Feature Summary](#8-feature-summary)
9. [Limitations and Future Work](#9-limitations-and-future-work)
10. [Conclusion](#10-conclusion)

---

## 1. Introduction

### 1.1 Background

Mobile money adoption in Zambia has grown substantially, with MTN Mobile Money serving as a primary financial instrument for a significant portion of the population. Despite widespread access to mobile wallets, structured savings behaviour remains underserved by existing tools. Chuma addresses this gap by providing a goal-oriented savings layer on top of the existing mobile money infrastructure, allowing users to automate recurring deductions into named savings goals without requiring a traditional bank account.

### 1.2 Problem Statement

Informal savings practices — such as cash savings groups (chilimba) — are common in Zambia but lack the visibility, automation, and accountability that a digital system can provide. Users without bank accounts have limited access to savings products that offer goal tracking, progress visualisation, and automated contributions. Chuma is designed to fill this gap using mobile money as the funding mechanism.

### 1.3 Objectives

The system is designed to fulfil the following objectives:

1. Provide a frictionless registration flow using phone number authentication, removing the need for email addresses or passwords.
2. Allow users to define multiple named savings goals with target amounts and timelines.
3. Enable both manual (on-demand) and automated (scheduled) contributions to goals via mobile money wallet charges.
4. Allow users to withdraw completed goal balances back to their mobile money wallets.
5. Provide basic expense tracking to give users a broader view of their financial activity.
6. Operate on both Android and iOS from a single codebase.

---

## 2. Technology Stack

**Table 2.1 — Core Dependencies**

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | React Native | 0.81.5 |
| Framework | Expo | ~54.0.34 |
| Language | TypeScript | ~5.9.2 |
| UI library | React | 19.1.0 |
| Navigation | React Navigation (Native Stack) | 7.x |
| Authentication | @react-native-firebase/auth | ^24.0.0 |
| Database | @react-native-firebase/firestore | ^24.0.0 |
| Firebase core | @react-native-firebase/app | ^24.0.0 |
| Icons | lucide-react-native | ^0.564.0 |
| SVG charts | react-native-svg | 15.12.1 |
| Safe area | react-native-safe-area-context | ~5.6.0 |
| Screen management | react-native-screens | ~4.16.0 |
| Gradient backgrounds | expo-linear-gradient | ~15.0.8 |
| Native build tooling | expo-dev-client | ~6.0.21 |
| Build config | expo-build-properties | ~1.0.10 |

The project uses the Expo managed workflow with native module support (`expo-dev-client`). Because `@react-native-firebase` requires native compilation, the application cannot be run in the standard Expo Go client; a compiled development build is required.

The React Native New Architecture (`newArchEnabled: true`) is enabled in `app.json`, enabling the Fabric renderer and TurboModules for improved performance on both platforms.

---

## 3. System Architecture

### 3.1 High-Level Overview

The system comprises three distinct layers:

**Figure 3.1 — System Layers**

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                  │
│         (UI, navigation, local state)               │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼───────┐   ┌─────────▼──────────┐
│   Firebase    │   │   Goals REST API   │
│  (Auth +      │   │  (Mobile Money     │
│  Firestore)   │   │   charge/withdraw) │
└───────────────┘   └────────────────────┘
```

- **React Native application** — handles all user interface, local state, and orchestration logic.
- **Firebase** — provides phone number authentication (via Firebase Auth) and real-time data persistence (via Firestore).
- **Goals REST API** — a proprietary backend at `https://chuma.usepaynow.com/api` that interfaces with the mobile money payment network to initiate and confirm wallet charges and withdrawals.

### 3.2 Frontend Architecture

The application follows a screen-based architecture managed by React Navigation. All screens are registered in a single `Stack.Navigator` defined in `App.tsx`. Screens that form part of the main application flow are wrapped by a persistent bottom navigation bar (`BottomNav`); onboarding and setup screens are excluded from this bar.

The application root wraps the navigation tree in two providers:

- `SafeAreaProvider` — from `react-native-safe-area-context`, ensures correct inset handling across device types.
- `AppDataProvider` — a custom React Context provider that manages all application data and exposes it to the component tree (see Section 3.3).

A `LinearGradient` from `expo-linear-gradient` is applied as the root background container across the full application.

**Table 3.1 — Screen Inventory**

| Screen | Route Name | Navigation Group |
|--------|-----------|-----------------|
| Splash | `Splash` | Pre-auth |
| Onboarding | `Onboarding` | Pre-auth |
| Login | `Login` | Pre-auth |
| Complete Profile | `CompleteProfile` | Pre-auth |
| Dashboard | `Dashboard` | Main (with bottom nav) |
| Savings Progress | `SavingsProgress` | Main (with bottom nav) |
| Expense Tracking | `ExpenseTracking` | Main (with bottom nav) |
| Profile | `Profile` | Main (with bottom nav) |
| Notifications | `Notifications` | Main (with bottom nav) |
| Deductions | `Deductions` | Main (with bottom nav) |
| Investment Insights | `InvestmentInsights` | Main (with bottom nav) |
| Create Goal | `CreateGoal` | Modal / stack |
| Automated Savings | `AutomatedSavings` | Modal / stack |
| Add Expense | `AddExpense` | Modal / stack |
| Edit Profile | `EditProfile` | Modal / stack |
| Notification Preferences | `NotificationPreferences` | Modal / stack |
| Linked Mobile Money | `LinkedMobileMoney` | Modal / stack |
| Privacy Policy | `PrivacyPolicy` | Modal / stack |

### 3.3 State Management

Application state is managed through a single React Context, `AppDataContext`, implemented in `context/AppDataContext.tsx`. The context is provided by `AppDataProvider` and consumed via the `useAppData()` hook in individual screens.

The context maintains the following state:

**Table 3.2 — AppDataContext State**

| State Key | Type | Description |
|-----------|------|-------------|
| `goals` | `SavingsGoal[]` | All savings goals for the authenticated user; ordered newest-first |
| `expenses` | `ExpenseItem[]` | All expense records; ordered newest-first |
| `notifications` | `NotificationItem[]` | Activity notifications; ordered newest-first |
| `investments` | `InvestmentOption[]` | Investment options from the shared `investmentOptions` Firestore collection |
| `notificationPreferences` | `NotificationPreferences` | Per-user notification preference flags |
| `currentUser` | `SessionUser \| null` | Profile data for the authenticated session |
| `uid` | `string` | Firebase Auth UID for the active session |
| `isAuthReady` | `boolean` | Flag indicating whether the Firebase Auth state listener has fired at least once |

All Firestore collections are subscribed to via real-time `onSnapshot` listeners. State is updated reactively whenever the underlying Firestore data changes. Subscriptions are scoped to the authenticated user's UID and are torn down when the user signs out or the `userId` state clears.

Mutations (adding goals, recording expenses, updating preferences) write directly to Firestore. The `onSnapshot` listener for the affected collection then propagates the change back into local state, ensuring a single source of truth.

The context value object is memoised via `useMemo` with an explicit dependency array, preventing unnecessary re-renders across the component tree.

### 3.4 Navigation Model

Navigation uses `@react-navigation/native-stack`, which maps directly to native navigation primitives (UINavigationController on iOS, Fragment transactions on Android) for platform-idiomatic transitions.

The active route name is tracked via the `onStateChange` callback on `NavigationContainer`, enabling the root `App` component to conditionally render the `BottomNav` bar based on whether the current route is in the `routesWithoutNav` exclusion list.

---

## 4. Data Model

### 4.1 Firestore Collections

All user data is namespaced under the authenticated user's UID, following a `users/{uid}/...` path pattern. This structure enforces data isolation at the database level and aligns with the Firestore security rules (see Section 7).

**Table 4.1 — Firestore Collection Structure**

| Path | Description |
|------|-------------|
| `users/{uid}/goals/{goalId}` | Individual savings goal documents |
| `users/{uid}/expenses/{expenseId}` | Individual expense records |
| `users/{uid}/notifications/{notificationId}` | Notification items |
| `users/{uid}/meta/profile` | User profile document (name, email, provider) |
| `users/{uid}/meta/notificationPreferences` | Notification preference flags |
| `users/{uid}/meta/dummyDataV1` | Seed data marker; written once on first session |
| `investmentOptions/{optionId}` | Shared, publicly readable investment options |

### 4.2 Core Data Types

**SavingsGoal**

```
id               string       Firestore document ID (format: "goal-{timestamp}")
name             string       User-assigned goal name
category         string       One of: education, emergency, business, housing
targetAmount     number       Target savings amount in ZMW
currentAmount    number       Current saved amount in ZMW
timelineMonths   number       Duration in months (derived from start and target dates)
color            string       Hex colour code mapped from category
createdAt        string       ISO 8601 creation timestamp
autoSaveAmount   number?      Amount per automated deduction in ZMW
autoSaveFrequency string?     One of: daily, weekly, monthly
autoSaveStartDate string?     Human-readable start date string
autoSaveActive   boolean?     Whether the automated deduction is currently enabled
autoSaveCreatedAt string?     ISO 8601 timestamp of deduction plan creation
```

**ExpenseItem**

```
id          string    Firestore document ID (format: "expense-{timestamp}")
category    string    One of: Food, Transport, Shopping, Other
amount      number    Expense amount in ZMW
createdAt   string    ISO 8601 creation timestamp
description string?   Optional description
```

**SessionUser**

```
phoneNumber  string    E.164 phone number from Firebase Auth
mode         string    Always "demo" in v1.0.0
fullName     string?   User's full name
email        string?   Optional email address
provider     string?   One of: mtn, airtel, zamtel
```

**NotificationItem**

```
id        string    Firestore document ID
title     string    Short notification title
message   string    Notification body text
createdAt string    ISO 8601 timestamp
read      boolean?  Read state flag
type      string    One of: deduction, goal, expense, tip
```

### 4.3 Data Seeding

On the first authenticated session, the application automatically seeds five sample savings goals and five sample expense records into the user's Firestore subcollections, using a Firestore Batch write for atomicity. A sentinel document (`users/{uid}/meta/dummyDataV1`) is written on completion; subsequent sessions check for this document and skip the seed operation if it exists, ensuring seeding occurs exactly once per user.

---

## 5. Authentication

Chuma uses **Firebase Phone Authentication** with SMS one-time passwords (OTP). This approach was chosen for the following reasons:

- The target user base is more likely to have a phone number than an email address.
- It eliminates password management complexity for both the user and the system.
- It is directly compatible with the mobile money account model, where the phone number is the primary account identifier.

**Authentication Flow**

1. The user submits a Zambian phone number. The application normalises the input to E.164 format (`+260XXXXXXXXX`) and calls `firebaseAuth.signInWithPhoneNumber(e164Phone)`.
2. Firebase dispatches an SMS containing a six-digit OTP to the provided number.
3. The user submits the OTP. The application calls `confirmation.confirm(code)`.
4. On successful confirmation, Firebase returns an authenticated session. The application reads `auth.currentUser.uid`.
5. The application performs a Firestore lookup at `users/{uid}/meta/profile` to determine whether the user has completed profile setup.
6. Existing users are routed to the Dashboard; new users are routed to the CompleteProfile screen.

A 30-second resend cooldown is enforced client-side to reduce redundant SMS requests. Firebase enforces its own rate limits on the server side.

**Session Persistence**

Firebase Auth persists the authenticated session natively on the device. On subsequent application launches, the `onAuthStateChanged` listener fires immediately with the persisted user, allowing the application to restore state without requiring re-authentication.

---

## 6. Savings Goals API Integration

Payment processing for goal deposits and withdrawals is handled by a dedicated REST API at `https://chuma.usepaynow.com/api`. This API mediates between the application and the mobile money payment network.

The API base URL is configurable at build time via the `EXPO_PUBLIC_GOALS_API_URL` environment variable, allowing the application to target a local development server without code changes.

All API requests include a `Content-Type: application/json` header. Network failures are caught and surfaced as `GoalsApiError` instances with a status code of `0`, distinguishing them from server-side errors.

### 6.1 Charge Flow

A charge is an inbound payment from the user's mobile money wallet to a savings goal.

**Table 6.1 — Charge API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sandbox/users/{uid}/goals/{goalId}/charge` | Initiates a charge against the specified wallet |
| `POST` | `/sandbox/users/{uid}/goals/{goalId}/confirm` | Polls for charge confirmation status |
| `GET` | `/sandbox/users/{uid}/goals/due` | Returns goals with overdue automated deductions |

**Charge Request Body**

```json
{
  "phone": "0977000000",
  "operator": "mtn",
  "amount": 100
}
```

**Charge Lifecycle**

The charge does not settle synchronously. After the initial request, the API returns a `reference` string. The application then polls the `/confirm` endpoint every 4 seconds for up to 60 seconds until the status transitions to `successful` or `failed`. This polling loop is implemented in the `ChargeGoalSheet` component and is cancelled if the user dismisses the modal.

**Supported Operators**

```
mtn | airtel | zamtel | tnm
```

### 6.2 Withdrawal Flow

A withdrawal is an outbound payment from a savings goal back to the user's mobile money wallet. The withdrawal API mirrors the charge pattern.

**Table 6.2 — Withdrawal API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sandbox/users/{uid}/goals/{goalId}/withdraw` | Initiates a withdrawal to the specified wallet |
| `POST` | `/sandbox/users/{uid}/goals/{goalId}/withdraw/confirm` | Polls for withdrawal confirmation |

Withdrawals are subject to the same 60-second polling window as charges. The withdrawal amount is validated client-side to ensure it does not exceed the goal's `currentAmount` before the request is dispatched.

### 6.3 Error Handling

API errors are normalised through the `GoalsApiError` class, which wraps the HTTP status code and a human-readable message extracted from the response body. Array-format messages (where the API returns `message: string[]`) are joined with a comma separator before presentation to the user.

---

## 7. Security Model

### 7.1 Authentication Security

All user data access requires an authenticated Firebase session. The `uid` obtained from Firebase Auth is used as the namespace key for all Firestore data (`users/{uid}/...`), ensuring that no data from one user is accessible to another.

### 7.2 Firestore Security Rules

Access to Firestore is governed by the rules defined in `firestore.rules`. The rule set implements three access tiers:

**Table 7.1 — Firestore Access Tiers**

| Role | Definition | Access |
|------|-----------|--------|
| Public | Unauthenticated or authenticated | Read access to `investmentOptions` only |
| Owner | Authenticated user whose `uid` matches the document path | Full read/write access to own `users/{uid}/**` documents |
| Admin | Authenticated user with the custom claim `admin: true` | Full read/write access to all documents |

The Admin role is granted by an administrative script (`scripts/make-admin.mjs`) that sets the Firebase custom claim `admin: true` on a specified user account. This claim is verified server-side by the Firestore rules engine and cannot be forged by the client.

### 7.3 API Security

The Savings Goals API operates under a sandbox model in v1.0.0. The API endpoints include the user's Firebase UID as a path parameter, providing a basic level of data namespacing, but requests do not carry an authentication token in v1.0.0. Production deployment would require the addition of a bearer token (e.g., a Firebase ID token) to all API requests and server-side verification of that token.

---

## 8. Feature Summary

**Table 8.1 — Feature Summary**

| Feature | Description | Key Components |
|---------|-------------|----------------|
| Phone authentication | SMS OTP via Firebase Auth; no password required | `Login.tsx`, `firebase.ts` |
| Profile setup | First-time profile completion with name, email, and mobile money provider selection | `CompleteProfile.tsx` |
| Dashboard | Aggregate savings summary, goal previews, recent expenses | `Dashboard.tsx` |
| Goal creation | Named goals with target amount, timeline, and contribution frequency | `CreateGoal.tsx` |
| Goal progress tracking | Per-goal progress bar, percentage, and status badge; "Due now" indicator for overdue deductions | `SavingsProgress.tsx` |
| Manual deposit | On-demand wallet charge via the Goals API; polling-based confirmation | `ChargeGoalSheet.tsx`, `goalsApi.ts` |
| Goal withdrawal | Payout from completed goals back to a mobile money wallet | `WithdrawGoalSheet.tsx`, `goalsApi.ts` |
| Automated deductions | Recurring scheduled charges configured per goal; can be paused/resumed | `AutomatedSaving.tsx`, `Deductions.tsx` |
| Expense tracking | Monthly expense logging with category breakdown and donut chart | `ExpenseTracking.tsx`, `AddExpense.tsx` |
| Notifications | Activity alerts surfaced from Firestore in real time | `Notifications.tsx` |
| Profile management | Edit name/email, manage mobile money provider, set notification preferences | `Profile.tsx`, `EditProfile.tsx`, `LinkedMobileMoney.tsx` |
| Investment Insights | Screen for displaying available investment options from Firestore | `InvestmentInsights.tsx` |
| Data seeding | Automatic population of sample goals and expenses on first session | `AppDataContext.tsx` |

---

## 9. Limitations and Future Work

### 9.1 Mobile Money Provider Support

Version 1.0.0 supports only MTN Mobile Money. The Airtel Money and Zamtel Kwacha providers are present in the UI as disabled options. Extending support to these networks requires integration with their respective APIs at the backend layer and enabling the corresponding UI selectors.

### 9.2 API Authentication

As noted in Section 7.3, the Savings Goals API does not validate a bearer token in the current implementation. Before production deployment, API requests should include a Firebase ID token in the `Authorization` header, and the API server must verify that token against Firebase Auth to ensure that a user can only operate on their own goals.

### 9.3 Goal Categories

The goal creation screen currently assigns all new goals the `business` category regardless of the user's intent, as the category selector has not been implemented in the UI. The data model and colour-coding system support four categories (education, emergency, business, housing), and a category selection step should be added to the goal creation flow.

### 9.4 Offline Support

The application has no offline queue for mutations. If a user attempts to create a goal, record an expense, or initiate a deposit without network connectivity, the Firestore write or API request will fail silently. An offline mutation queue with retry logic would improve reliability in low-connectivity environments.

### 9.5 Push Notifications

Notification records are stored in Firestore and displayed in-app, but the system does not send push notifications. Integrating Firebase Cloud Messaging (FCM) would allow the system to alert users to deduction events, goal milestones, and payment confirmations even when the application is not in the foreground.

### 9.6 Automated Deduction Execution

The automated deduction configuration stores a schedule (frequency and start date) in Firestore, but the actual execution of scheduled charges is not yet implemented. A server-side scheduler (e.g., Firebase Cloud Functions with a scheduled trigger) would be required to read due deductions from Firestore and call the Goals API charge endpoint on the user's behalf.

### 9.7 Session Mode

The `SessionUser.mode` field is typed as `'demo'` only, indicating that the current session model is a simplified version of a full account system. A production release would distinguish between verified and unverified account states.

---

## 10. Conclusion

Chuma v1.0.0 delivers a functional mobile micro-savings platform that integrates Firebase-based phone authentication, Firestore data persistence, and a mobile money payment API into a single React Native application targeting the Zambian market. The architecture is structurally sound: data is isolated per user, state management is centralised and reactive, and the payment flows implement a robust polling mechanism to handle the asynchronous nature of mobile money transactions.

The primary areas requiring attention before a production-scale release are API authentication, automated deduction execution, push notification delivery, and expansion of mobile money provider support beyond MTN. These represent engineering work that builds on the established architecture rather than requiring structural changes.

The accompanying appendices provide a complete user manual (Appendix A) and installation guide for developers (Appendix B).

---

## Appendices

- **Appendix A** — User Manual (`USER_MANUAL.md`)
- **Appendix B** — Installation Manual (`INSTALLATION.md`)

---

*Chuma v1.0.0 — Technical Report*
