/*
  Shared page layout for the CUNY-Connect client.
  This file wraps every page that shows the navbar: the navbar at the top, the main content area, and the footer.
  App.jsx uses it as a layout route, and the current page is drawn where <Outlet /> is.
  Owner: Person 3
*/
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/**
 * Renders the navbar, the centered content area for the current page, and the footer.
 *
 * @returns {JSX.Element} The page layout.
 */
export default function Layout() {
  // min-h-screen with flex-col, plus flex-1 on main, lets the main area grow, so the footer stays at the bottom on short pages.
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* The content is centered and capped at 1100px to match --max-width in variables.css. Padding grows on bigger screens. */}
      <main className="mx-auto w-full max-w-275 flex-1 px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      {/* The strip is full width, and its inner row uses the same max width and padding as main so the text lines up with the page. */}
      <footer className="border-t border-border bg-page">
        {/* The text is centered on phones and sits on the left from md (768px) up. */}
        <div className="mx-auto max-w-275 px-4 py-7 text-center text-[13px] leading-4 text-slate md:px-8 md:text-left">
          <p>© 2026 CUNY Connect</p>
        </div>
      </footer>
    </div>
  );
}
