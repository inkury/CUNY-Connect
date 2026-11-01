/*
  Shared page layout for the CUNY-Connect client.
  This file wraps every page that shows the navbar: the navbar spot at the top, then the main content area.
  App.jsx uses it as a layout route, and the current page is drawn where <Outlet /> is.
  Owner: Person 3
  TODO: Render the Navbar at the top once it is rebuilt with Tailwind, and remove the Navbar from App.jsx.
  TODO: Add a footer below the main content area.
*/
import { Outlet } from 'react-router-dom';

/**
 * Renders the navbar area and the centered content area for the current page.
 *
 * @returns {JSX.Element} The page layout.
 */
export default function Layout() {
  // min-h-screen with flex-col lets the main area grow, so a footer added later stays at the bottom on short pages.
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar goes here. */}

      {/* The content is centered and capped at 1100px to match --max-width in variables.css. Padding grows on bigger screens. */}
      <main className="mx-auto w-full max-w-275 flex-1 px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
