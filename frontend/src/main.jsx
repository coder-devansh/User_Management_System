import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import App from './App';
import theme from './theme';
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <NotificationProvider>
            <CssBaseline />
            <App />
          </NotificationProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
