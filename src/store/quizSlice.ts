import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuizState {
  currentQuestion: number;
  answers: Record<string, number>; // questionId → selected option index
  timeRemaining: number;
  isSubmitting: boolean;
  isFinished: boolean;
}

const initialState: QuizState = {
  currentQuestion: 0,
  answers: {},
  timeRemaining: 0,
  isSubmitting: false,
  isFinished: false,
};

export const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    startQuiz: (state, action: PayloadAction<{ timeLimit: number }>) => {
      state.currentQuestion = 0;
      state.answers = {};
      state.timeRemaining = action.payload.timeLimit;
      state.isSubmitting = false;
      state.isFinished = false;
    },
    setAnswer: (
      state,
      action: PayloadAction<{ questionId: string; optionIndex: number }>
    ) => {
      state.answers[action.payload.questionId] = action.payload.optionIndex;
    },
    nextQuestion: (state) => {
      state.currentQuestion += 1;
    },
    prevQuestion: (state) => {
      state.currentQuestion -= 1;
    },
    tick: (state) => {
      if (state.timeRemaining > 0) state.timeRemaining -= 1;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    finishQuiz: (state) => {
      state.isFinished = true;
    },
    resetQuiz: () => initialState,
  },
});

export const {
  startQuiz,
  setAnswer,
  nextQuestion,
  prevQuestion,
  tick,
  setSubmitting,
  finishQuiz,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;
