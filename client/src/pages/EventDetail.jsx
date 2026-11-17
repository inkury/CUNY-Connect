/*
  EventDetail page for CUNY-Connect, shown at /events/:id.
  This page shows the full details of one event, loaded from GET /events/:id.
  Owner: Person 3
  The main card matches the Figma: a category banner with a big icon, then the title and the description.
  TODO: Move the date, location, host club, and save button into the Figma info card beside the main card.
*/
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import { categoryGradients } from '../components/EventCard.jsx';
import useSaveEvent from '../hooks/useSaveEvent.js';
import { formatEventDateTime } from '../utils/dateHelpers.js';

// The big banner icon for each category in client/src/constants.js.
const categoryIcons = {
  Tech: 'code',
  Academic: 'book',
  Career: 'briefcase',
  Cultural: 'globe',
  Social: 'users',
  Sports: 'trophy',
  Arts: 'palette',
  Volunteering: 'heart',
  Other: 'sparkle',
};

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
  // The page already has its own loading flag, so the auth one is renamed to authLoading.
  const { user, loading: authLoading } = useAuth();
  // The hook uses the id from the URL, so it can run before the event finishes loading.
  const { saved, toggleSave } = useSaveEvent(id);

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

  // Only one of these shows at a time: loading, the error or not-found message, or the event.
  let content;
  if (loading) {
    content = <p className="text-slate">Loading event...</p>;
  } else if (error) {
    content = <p className="text-slate">{error}</p>;
  } else {
    // The banner reuses the EventCard gradient for the category. Unknown categories fall back to Other.
    const [gradientStart, gradientEnd] = categoryGradients[event.category] ?? categoryGradients.Other;
    const iconName = categoryIcons[event.category] ?? categoryIcons.Other;

    content = (
      <>
        {/* The main card. It is 710px wide on large screens, like the Figma, so the info card can sit beside it later. */}
        <article className="overflow-hidden rounded-2xl border border-border bg-white lg:max-w-177.5">
          {/* The gradient colors change per category, so they are passed in as CSS variables. The angle changes at md. */}
          <div
            className="relative flex h-52.5 items-center justify-center overflow-hidden bg-[linear-gradient(141.81deg,var(--from)_0%,var(--to)_71.43%)] md:h-67.5 md:pt-6 md:pl-6 md:bg-[linear-gradient(153.05deg,var(--from)_0%,var(--to)_71.43%)]"
            style={{ '--from': gradientStart, '--to': gradientEnd }}
          >
            {/* A thick soft ring behind the icon, a little off center like the Figma. */}
            <span
              className="absolute top-1/2 left-[calc(50%-3px)] h-67.5 w-67.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-48 border-white/12 md:left-[calc(50%+31px)] md:h-77.5 md:w-77.5 md:border-60"
              aria-hidden="true"
            />
            <span className="absolute top-5 left-5 rounded-full bg-primary-50 px-3 py-1.25 font-body text-[11px] leading-4.5 font-extrabold tracking-[1.54px] text-ink uppercase md:top-6 md:left-7">
              {event.category}
            </span>
            {/* The Figma icon is 56px on phones and 72px on desktop, both with a 3px line. */}
            <Icon name={iconName} size={56} strokeWidth={1.29} className="relative text-white md:hidden" />
            <Icon name={iconName} size={72} strokeWidth={1} className="relative hidden text-white md:block" />
          </div>

          <div className="flex flex-col gap-3 px-5 pt-6 pb-7 md:gap-3.5 md:px-10 md:pt-9 md:pb-10">
            <p className="font-body text-[12px] leading-4.5 font-extrabold tracking-[1.68px] text-primary uppercase">
              Featured event
            </p>
            <h1 className="text-[34px] leading-9.5 tracking-[-0.85px] md:text-[48px] md:leading-13.5 md:tracking-[-1.2px]">
              {event.title}
            </h1>
            {/* On desktop the About section has 20px of extra space above it, and 10px between the heading and the text. */}
            <h2 className="text-[22px] leading-7 tracking-[-0.44px] md:pt-5 md:text-[24px] md:leading-7.5 md:tracking-[-0.48px]">
              About this event
            </h2>
            <p className="text-[16px] leading-6.5 text-slate md:-mt-1">{event.description}</p>
          </div>
        </article>

        {/* These stay plain for now. Part 2 moves them into the info card next to the main card. */}
        <div className="mt-5 flex flex-col gap-3 md:mt-6">
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

          {/* A plain save button for now. Guests who click it are sent to the login page. */}
          <button
            type="button"
            className="cursor-pointer self-start rounded-[10px] border border-primary px-4 py-2 font-bold text-primary"
            onClick={toggleSave}
            aria-pressed={saved}
          >
            {saved ? 'Saved' : 'Save event'}
          </button>
          {!authLoading && !user && <p className="text-[14px]">Sign in to save events</p>}
        </div>
      </>
    );
  }

  // The gray page fills the full width and cancels the page padding, without changing Layout.jsx.
  // Its inner box uses the page's max width, so it lines up with the navbar and footer.
  return (
    <div className="mx-[calc(50%-50vw)] -my-6 bg-page md:-my-10">
      <div className="mx-auto max-w-275 px-4 pt-6 pb-12 md:px-8 md:pt-9 md:pb-24">
        <Link to="/" className="mb-5 flex w-fit items-center gap-1.5 text-[16px] leading-5 font-bold text-primary md:mb-6 md:text-[14px]">
          <Icon name="arrow-left" strokeWidth={3} />
          Back to all events
        </Link>
        {content}
      </div>
    </div>
  );
}
