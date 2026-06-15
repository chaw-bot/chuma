# iOS Dev Build Workflow

This project uses native Firebase modules (`@react-native-firebase/*`), so it does **not** run in Expo Go.

## First-time setup

1. In [Firebase Console](https://console.firebase.google.com/) → Project settings → Your apps, add an **iOS app** with bundle ID `com.chaw.chuma`.
2. Download `GoogleService-Info.plist` and replace the file at the project root (or update `GOOGLE_APP_ID` in the existing file).
3. Build and install the dev client:

```bash
yarn ios
```

This runs `expo prebuild` (if needed), compiles the native iOS app, and installs it on the simulator or a connected device.

## Daily workflow

If the dev build is already installed:

```bash
yarn ios:metro
```

Open the installed **Chuma** dev build on the simulator or device (not Expo Go).

To rebuild and start Metro in one step:

```bash
yarn ios:dev
```

## Important

- Do **not** use Expo Go — it does not include `RNFBAppModule`.
- After adding or changing native Firebase packages, run `yarn prebuild` then `yarn ios` again.
- If you previously installed Expo Go or an old build, delete the app from the simulator/device before reinstalling.
