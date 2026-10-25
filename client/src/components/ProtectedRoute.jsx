/*
  Route guard for the CUNY-Connect client.
  This file wraps pages that need a logged-in user, and optionally a specific role,
  for example <ProtectedRoute roles={['admin']}><AdminClubs /></ProtectedRoute>.
  Owner: Person 1
  TODO: Read user and loading from useAuth and show a loading message while loading.
  Redirect to /login when there is no user, and redirect to / when the user's role is not in roles.
*/

/**
 * Shows the wrapped page only to users who are allowed to see it.
 *
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The page to protect.
 * @returns {React.ReactNode} The page, or later a redirect when access is denied.
 */
export default function ProtectedRoute({ children }) {
  // Every page is shown to everyone for now, and the roles prop is ignored, so the app stays clickable until real auth exists.
  return children;
}
