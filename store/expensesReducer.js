export const initialState = {
  hydrated: false,
  expenses: [],
};

export function expensesReducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return { hydrated: true, expenses: action.expenses };
    case "add":
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case "update":
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.expense.id ? action.expense : e,
        ),
      };
    case "remove":
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.id),
      };
    case "clear":
      return { ...state, expenses: [] };
    default:
      return state;
  }
}
