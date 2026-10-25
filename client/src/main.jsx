/*
  Entry point for the CUNY-Connect client.
  This file loads the global styles and renders the app inside the router and the AuthProvider.
  Owner: Person 1
  TODO: Add any other app-wide providers here.
*/
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './styles/variables.css';
import './styles/global.css';

// The router and AuthProvider wrap the whole app so every page can use routing and auth state.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
