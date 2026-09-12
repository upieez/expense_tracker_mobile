# Expense Tracker

Mobile Development final project.

Log expenses, categorise them, attach a receipt photo, view spending stats, and get a daily reminder to log.

## Prerequisites

- Node 20 LTS or newer. Expo SDK 57 and React Native 0.86 will not run on Node 18.
- npm version 10 or newer.
- Expo Go on your phone. [iOS](https://apps.apple.com/app/expo-go/id982107779), [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Optional: Xcode for the iOS Simulator, or Android Studio for an emulator.

No API keys and no `.env` file are needed.

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. In the terminal you can also press `i` for the iOS Simulator, `a` for an Android emulator, or `w` for web.

The app asks for camera permission for receipt photos and notification permission for the daily reminder. Scheduled reminders are most reliable on a physical device.

Currency conversion uses the free [Frankfurter API](https://frankfurter.dev) and needs no key. Rates are cached per day.

## Test

```bash
npm test
npm run test:coverage
```

## Structure

```
App.js              app root (gesture handler, navigation)
navigation/         tab and modal navigator
screens/            Home, AddExpense (modal), Stats, Settings
components/         reusable UI such as expense row, chart, camera capture, offline banner
theme/              design tokens (colors, spacing, type, radii)
constants/          category definitions
services/           storage for expenses, settings, photos, plus network, notifications, exchange rate
store/              reducers, selectors, insights, Expenses and Settings context providers
hooks/              useNetworkStatus
utils/              pure helpers (formatting, dates)
__tests__/          Jest and React Native Testing Library tests
```

## Docs

- [Expo SDK 57](https://docs.expo.dev/), [Expo Go setup](https://docs.expo.dev/get-started/set-up-your-environment/)
- [React Navigation 7](https://reactnavigation.org/docs/getting-started)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/docs/usage)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
