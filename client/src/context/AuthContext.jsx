/*
  Auth state for the CUNY-Connect client.
  This file holds the logged-in user and their token, and shares login, signup, and logout
  with the whole app through the useAuth hook.
  Owner: Person 1
  TODO: Save the token in localStorage and restore the session on load with GET /auth/me.
  Make login call POST /auth/login, signup call POST /auth/register, and logout clear the token and user.
  Keep loading true until /auth/me finishes so ProtectedRoute does not redirect too early.
*/
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

/**
 * Provides the current user, token, and auth actions to every component inside it.
 *
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The part of the app that can use auth.
 * @returns {JSX.Element} The children wrapped in the auth context.
 */
export function AuthProvider({ children }) {
  // Nobody is logged in yet, and the actions throw so a page that calls them early fails loudly instead of silently.
  const value = {
    user: null,
    token: null,
    loading: false,
    login: async () => {
      throw new Error('login is not implemented yet');
    },
    signup: async () => {
      throw new Error('signup is not implemented yet');
    },
    logout: () => {},
  };

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
