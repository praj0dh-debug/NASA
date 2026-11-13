import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { UserProvider } from './context/UserContext';
import { ProgressProvider } from './context/ProgressContext';
import { A11yProvider } from './components/accessibility/a11yContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <ProgressProvider>
        <A11yProvider>
          <App />
        </A11yProvider>
      </ProgressProvider>
    </UserProvider>
  </React.StrictMode>
);

