/*
  Route guard for the CUNY-Connect client.
  This file wraps pages that need a logged-in user, and optionally a specific role,
  for example <ProtectedRoute roles={['admin']}><AdminClubs /></ProtectedRoute>.
  Owner: Person 1
  TODO: Read user and loading from useAuth and show a loading message while loading.
  Redirect to /login when there is no user, and redirect to / when the user's role is not in roles.
*/
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Shows the wrapped page only to users who are allowed to see it.
 *
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The page to protect.
 * @returns {React.ReactNode} The page, or later a redirect when access is denied.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for /auth/me to finish so a refresh does not bounce a logged-in user to /login.
  if (loading) {
    return <p>Loading...</p>;
  }

  // Remember where they were headed so Login can send them back after they log in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}