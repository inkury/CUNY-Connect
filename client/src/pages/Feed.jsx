/*
  Feed page for CUNY-Connect, shown at /.
  This is the home page, where students browse upcoming events across all CUNY campuses.
  It loads the events from GET /events and shows them as EventCards.
  Owner: Person 3
  TODO: Add the hero and the campus, date, and category filters next (GET /events takes campus, category, and date).
  TODO: Style the loading, error, and empty messages to match the Figma.
*/
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import EventCard from '../components/EventCard.jsx';

/**
 * Renders the event feed.
 *
 * @returns {JSX.Element} The heading and a grid of event cards, or a loading, error, or empty message.
 */
export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the events once, when the page first shows.
  useEffect(() => {
    // If the page closes before the request finishes, ignore the answer instead of updating a page that is gone.
    let ignore = false;

    async function loadEvents() {
      try {
        const response = await api.get('/events');
        if (!ignore) {
          setEvents(response.data);
        }
      } catch (err) {
        // The server sends errors as { message }. If there is no answer at all, the server is probably not running.
        if (!ignore) {
          setError(err.response?.data?.message || 'Could not load events. Please try again later.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEvents();
    return () => {
      ignore = true;
    };
  }, []);

  // Only one of these shows at a time: loading, then either the error, the empty message, or the cards.
  let content;
  if (loading) {
    content = <p className="text-slate">Loading events...</p>;
  } else if (error) {
    content = <p className="text-slate">{error}</p>;
  } else if (events.length === 0) {
    content = <p className="text-slate">No upcoming events yet.</p>;
  } else {
    // The grid starts at one column on phones and adds columns on bigger screens.
    content = (
      <>
        <p className="mb-6 text-slate">
          {events.length} {events.length === 1 ? 'event' : 'events'} selected for you
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mb-2 font-body text-[12px] leading-4 font-extrabold tracking-widest text-primary uppercase">
        Happening around CUNY
      </p>
      <h1 className="mb-2">Events worth showing up for</h1>
      {content}
    </>
  );
}
