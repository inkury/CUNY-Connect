/*
  Small line icons for the CUNY-Connect client.
  This file draws the icons used on event cards as inline SVGs, so the app does not need an icon library.
  Owner: Person 3
  TODO: Add more icons here as new pages need them.
*/

// Each icon is just the SVG shapes that go inside the shared <svg> tag below.
const iconShapes = {
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
  'bookmark-filled': <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" fill="currentColor" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
};

/**
 * Renders one icon as an inline SVG. Its color comes from the text color of the parent, for example text-primary.
 *
 * @param {object} props The component props.
 * @param {string} props.name Which icon to draw: "calendar", "map-pin", "bookmark", "bookmark-filled", or "chevron-right".
 * @param {number} [props.size] The width and height in pixels.
 * @param {string} [props.className] Extra Tailwind classes.
 * @returns {JSX.Element} The icon.
 */
export default function Icon({ name, size = 16, className = '' }) {
  // aria-hidden hides the icon from screen readers, because the text or label next to it already says the same thing.
  return (
    <svg
      className={'shrink-0 ' + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconShapes[name]}
    </svg>
  );
}
