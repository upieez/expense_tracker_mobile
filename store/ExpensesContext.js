import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import * as Haptics from "expo-haptics";
import { expensesReducer, initialState } from "./expensesReducer";
import { createExpense, withUpdates } from "../utils/expense";
import * as storage from "../services/expenseStorage";
import { deleteReceiptPhoto } from "../services/photoStorage";

const ExpensesContext = createContext(null);

export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(expensesReducer, initialState);

  useEffect(() => {
    let cancelled = false;
    storage.getAllExpenses().then((expenses) => {
      if (!cancelled) dispatch({ type: "hydrate", expenses });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const actions = useMemo(
    () => ({
      addExpense(fields) {
        const expense = createExpense(fields);
        dispatch({ type: "add", expense });
        storage
          .addExpense(expense)
          .catch((e) => console.warn("persist add failed", e));
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        return expense;
      },
      updateExpense(existing, changes) {
        const updated = withUpdates(existing, changes);
        dispatch({ type: "update", expense: updated });
        storage
          .updateExpense(updated)
          .catch((e) => console.warn("persist update failed", e));
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        return updated;
      },

      removeExpense(expense) {
        dispatch({ type: "remove", id: expense.id });
        storage
          .removeExpense(expense.id)
          .catch((e) => console.warn("persist remove failed", e));
        if (expense.photoUri) {
          deleteReceiptPhoto(expense.photoUri).catch(() => {});
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      },
      clearAll() {
        dispatch({ type: "clear" });
        storage
          .clearAllExpenses()
          .catch((e) => console.warn("persist clear failed", e));
      },
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx)
    throw new Error("useExpenses must be used inside <ExpensesProvider>");
  return ctx;
}
