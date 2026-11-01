/*
  Navigation bar for the CUNY-Connect client.
  This file renders the bar at the top of every page inside Layout: the logo, the main links, and the profile link.
  On phones the links fold into a menu button that opens a dropdown panel.
  Owner: Person 3
  TODO: When AuthContext is ready, show the logged-in user's initials and first name in the profile link,
  or a "Log in" link if nobody is logged in.
  TODO: Add a Log out button when logged in.
  TODO: Show the Officer and Admin links only to users with those roles.
*/
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

// The links shown on desktop and in the phone menu. "end" makes Events active only on /, not on every page.
const navLinks = [
  { to: '/', label: 'Events', end: true },
  { to: '/dashboard', label: 'Dashboard' },
];

/**
 * Picks the classes for a desktop link. NavLink passes isActive when the link matches the current page.
 *
 * @param {{isActive: boolean}} state NavLink's state.
 * @returns {string} The Tailwind classes.
 */
function desktopLinkClass({ isActive }) {
  // Every link has a 2px bottom border, transparent when inactive, so the text does not jump when it becomes active.
  const base = 'flex h-16 items-center gap-2 border-b-2 px-1 text-sm font-medium transition-colors';
  if (isActive) {
    return base + ' border-primary text-primary';
  }
  return base + ' border-transparent text-gray-600 hover:border-gray-300 hover:text-primary';
}

/**
 * Picks the classes for a link in the phone menu.
 *
 * @param {{isActive: boolean}} state NavLink's state.
 * @returns {string} The Tailwind classes.
 */
function mobileLinkClass({ isActive }) {
  const base = 'flex items-center gap-3 border-l-4 px-4 py-3 font-medium transition-colors';
  if (isActive) {
    return base + ' border-primary bg-gray-50 text-primary';
  }
  return base + ' border-transparent text-gray-700 hover:bg-gray-50 hover:text-primary';
}

/**
 * Renders a round navy avatar with the user's initials, or a generic person icon when there are none.
 *
 * @param {object} props The component props.
 * @param {string} [props.initials] The letters to show, for example "JM". Leave it out to show the icon.
 * @returns {JSX.Element} The avatar.
 */
function Avatar({ initials }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
      {initials ? (
        initials
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )}
    </span>
  );
}

/**
 * Renders the top navigation bar.
 *
 * @returns {JSX.Element} The navbar.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  // Closing the menu after a tap means it does not stay open on the next page.
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      {/* The inner row lines up with the Layout's content: same max width and side padding. */}
      <div className="mx-auto flex h-16 max-w-275 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary" onClick={closeMenu}>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-heading font-bold text-white">
            C
          </span>
          <span className="font-heading text-lg">
            CUNY <span className="font-bold">Connect</span>
          </span>
        </Link>

        {/* Desktop links are hidden on phones and shown as a row from md (768px) up. */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/profile" className={desktopLinkClass}>
            <Avatar />
            Profile
          </NavLink>
        </nav>

        {/* The menu button only shows on phones. aria-expanded tells screen readers whether the menu is open. */}
        <button
          type="button"
          className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary md:hidden"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* The phone menu panel sits under the bar, with the same links stacked. It only renders while open. */}
      {menuOpen && (
        <nav id="mobile-menu" className="border-t border-gray-200 bg-white py-2 md:hidden" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/profile" className={mobileLinkClass} onClick={closeMenu}>
            <Avatar />
            Profile
          </NavLink>
        </nav>
      )}
    </header>
  );
}
