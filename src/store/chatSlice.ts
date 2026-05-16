import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isOpen: boolean;
  activeSessionId: string | null;
  lessonContext: string | null; // lesson content passed to AI
}

const initialState: ChatState = {
  isOpen: false,
  activeSessionId: null,
  lessonContext: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChat: (
      state,
      action: PayloadAction<{ sessionId?: string; lessonContext?: string }>
    ) => {
      state.isOpen = true;
      if (action.payload.sessionId) state.activeSessionId = action.payload.sessionId;
      if (action.payload.lessonContext) state.lessonContext = action.payload.lessonContext;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    setSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
  },
});

export const { openChat, closeChat, setSession } = chatSlice.actions;
export default chatSlice.reducer;
