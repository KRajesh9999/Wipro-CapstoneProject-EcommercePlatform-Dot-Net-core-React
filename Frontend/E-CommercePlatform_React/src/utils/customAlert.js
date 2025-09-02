import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomAlert from '../components/CustomAlert';

export const customAlert = (message) => {
  const alertContainer = document.createElement('div');
  document.body.appendChild(alertContainer);
  
  const root = createRoot(alertContainer);
  
  const closeAlert = () => {
    root.unmount();
    document.body.removeChild(alertContainer);
  };
  
  root.render(<CustomAlert message={message} onClose={closeAlert} />);
};

// Override global alert
window.alert = customAlert;