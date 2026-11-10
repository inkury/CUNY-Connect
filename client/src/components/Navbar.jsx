/*
  Navigation bar for the CUNY-Connect client.
  This file renders the bar at the top of every page inside Layout: the logo, the main links, and the account links.
  It reads the logged-in user from useAuth(). Logged-out visitors see Events and Log in. Logged-in users also see
  Dashboard, their initials and first name (linking to /profile), and Log out, plus Officer or Admin when they have
  that role. While the saved session is being checked, a gray circle holds the avatar's place.
  On phones the links fold into a menu button that opens a dropdown panel.
  Owner: Person 3
*/
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// The links shown on desktop and in the phone menu. "end" makes Events active only on /, not on every page.
// "loggedInOnly" links are hidden from guests, following the Figma guest design.
const navLinks = [
  { to: '/', label: 'Events', end: true },
  { to: '/dashboard', label: 'Dashboard', loggedInOnly: true },
];

/**
 * Picks the classes for a desktop link. NavLink passes isActive when the link matches the current page.
 *
 * @param {{isActive: boolean}} state NavLink's state.
 * @returns {string} The Tailwind classes.
 */
function desktopLinkClass({ isActive }) {
  // Every link has a 2px bottom border, transparent when inactive, so the text does not jump when it becomes active.
  const base = 'flex h-18 items-center gap-2 border-b-2 px-1 text-[15px] transition-colors';
  if (isActive) {
    return base + ' border-accent font-bold text-primary';
  }
  return base + ' border-transparent font-medium text-slate-600 hover:border-border hover:text-primary';
}

/**
 * Picks the classes for a link in the phone menu.
 *
 * @param {{isActive: boolean}} state NavLink's state.
 * @returns {string} The Tailwind classes.
 */
function mobileLinkClass({ isActive }) {
  const base = 'flex items-center gap-3 border-l-4 px-4 py-3 text-[16px] font-bold transition-colors';
  if (isActive) {
    return base + ' border-accent text-primary';
  }
  return base + ' border-transparent text-slate-600 hover:text-primary';
}

/**
 * Builds the initials for the avatar from a full name.
 *
 * @param {string} name The full name, for example "Saba Chechelashvili".
 * @returns {string} Up to two letters, for example "SC", or "S" for a one word name.
 */
function getInitials(name) {
  // filter(Boolean) drops the empty pieces that extra spaces would leave behind.
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/**
 * Renders a round light navy avatar with the user's initials, or a generic person icon when there are none.
 *
 * @param {object} props The component props.
 * @param {string} [props.initials] The letters to show, for example "SC". Leave it out to show the icon.
 * @returns {JSX.Element} The avatar.
 */
function Avatar({ initials }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary">
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
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  // Closing the menu after a tap means it does not stay open on the next page.
  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/');
  }

  // Guests only see links that are not marked loggedInOnly.
  const visibleLinks = navLinks.filter((link) => user || !link.loggedInOnly);

  /**
   * Builds the role and account links. Desktop and the phone menu share them, each with its own classes.
   *
   * @param {function} linkClass desktopLinkClass or mobileLinkClass.
   * @param {string} buttonClass Extra classes that make the Log out button fit its menu.
   * @param {string} placeholderClass Classes that line the loading circle up with the links in its menu.
   * @returns {JSX.Element} The links, or a gray circle while the saved session is still being checked.
   */
  function renderAccountLinks(linkClass, buttonClass, placeholderClass) {
    // While loading, the user is not known yet, so showing Log in now would flash it for a logged-in user.
    // The gray circle is the same size as the avatar, so the bar does not jump when the real links arrive.
    if (loading) {
      return (
        <span className={placeholderClass} aria-hidden="true">
          <span className="block h-8 w-8 rounded-full bg-border" />
        </span>
      );
    }

    if (!user) {
      return (
        <NavLink to="/login" className={linkClass} onClick={closeMenu}>
          Log in
        </NavLink>
      );
    }

    // The ?? '' keeps the bar from crashing if a user somehow has no name.
    const name = user.name ?? '';
    return (
      <>
        {user.role === 'officer' && (
          <NavLink to="/officer" className={linkClass} onClick={closeMenu}>
            Officer
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink to="/admin" className={linkClass} onClick={closeMenu}>
            Admin
          </NavLink>
        )}
        <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
          <Avatar initials={getInitials(name)} />
          {name.trim().split(' ')[0] || 'Profile'}
        </NavLink>
        {/* Log out is a button, not a link, because it does something instead of opening a page. */}
        <button type="button" className={linkClass({ isActive: false }) + ' cursor-pointer ' + buttonClass} onClick={handleLogout}>
          Log out
        </button>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      {/* The inner row lines up with the Layout's content: same max width and side padding. */}
      <div className="mx-auto flex h-18 max-w-275 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary" onClick={closeMenu}>
          <span className="grid h-8.5 w-8.5 place-items-center rounded-[9px] bg-primary font-heading font-bold text-white">
            C
          </span>
          <span className="font-heading text-lg font-bold">CUNY Connect</span>
        </Link>

        {/* Desktop links are hidden on phones and shown as a row from md (768px) up. */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {renderAccountLinks(desktopLinkClass, '', 'flex h-18 items-center px-1')}
        </nav>

        {/* The menu button only shows on phones. aria-expanded tells screen readers whether the menu is open. */}
        <button
          type="button"
          className="rounded-md p-2 text-slate-600 transition-colors hover:text-primary md:hidden"
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
        <nav id="mobile-menu" className="border-t border-border bg-white py-2 md:hidden" aria-label="Main">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
          {renderAccountLinks(mobileLinkClass, 'w-full text-left', 'flex border-l-4 border-transparent px-4 py-3')}
        </nav>
      )}
    </header>
  );
}
