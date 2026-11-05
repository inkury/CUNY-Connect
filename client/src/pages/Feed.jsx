/*
  Feed page for CUNY-Connect, shown at /.
  This is the home page, where students browse upcoming events across all CUNY campuses.
  For now it previews the EventCards with sample data.
  Owner: Person 3
  TODO: Real data from GET /api/events replaces sampleEvents later.
  TODO: Add the hero and the campus, date, and category filters next.
  TODO: Add loading and empty states.
*/
import EventCard from '../components/EventCard.jsx';
import sampleEvents from '../data/sampleEvents.js';

/**
 * Renders the event feed.
 *
 * @returns {JSX.Element} The heading and a grid of event cards.
 */
export default function Feed() {
  // The grid starts at one column on phones and adds columns on bigger screens.
  return (
    <>
      <p className="mb-2 font-body text-[12px] leading-4 font-extrabold tracking-widest text-primary uppercase">
        Happening around CUNY
      </p>
      <h1>Events worth showing up for</h1>
      <p className="mt-2 mb-6 text-slate">{sampleEvents.length} events selected for you</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleEvents.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </>
  );
}
