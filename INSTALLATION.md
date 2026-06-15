# Appendix B: Installation Manual

**System:** Chuma Mobile Application
**Version:** 1.0.0
**Platform:** Android / iOS (React Native — Expo managed workflow with native modules)

---

## Overview

This document specifies the environment requirements and configuration steps required to build and run the Chuma mobile application in a development context. The application is built on React Native using the Expo managed workflow; however, because it incorporates native Firebase modules (`@react-native-firebase/*`), it cannot be executed within the standard Expo Go client. A native development build is required for both iOS and Android targets.

---

## Table of Contents

1. [System Prerequisites](#1-system-prerequisites)
2. [Repository Setup](#2-repository-setup)
3. [Firebase Configuration](#3-firebase-configuration)
4. [Environment Variables](#4-environment-variables)
5. [iOS Build and Execution](#5-ios-build-and-execution)
6. [Android Build and Execution](#6-android-build-and-execution)
7. [Firebase Local Emulator](#7-firebase-local-emulator)
8. [Administrative Utilities](#8-administrative-utilities)
9. [Error Reference](#9-error-reference)

---

## 1. System Prerequisites

The following tools must be installed and correctly configured prior to building the application.

### 1.1 Cross-platform Requirements

**Table 1.1 — Cross-platform Dependencies**

| Tool | Minimum Version | Installation |
|------|----------------|-------------|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| Yarn | 1.x | `npm install -g yarn` |

The Expo CLI is provided as a project-local dependency and does not require a global installation.

---

### 1.2 iOS Requirements

iOS builds require macOS. The following additional tools are required.

**Table 1.2 — iOS-specific Dependencies**

| Tool | Notes |
|------|-------|
| Xcode | Available from the Mac App Store. Must be launched at least once to accept the licence agreement and complete component installation. |
| Xcode Command Line Tools | Installed via `xcode-select --install` |
| CocoaPods | Installed via `sudo gem install cocoapods` |
| iOS Simulator | Bundled with Xcode; additional device configurations are available under **Xcode → Window → Devices and Simulators** |

---

### 1.3 Android Requirements

**Table 1.3 — Android-specific Dependencies**

| Tool | Notes |
|------|-------|
| Android Studio | Available at [developer.android.com/studio](https://developer.android.com/studio). The default installation includes the required SDK components. |
| Android SDK (API 34 or later) | Verified and managed through Android Studio's **SDK Manager** |
| JDK 17 | Bundled with recent versions of Android Studio; alternatively available from [Adoptium](https://adoptium.net) |

The `ANDROID_HOME` environment variable must be defined and the Android SDK `platform-tools` directory must be present on the system `PATH`. The following entries should be added to the shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

After editing the shell profile, reload it:

```bash
source ~/.zshrc
```

---

## 2. Repository Setup

### 2.1 Cloning the Repository

```bash
git clone <repository-url> chuma
cd chuma
```

### 2.2 Installing Dependencies

```bash
yarn install
```

> Yarn must be used exclusively. The project ships with a `yarn.lock` file; using `npm install` in its place risks introducing dependency version conflicts.

---

## 3. Firebase Configuration

Chuma depends on Firebase for phone-number authentication (OTP via SMS) and Firestore as its primary data store. Native configuration files must be obtained from the Firebase Console and placed in the project before any native build can succeed.

### 3.1 Firebase Project Setup

1. Navigate to [console.firebase.google.com](https://console.firebase.google.com) and create or select a Firebase project.
2. Under **Authentication → Sign-in method**, enable the **Phone** provider.

### 3.2 iOS Configuration File

1. In the Firebase Console, navigate to **Project settings → Your apps** and register an iOS application with bundle identifier `com.chaw.chuma`.
2. Download the generated `GoogleService-Info.plist` file.
3. Place the file at the project root, replacing the existing placeholder:

```
chuma/
└── GoogleService-Info.plist
```

### 3.3 Android Configuration File

1. In the Firebase Console, register an Android application with package name `com.chaw.chuma`.
2. Download the generated `google-services.json` file.
3. Place the file at the project root:

```
chuma/
└── google-services.json
```

> Both configuration files are listed in `.gitignore` and must not be committed to version control. Each developer is responsible for obtaining the appropriate files from the project's Firebase Console.

### 3.4 Firestore Security Rules

The file `firestore.rules` at the project root defines data access rules for the Firestore database. Deploy these rules to the Firebase project using the following command:

```bash
firebase deploy --only firestore:rules
```

**Table 3.1 — Firestore Access Rules Summary**

| Collection | Read | Write |
|------------|------|-------|
| `investmentOptions/{optionId}` | Public | Admin only |
| `users/{userId}/**` | Owner or Admin | Owner or Admin |
| All other documents | Admin only | Admin only |

An *Admin* is a user with the Firebase custom claim `admin: true` (see [Section 8](#8-administrative-utilities)). An *Owner* is an authenticated user whose `uid` matches the `{userId}` path parameter.

---

## 4. Environment Variables

Runtime configuration is supplied through environment variables. All variables intended for client-side access must carry the `EXPO_PUBLIC_` prefix, as required by the Expo build system.

A `.env` file may be created at the project root to define these values locally. This file is excluded from version control.

**Table 4.1 — Environment Variables**

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `EXPO_PUBLIC_GOALS_API_URL` | `https://chuma.usepaynow.com/api` | Base URL for the Savings Goals API. Override this variable to target a locally running API server during backend development. |

**Platform-specific URL values for local development:**

| Platform | Local API URL format |
|----------|---------------------|
| Android Emulator | `http://10.0.2.2:<port>/api` (the emulator routes this address to the host machine) |
| iOS Simulator | `http://localhost:<port>/api` or the host machine's LAN IP |

---

## 5. iOS Build and Execution

### 5.1 Initial Build

The following command performs a complete first-time build. It runs `expo prebuild` to generate the native `ios/` directory, executes `pod install` to resolve CocoaPods dependencies, compiles the native application via Xcode, and installs it on the active simulator or connected device:

```bash
yarn ios
```

The initial build may take several minutes to complete. Subsequent builds are significantly faster due to incremental compilation.

### 5.2 Daily Development Workflow

When the native build is already installed on the simulator or device, the Metro bundler can be started without rebuilding the native layer:

```bash
yarn ios:metro
```

The user then opens the installed **Chuma** application on the simulator or device directly.

To perform a full native rebuild and start Metro in a single step:

```bash
yarn ios:dev
```

### 5.3 Physical Device Deployment

To install the application on a physical iOS device:

1. Connect the device via USB and trust the connected computer if prompted.
2. In Xcode, select the physical device from the scheme target selector.
3. Run `yarn ios` to compile and deploy.

An Apple Developer account (free tier is sufficient for personal device testing) is required to sign the application for physical device installation.

### 5.4 Important Constraints

- **Expo Go must not be used.** The application depends on `@react-native-firebase/*` native modules that are absent from the Expo Go runtime.
- After installing, upgrading, or removing any native package, the native project must be regenerated before the next build:

  ```bash
  yarn prebuild
  yarn ios
  ```

- If the simulator exhibits unexpected behaviour due to a previously installed build, the application should be deleted from the simulator before reinstalling.

---

## 6. Android Build and Execution

### 6.1 Initial Build

With a device or emulator active and recognised, the following command builds the native Android APK and installs it:

```bash
yarn android
```

### 6.2 Emulator Setup

1. Open Android Studio and navigate to **Device Manager**.
2. Select **Create Device**, choose a hardware profile (e.g., Pixel 8), select a system image at API level 34 or later, and complete the creation wizard.
3. Start the emulator from Device Manager and allow it to reach the home screen before executing the build command.

### 6.3 Physical Device Setup

1. On the Android device, navigate to **Settings → About phone** and tap **Build number** seven times to enable Developer options.
2. Navigate to **Settings → Developer options** and enable **USB debugging**.
3. Connect the device via USB and accept the authorisation prompt that appears on the device.
4. Verify device recognition:

   ```bash
   $ANDROID_HOME/platform-tools/adb devices
   ```

   The device should appear with the status `device`. A status of `unauthorized` indicates the USB debugging authorisation prompt has not been accepted.

### 6.4 Daily Development Workflow

When the native build is already installed:

```bash
yarn android:metro
```

Open the installed **Chuma** application on the device or emulator.

To rebuild and start Metro in a single step:

```bash
yarn android:dev
```

### 6.5 Important Constraints

- **Expo Go must not be used** for the same reasons described in Section 5.4.
- Only USB cables that support data transfer (not charge-only cables) will allow ADB to recognise the device.

---

## 7. Firebase Local Emulator

The Firebase Emulator Suite provides a locally isolated Firebase environment suitable for development and testing, eliminating the need to interact with the production Firebase project.

### 7.1 Starting the Emulators

```bash
yarn emulator
```

**Table 7.1 — Emulator Services and Ports**

| Service | Port |
|---------|------|
| Authentication | 9099 |
| Firestore | 8080 |
| Emulator UI | 4000 |

The Emulator UI is accessible in a browser at `http://localhost:4000`.

### 7.2 Connecting the Application to the Emulator

By default, the application targets the production Firebase project. To redirect it to the local emulators, the Firebase SDK must be configured to connect to the emulator hosts. The following initialisation code should be added to the Firebase setup module when operating in development mode:

```ts
if (__DEV__) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}
```

> This configuration is not applied by default. It is intended for use only in isolated development or testing contexts.

---

## 8. Administrative Utilities

Two Node.js scripts are provided in the `scripts/` directory to support administrative operations.

### 8.1 Granting Admin Privileges

```bash
yarn make-admin
```

Executes `scripts/make-admin.mjs`. This script applies the Firebase custom claim `admin: true` to a specified user account. Accounts with this claim are granted elevated write access to all Firestore collections, as defined in the security rules described in Section 3.4.

### 8.2 Admin Panel

```bash
yarn admin
```

Executes `scripts/serve-admin.mjs`. This script starts a local administrative interface for managing application data.

---

## 9. Error Reference

**Table 9.1 — Common Build and Runtime Errors**

| Error | Cause | Resolution |
|-------|-------|------------|
| `RNFBAppModule` not found / application crash on launch | Application opened in Expo Go rather than the native dev build | Remove Expo Go from the simulator or device. Execute `yarn ios` or `yarn android` to install the native build, then launch the **Chuma** application directly. |
| `pod install` failure on iOS | Stale CocoaPods state or outdated CocoaPods version | Run `cd ios && pod deintegrate && pod install && cd ..`. If the issue persists, update CocoaPods: `sudo gem install cocoapods`. |
| `Invariant Violation: Native module RNFBApp not found` | Native modules not compiled into the current build; typically occurs after a package change without running `prebuild` | Execute `yarn prebuild` followed by `yarn ios` or `yarn android` to regenerate and recompile the native project. |
| Android build failure: `SDK location not found` | `ANDROID_HOME` environment variable not set, or `local.properties` missing | Ensure `ANDROID_HOME` is exported in the shell profile (Section 1.3). Alternatively, create `android/local.properties` containing: `sdk.dir=/Users/<username>/Library/Android/sdk` |
| `adb devices` returns no devices | USB debugging disabled, charge-only USB cable, or pending authorisation prompt | Enable USB debugging on the device (Section 6.3). Use a data-capable USB cable. Accept the authorisation prompt on the device. Run `adb kill-server && adb start-server` to reset the ADB daemon if necessary. |
| Metro bundler port conflict: `port 8081 already in use` | Another process is occupying the default Metro port | Run `npx kill-port 8081`, then restart the Metro bundler. |
| `GoogleService-Info.plist` or `google-services.json` not found | Firebase configuration files are gitignored and absent from the cloned repository | Follow Section 3.2 and Section 3.3 to download the appropriate files from the Firebase Console and place them at the project root. |

---

*Chuma v1.0.0 — Installation Manual*
