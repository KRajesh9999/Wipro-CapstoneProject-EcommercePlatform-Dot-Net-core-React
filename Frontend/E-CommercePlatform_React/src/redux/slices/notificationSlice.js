import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notification = {
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'success',
      };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;