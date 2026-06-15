# Appendix A: User Manual

**System:** Chuma Mobile Application
**Version:** 1.0.0
**Platform:** Android / iOS

---

## Overview

Chuma is a mobile micro-savings application designed for the Zambian market. The system enables users to define personal savings goals and fund them through automated deductions from an MTN Mobile Money wallet. Alongside savings management, the application provides expense tracking and basic financial activity monitoring. This manual documents all functional screens, user flows, and system behaviours present in version 1.0.0.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
   - 1.1 Onboarding
   - 1.2 Authentication
   - 1.3 Profile Completion
2. [Dashboard](#2-dashboard)
3. [Savings Goals](#3-savings-goals)
   - 3.1 Goal Creation
   - 3.2 Goal Progress View
   - 3.3 Manual Deposit
   - 3.4 Goal Withdrawal
4. [Automated Deductions](#4-automated-deductions)
5. [Expense Tracking](#5-expense-tracking)
   - 5.1 Expense Overview
   - 5.2 Recording an Expense
6. [Notifications](#6-notifications)
7. [Profile and Settings](#7-profile-and-settings)
   - 7.1 Edit Profile
   - 7.2 Notification Preferences
   - 7.3 Linked Mobile Money Account
   - 7.4 Privacy Policy
   - 7.5 Session Termination
8. [Troubleshooting Reference](#8-troubleshooting-reference)

---

## 1. Getting Started

### 1.1 Onboarding

Upon first launch, the application presents a three-slide onboarding sequence that introduces the core value propositions of the system. Each slide is accompanied by an icon, a title, and a brief description.

**Table 1.1 — Onboarding Slides**

| Slide | Title | Description |
|-------|-------|-------------|
| 1 | Chuma | Introduction to automated micro-savings and financial goal-setting |
| 2 | Set your savings goal | Explanation of the personalised goal creation and progress tracking system |
| 3 | Automated deductions | Overview of automatic deductions from MTN Mobile Money |

The user may advance through slides sequentially using the **Next** button, or bypass the sequence entirely via the **Skip** control in the top-right corner. On the final slide, the **Get Started** button navigates to the Authentication screen.

---

### 1.2 Authentication

Chuma uses phone number-based authentication via SMS one-time password (OTP). No password is required.

**Step 1 — Phone number entry**

The user enters a Zambian mobile number into the input field adjacent to the pre-filled `+260` country code prefix. The system validates the number format before enabling the **Continue** button. On submission, an SMS containing a six-digit verification code is dispatched to the provided number.

**Step 2 — Code verification**

The user enters the six-digit code received via SMS. The input field accepts numeric characters only and is capped at six digits. Once a complete code is entered, the user submits it via the **Verify Code** button.

If the code is not received, the **Resend** control becomes active after a 30-second cooldown period, allowing the user to request a new code.

Upon successful verification, the system checks whether a user profile already exists for the authenticated phone number:
- **Existing user** — the session is restored and the user is directed to the Dashboard.
- **New user** — the user is directed to the Profile Completion screen.

**Table 1.2 — Authentication Error Messages**

| Error Condition | Message Displayed |
|----------------|-------------------|
| Invalid phone number format | "Enter a valid Zambian phone number." |
| Incorrect verification code | "That verification code is incorrect. Please try again." |
| Expired verification code | "That code has expired. Please request a new one." |
| Too many attempts | "Too many attempts. Please wait a moment and try again." |
| Network failure | "Network error. Check your connection and try again." |

---

### 1.3 Profile Completion

New users are required to complete their profile before accessing the application. The profile completion screen collects the following information:

**Table 1.3 — Profile Completion Fields**

| Field | Required | Notes |
|-------|----------|-------|
| Full Name | Yes | Minimum of two characters |
| Email Address | No | Used for account notifications |
| Mobile Money Provider | Yes | MTN Mobile Money is the only currently supported provider |

The **Mobile Money Provider** is selected from a card-style selector. Airtel Money and Zamtel Kwacha are displayed as coming-soon options and are not selectable. The **Complete Setup** button is enabled only when the full name and provider fields are populated.

---

## 2. Dashboard

The Dashboard serves as the primary home screen of the application, providing a consolidated summary of the user's financial activity.

### Total Saved Card

A prominent card at the top of the screen displays aggregate savings data:

**Table 2.1 — Total Saved Card Elements**

| Element | Description |
|---------|-------------|
| Total Saved | Combined current balance across all active goals, denominated in ZMW |
| Active Goals | Count of goals created by the user |
| Next Deduction | Start date of the most recently configured automated savings plan, or "Set plan" if none exists |

Selecting the card navigates to the full Goals screen.

### Goals Summary

Up to two goals are previewed on the Dashboard. Each goal card displays the goal name, remaining timeline, a progress bar, completion percentage, and the current-versus-target amount in ZMW. Selecting **View all** navigates to the complete Goals screen. Selecting an individual goal card opens the progress detail for that goal.

### Recent Activity

The three most recent expenses are listed in the Recent section, showing the expense category, date, and ZMW amount. The bell icon adjacent to this section header navigates to the Notifications screen.

### Navigation

A persistent bottom navigation bar is displayed on all main screens of the application.

**Table 2.2 — Bottom Navigation Tabs**

| Tab | Destination Screen |
|-----|--------------------|
| Home | Dashboard |
| Goals | Savings Progress |
| Expenses | Expense Tracking |
| Profile | Profile |

---

## 3. Savings Goals

### 3.1 Goal Creation

A new savings goal is created via the Goal Creation screen, accessible from the Goals tab or the floating action button (`+`) on the Goals screen.

**Table 3.1 — Goal Creation Fields**

| Field | Description |
|-------|-------------|
| Goal Name | A descriptive label for the goal (e.g., "School Fees", "New Business") |
| Target Amount (ZMW) | The total amount the user intends to save |
| Start Date | The date on which saving commences; defaults to the current date |
| Target Date | The date by which the goal should be reached; defaults to six months from the current date |
| Contribution Frequency | The intended saving interval: Daily, Weekly, or Monthly |

The timeline in months is automatically derived from the difference between the start and target dates. Submission is enabled only when the goal name and target amount fields are populated. On successful creation, the user is redirected to the Goals screen.

---

### 3.2 Goal Progress View

The Goals screen displays all of the user's goals. Each goal card presents the following information:

**Table 3.2 — Goal Card Elements**

| Element | Description |
|---------|-------------|
| Goal Name | Name assigned at creation |
| Amount Progress | Current saved amount versus target (e.g., ZMW 500 / 2,000) |
| Progress Bar | Visual representation of completion percentage |
| Completion Percentage | Numeric percentage of the target reached |
| Status Badge | **Active** (in progress) or **Completed** (target reached) |
| Due Now Badge | Displayed in amber when an automated deduction is scheduled for the current day |

Selecting a goal card opens the Automated Savings configuration screen for that goal.

---

### 3.3 Manual Deposit

For Active goals, a **Save now** button is presented at the base of each goal card. Activating this control opens a modal bottom sheet through which the user initiates an immediate deposit from a mobile money wallet.

**Table 3.3 — Manual Deposit Form Fields**

| Field | Description |
|-------|-------------|
| Amount (ZMW) | The deposit amount |
| Wallet number | The mobile money number to be charged |
| Operator | The mobile money network: MTN, Airtel, or Zamtel |

Upon submission, the application initiates a payment request to the specified wallet and the transaction proceeds through the following states:

**Table 3.4 — Deposit Transaction States**

| State | Description |
|-------|-------------|
| Awaiting | The system has dispatched a payment prompt to the user's mobile wallet. The user must approve the prompt on their handset. |
| Success | The payment has been confirmed. The deposited amount is reflected in the goal balance. |
| Failed | The payment was declined or could not be processed. The user is offered the option to retry. |

The application polls for payment confirmation for a maximum of 60 seconds. If confirmation is not received within this window, a timeout message is displayed. Funds may still be applied to the goal balance if the underlying payment transaction settles after the timeout.

---

### 3.4 Goal Withdrawal

The **Withdraw** action is available exclusively on goals with a **Completed** status (i.e., where the current amount equals or exceeds the target amount). Activating the button opens a withdrawal sheet.

**Table 3.5 — Withdrawal Form Fields**

| Field | Description |
|-------|-------------|
| Amount (ZMW) | Amount to be returned to the mobile wallet; pre-populated with the full available balance; cannot exceed the available balance |
| Wallet number | The mobile money number that will receive the funds |
| Operator | The mobile money network for the receiving wallet |

The withdrawal follows the same state model as deposits (Awaiting → Success / Failed) and is subject to the same 60-second confirmation window.

---

## 4. Automated Deductions

The Automated Deductions feature allows the system to charge the user's mobile money wallet on a recurring schedule, removing the need for manual saving.

A deduction plan is configured via the Add Deduction screen, reached by selecting a goal from the Goals screen.

**Table 4.1 — Deduction Configuration Fields**

| Field | Description |
|-------|-------------|
| Goal | The savings goal to which deductions will be applied; selected from a dropdown list of existing goals |
| Amount per Deduction (ZMW) | The amount deducted from the wallet at each interval |
| Frequency | The recurrence interval: Daily, Weekly, or Monthly |
| Start Date | The date of the first deduction |
| Active | Toggle controlling whether the deduction plan is currently enabled |

Submitting the form saves the deduction plan and redirects the user to the Deductions summary screen. Existing plans can be modified by revisiting the goal's configuration screen.

---

## 5. Expense Tracking

### 5.1 Expense Overview

The Expense Tracking screen, accessed via the **Expenses** tab, provides a monthly summary of the user's recorded expenditure.

The screen presents three components:

1. **Monthly Total** — the aggregate of all expenses recorded in the current month, displayed in ZMW.
2. **Spending by Category** — a donut chart showing the proportional distribution of expenditure across categories.
3. **Recent Expenses** — a chronological list of all recorded expenses, each showing the category icon, description, category label, date, and ZMW amount.

**Table 5.1 — Expense Categories**

| Category | Icon |
|----------|------|
| Food | Fork and knife |
| Transport | Car |
| Shopping | Briefcase |
| Other | Ellipsis (•••) |

---

### 5.2 Recording an Expense

A new expense is added by selecting the **+ Add** button in the top-right corner of the Expense Tracking screen. The expense is recorded and immediately reflected in the monthly total and category chart.

---

## 6. Notifications

The Notifications screen is accessible via the bell icon on the Dashboard or directly via navigation. The screen surfaces activity alerts relevant to the user's account, including deduction events and goal milestones.

---

## 7. Profile and Settings

The Profile screen, reached via the **Profile** tab, displays the user's account summary and provides access to application settings.

The profile card shows the user's name (represented by an initial avatar), phone number, and the name of the linked mobile money provider. Below this, four settings options are presented.

**Table 7.1 — Profile Settings Options**

| Option | Function |
|--------|---------- |
| Edit Profile | Modify the user's full name and email address |
| Notification Preferences | Configure which system notifications are delivered to the user |
| Linked Mobile Money Account | View or update the linked mobile money provider |
| Privacy Policy | Display the application's full privacy policy |

---

### 7.1 Edit Profile

The Edit Profile screen allows the user to update their full name and email address.

---

### 7.2 Notification Preferences

The Notification Preferences screen allows the user to control which categories of alerts and reminders the application delivers.

---

### 7.3 Linked Mobile Money Account

The Linked Mobile Money Account screen displays all supported payment providers. MTN Mobile Money is currently the only active provider; Airtel Money and Zamtel Kwacha are listed as forthcoming. The user selects a provider and confirms the selection via the **Save Account** button.

---

### 7.4 Privacy Policy

The Privacy Policy screen presents the full text of Chuma's data privacy policy.

---

### 7.5 Session Termination

A **Log Out** button is presented at the base of the Profile screen. On activation, a confirmation dialog is displayed. Confirming the action terminates the current session and returns the user to the Onboarding screen.

---

## 8. Troubleshooting Reference

**Table 8.1 — Common Issues and Resolutions**

| Issue | Likely Cause | Resolution |
|-------|-------------|------------|
| SMS verification code not received | Incorrect phone number or temporary network congestion | Verify the phone number entered contains no country prefix. Wait 30 seconds and use the **Resend** option. |
| Wallet charge timed out after approving the prompt | Payment confirmation arrived after the 60-second polling window | The goal balance will update automatically once the network confirms the transaction. Allow up to two minutes and refresh the Goals screen. |
| **Save now** button is inactive | Amount or wallet number field is incomplete | Both the amount (greater than zero) and a wallet number of at least nine digits are required. |
| **Withdraw** button absent from a goal card | Goal has not reached 100% completion | Withdrawals are only available on goals with a **Completed** status. |
| Airtel or Zamtel is not selectable in provider settings | Provider not yet integrated | Only MTN Mobile Money is supported in the current version. Support for additional providers is planned. |

---

*Chuma v1.0.0 — User Manual*
