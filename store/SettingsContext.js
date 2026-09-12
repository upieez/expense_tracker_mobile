import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
} from "../services/settingsStorage";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useMemo(
    () => (changes) => {
      setSettings((prev) => {
        const next = { ...prev, ...changes };
        saveSettings(next).catch((e) =>
          console.warn("persist settings failed", e),
        );
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ ...settings, hydrated, updateSettings }),
    [settings, hydrated, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
