/*
  Auth state for the CUNY-Connect client.
  This file holds the logged-in user and their token, and shares login, signup, and logout
  with the whole app through the useAuth hook.
  Owner: Person 1
  TODO: Save the token in localStorage and restore the session on load with GET /auth/me.
  Make login call POST /auth/login, signup call POST /auth/register, and logout clear the token and user.
  Keep loading true until /auth/me finishes so ProtectedRoute does not redirect too early.
*/
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Provides the current user, token, and auth actions to every component inside it.
 *
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The part of the app that can use auth.
 * @returns {JSX.Element} The children wrapped in the auth context.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // Start as loading only if there is a saved token to check, so logged-out visitors see pages right away.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  // On first load, use the saved token to restore the session.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // The token is expired or invalid, so forget it.
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Saves the token first so the axios interceptor can send it on later requests.
  function saveSession(newToken, newUser) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data.token, res.data.user);
    return res.data.user;
  }

  // fields is an object like { name, email, password, campus }.
  async function signup(fields) {
    const res = await api.post('/auth/register', fields);
    saveSession(res.data.token, res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  const value = { user, token, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns the auth state and actions from the nearest AuthProvider.
 *
 * @returns {object} The user, token, loading flag, and the login, signup, and logout functions.
 */
export function useAuth() {
  return useContext(AuthContext);
}
