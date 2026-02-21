import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const showSuccess = useCallback(
    (message) => showNotification(message, 'success'),
    [showNotification]
  );

  const showError = useCallback(
    (message) => showNotification(message, 'error'),
    [showNotification]
  );

  const showWarning = useCallback(
    (message) => showNotification(message, 'warning'),
    [showNotification]
  );

  const showInfo = useCallback(
    (message) => showNotification(message, 'info'),
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        hideNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
