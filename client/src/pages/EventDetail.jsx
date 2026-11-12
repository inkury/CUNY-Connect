/*
  EventDetail page for CUNY-Connect, shown at /events/:id.
  This page shows the full details of one event, loaded from GET /events/:id.
  Owner: Person 3
  TODO: Style this page to match the Figma.
  TODO: Add a save button that calls Person 4's POST and DELETE /users/me/saved/:eventId. Both need a login,
  so guests should be sent to /login instead.
*/
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { formatEventDateTime } from '../utils/dateHelpers.js';

/**
 * Renders the details of one event.
 *
 * @returns {JSX.Element} The event details, or a loading, error, or not-found message.
 */
export default function EventDetail() {
  // The id comes from the URL, for example /events/abc123 gives "abc123".
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the event again whenever the id in the URL changes.
  useEffect(() => {
    // If the page closes or the id changes before the request finishes, ignore the old answer.
    let ignore = false;

    async function loadEvent() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/events/${id}`);
        if (!ignore) {
          setEvent(response.data);
        }
      } catch (err) {
        if (!ignore) {
          setEvent(null);
          // A 404 means there is no event with this id. Anything else uses the server's message if it sent one.
          if (err.response?.status === 404) {
            setError('Event not found');
          } else {
            setError(err.response?.data?.message || 'Could not load this event. Please try again later.');
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEvent();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-slate">Loading event...</p>;
  }
  if (error) {
    return <p className="text-slate">{error}</p>;
  }

  return (
    <article className="flex flex-col gap-3">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>
        <strong className="text-ink">When:</strong> {formatEventDateTime(event.dateTime)}
      </p>
      <p>
        <strong className="text-ink">Where:</strong> {event.location}
      </p>
      <p>
        <strong className="text-ink">Campus:</strong> {event.campus}
      </p>
      {/* hostClub is null when its club was deleted, so the page shows "Unknown club" without a link instead of crashing. */}
      <p>
        <strong className="text-ink">Hosted by:</strong>{' '}
        {event.hostClub?._id ? (
          <Link to={`/clubs/${event.hostClub._id}`} className="font-bold">
            {event.hostClub.name}
          </Link>
        ) : (
          'Unknown club'
        )}
      </p>
    </article>
  );
}
