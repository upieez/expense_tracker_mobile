import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import OfflineBanner from './components/OfflineBanner';
import { ExpensesProvider } from './store/ExpensesContext';
import { SettingsProvider } from './store/SettingsContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SettingsProvider>
        <ExpensesProvider>
          <OfflineBanner />
          <AppNavigator />
        </ExpensesProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
