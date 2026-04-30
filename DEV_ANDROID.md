# Android Dev Build Workflow

This project uses native Firebase modules, so it does not run in Expo Go.

## First-time setup

1. Connect an Android phone with `USB debugging` enabled, or start an Android emulator.
2. Install the dev build:

```bash
npm run android
```

This builds and installs the native Android app.

## Daily workflow

If the app is already installed on your phone/emulator:

```bash
npm run android:metro
```

Then open the installed `Chuma` dev build on the device.

If you want one command that installs/updates the app and then starts Metro:

```bash
npm run android:dev
```

## If no device is found

Check connected devices:

```bash
/Users/chaw/Library/Android/sdk/platform-tools/adb devices
```

If you are using a real phone:

- Turn on `Developer options`
- Turn on `USB debugging`
- Accept the computer authorization prompt on the phone

If you are using an emulator:

- Open Android Studio
- Start an emulator from `Device Manager`
- Wait for it to boot fully before running `npm run android`

## Important

- Use the installed dev build, not Expo Go
- For this app, QR codes from Expo Go are not the right launch path
