/*
  Navigation bar for the CUNY-Connect client.
  This file renders the links at the top of every page.
  Owner: Person 3
  TODO: Show Log in and Sign up only when logged out, and Profile and Log out when logged in.
  Show the Officer and Admin links only to those roles. Add styling, an active-link state, and a mobile layout.
*/
import { NavLink } from 'react-router-dom';

/**
 * Renders the top navigation links.
 *
 * @returns {JSX.Element} The navbar.
 */
export default function Navbar() {
  // Every link is shown for now so all pages are easy to reach while the app is being built.
  return (
    <nav className="navbar">
      <NavLink to="/" end>
        CUNY Connect
      </NavLink>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/officer">Officer</NavLink>
      <NavLink to="/admin">Admin</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/login">Log in</NavLink>
      <NavLink to="/signup">Sign up</NavLink>
    </nav>
  );
}
