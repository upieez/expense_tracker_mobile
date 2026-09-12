# Expense Tracker

Mobile Development final project

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android).

## Test

```bash
npm test            # run the Jest suite
npm run test:coverage
```

## Structure

```
App.js              app root (gesture handler + navigation)
navigation/         tab + modal navigator
screens/            Home, AddExpense (modal), Stats, Settings
components/         reusable UI pieces
theme/              design tokens (colors, spacing, type, radii)
constants/          category definitions
services/           persistence (AsyncStorage expense storage)
store/              reducer, selectors, ExpensesContext provider
hooks/              (custom hooks)
utils/              pure helpers (formatting, dates)
__tests__/          Jest + React Native Testing Library tests
```
