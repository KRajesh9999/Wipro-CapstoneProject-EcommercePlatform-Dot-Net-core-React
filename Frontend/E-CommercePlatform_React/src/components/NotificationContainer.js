import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideNotification } from '../redux/slices/notificationSlice';
import Notification from './Notification';

const NotificationContainer = () => {
  const dispatch = useDispatch();
  const notification = useSelector(state => state.notification.notification);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  const handleClose = () => {
    dispatch(hideNotification());
  };

  return (
    <Notification 
      notification={notification} 
      onClose={handleClose} 
    />
  );
};

export default NotificationContainer;