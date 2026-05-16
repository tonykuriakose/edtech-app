import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import quizReducer from "./quizSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    quiz: quizReducer,
    chat: chatReducer,
  },
});

// TypeScript helpers — use these instead of plain RootState/AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
