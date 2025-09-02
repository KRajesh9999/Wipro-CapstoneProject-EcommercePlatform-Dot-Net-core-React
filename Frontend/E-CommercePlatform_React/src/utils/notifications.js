import store from '../redux/store';
import { showNotification } from '../redux/slices/notificationSlice';

export const notify = {
  success: (message) => store.dispatch(showNotification({ message, type: 'success' })),
  error: (message) => store.dispatch(showNotification({ message, type: 'error' })),
  warning: (message) => store.dispatch(showNotification({ message, type: 'warning' })),
  info: (message) => store.dispatch(showNotification({ message, type: 'info' })),
};