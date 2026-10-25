/*
  Event card for the CUNY-Connect client.
  This file shows a short preview of one event, and it is reused by the Feed, Dashboard, and ClubProfile pages.
  Owner: Person 3
  TODO: Show the title, date and time, location, campus, category, and host club name.
  Link the card to /events/:id, and optionally add a save button that uses Person 4's save route.
*/

/**
 * Renders a preview of one event.
 *
 * @param {object} props The component props.
 * @param {object} props.event The event to show.
 * @returns {JSX.Element} The event card.
 */
export default function EventCard({ event }) {
  // The fallback title keeps the card from rendering blank when an event is missing data.
  return <div className="event-card">EventCard: {event?.title ?? 'untitled event'}</div>;
}
