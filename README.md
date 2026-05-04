# Chuma

Chuma is a React Native app built with Expo and native Firebase modules. It includes a mobile app, Firebase Auth/Firestore integration, Firestore security rules, Firebase emulator support, and a lightweight local admin dashboard.

## Prerequisites

- Node.js 20 or newer
- npm
- Expo CLI through `npx expo` or the project npm scripts
- Firebase CLI for emulator work
- Android Studio and Android SDK for Android development
- Xcode and CocoaPods for iOS development on macOS

This app uses `@react-native-firebase/*`, so it does not run in Expo Go. Use a native development build.

## Install

```bash
npm install
```

The repo currently includes both `package-lock.json` and `yarn.lock`. Prefer npm unless the team decides to standardize on Yarn.

## Firebase Setup

Configure the app with your Firebase project settings before running it locally.

Required local Firebase files:

- `google-services.json` for Android native Firebase
- Firebase Web config in `firebaseApp.ts` and `admin/src/app.js`
- Optional service account JSON for admin claim scripts

Never commit Firebase Admin SDK private keys. Keep service account files local and make sure private key files are ignored by git.

If you need a service account:

1. Open Firebase Console.
2. Go to Project settings > Service accounts.
3. Generate a new private key.
4. Save it outside version control.

## Run the Mobile App

### Android: first install or after native changes

Connect an Android phone with USB debugging enabled, or start an Android emulator, then run:

```bash
npm run android
```

This builds and installs the native development app.

### Android: daily development

If the dev build is already installed:

```bash
npm run android:metro
```

Then open the installed Chuma app on the device or emulator.

To rebuild/install and start Metro in one step:

```bash
npm run android:dev
```

### iOS

On macOS with Xcode installed:

```bash
npm run ios
```

If iOS native files are missing or stale, run:

```bash
npm run prebuild
npm run ios
```

Make sure iOS Firebase configuration is added before expecting native Firebase features to work on iOS.

### Web preview

For a browser preview of supported Expo screens:

```bash
npm run web
```

Native Firebase behavior may differ from mobile. Treat web as a preview path, not the primary runtime.

## Run the Admin Dashboard

Start the local admin web app:

```bash
npm run admin
```

Open:

```text
http://127.0.0.1:5174
```

To use another port:

```bash
PORT=3000 npm run admin
```

The admin dashboard expects a Firebase Auth user with the custom claim `admin: true`.

## Make a User an Admin

Run the admin-claim helper with a Firebase service account:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npm run make-admin -- admin@example.com
```

You can also set:

```bash
FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json npm run make-admin -- admin@example.com
```

After the claim is added, the user must sign out and sign back in so Firebase refreshes their token.

## Firebase Emulators

Start Auth, Firestore, and the Emulator UI:

```bash
npm run emulator
```

Default emulator ports:

- Auth: `9099`
- Firestore: `8080`
- Emulator UI: `4000`

The emulator command uses `firebase.json` and `firestore.rules`.

## Useful Scripts

```bash
npm run start        # Start Expo Metro
npm run android      # Build/install Android dev app
npm run android:metro # Start Metro and open Android
npm run android:dev  # Build/install Android dev app
npm run ios          # Build/run iOS app
npm run web          # Start Expo web preview
npm run admin        # Serve the admin dashboard
npm run make-admin -- user@example.com
npm run emulator     # Start Firebase emulators
```

## Troubleshooting

### Expo Go does not work

Use a native development build. This project uses native Firebase modules that Expo Go does not include.

### Android device is not detected

Check devices:

```bash
adb devices
```

For a physical phone, enable Developer options, turn on USB debugging, and accept the computer authorization prompt. For an emulator, start it from Android Studio Device Manager and wait until it finishes booting.

### Firebase Auth phone sign-in fails

Check that the Firebase project has phone authentication enabled, the app package name matches the package configured in `app.json`, and the correct `google-services.json` is present.

### Admin dashboard says the user is not an admin

Run `npm run make-admin -- user@example.com` with a valid service account, then sign out and sign back in.

### Firebase service account is missing

Create a private key in Firebase Console and point `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT` to that file.

### Native Android files are stale

Regenerate native project files:

```bash
npm run prebuild
```

Then rebuild:

```bash
npm run android
```

## Project Structure

```text
App.tsx                 Main app entry
screens/                React Native screens
components/             Shared UI components
context/                App data context
firebase.ts             Native Firebase Auth wrapper
firebaseApp.ts          Firebase Web SDK app config
firestore.ts            Firestore Web SDK export
admin/                  Local admin dashboard
scripts/                Admin server and custom-claim helper
firestore.rules         Firestore security rules
firebase.json           Firebase emulator and rules config
DEV_ANDROID.md          Android-specific dev workflow notes
```
