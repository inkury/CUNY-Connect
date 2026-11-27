/*
  EventDetail page for CUNY-Connect, shown at /events/:id.
  This page shows the full details of one event, loaded from GET /events/:id.
  Owner: Person 3
  It matches the Figma: the main card with the category banner, title, and description, and an info card with the
  date, location, host club, and save button. On desktop the info card sits beside the main card; on phones it goes below.
  While loading it shows gray skeleton cards. Not found and errors show a centered message with buttons.
  The info card also links to Google Calendar and Google Maps.
*/
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import StatusBlock from '../components/StatusBlock.jsx';
import { categoryGradients } from '../components/EventCard.jsx';
import useSaveEvent from '../hooks/useSaveEvent.js';
import { formatEventDate, formatEventTime, toGoogleCalendarTime } from '../utils/dateHelpers.js';

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

// Shared classes for the info card rows, buttons, and small text, so the matching pieces stay the same.
const infoRowClass = 'flex items-start gap-3.5 text-[14px] leading-5 text-slate dark:text-dark-slate';
const infoIconClass = 'grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-50 dark:bg-dark-primary-50 text-primary dark:text-dark-link';
const buttonClass = 'flex w-full items-center justify-center rounded-[11px] px-5.5 py-3 text-[16px] leading-6 font-bold transition-colors';
const captionClass = 'text-center text-[12px] leading-4 text-slate dark:text-dark-slate';
// The page layout and the two card boxes. The loading skeleton uses them too, so it has the same shape as the event.
const columnsClass = 'flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-10';
const mainCardClass = 'min-w-0 overflow-hidden rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface lg:flex-1';
const infoCardClass =
  'flex flex-col gap-4.5 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-[0_4px_14px_var(--color-ink)] shadow-ink/6 md:gap-5 md:p-6 lg:sticky lg:top-24 lg:w-87.5 lg:shrink-0';
// The buttons in the not-found and error messages: navy for the main action, outlined for the other one.
const messageButtonClass = 'flex items-center justify-center rounded-[11px] px-5.5 py-3 text-[16px] leading-6 font-bold transition-colors';
const primaryButtonClass =
  messageButtonClass + ' cursor-pointer border border-transparent bg-primary dark:bg-dark-primary text-white shadow-[0_8px_18px_var(--color-primary)] shadow-primary/25 hover:bg-primary-dark dark:hover:bg-dark-primary/90';
const outlineButtonClass = messageButtonClass + ' border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-primary dark:text-dark-link hover:text-primary-dark dark:hover:text-dark-ink';
// The text shown when GET /events/:id answers 404.
const notFoundMessage = 'Event not found';

// The Calendar and Maps links look like the club link, with the same 44px tap area.
const infoLinkClass = 'relative mt-0.5 block w-fit font-bold after:absolute after:-inset-x-2 after:-inset-y-3';

/**
 * Builds a Google Calendar link that opens a new event filled in with this event's details.
 *
 * @param {object} event The event.
 * @returns {string} The link, or '' when the title or a valid start time is missing.
 */
function getCalendarLink(event) {
  const start = new Date(event.dateTime);
  if (!event.title || Number.isNaN(start.getTime())) {
    return '';
  }
  // Events only have a start time, so the calendar entry ends 1 hour after it starts.
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const place = [event.location, event.campus].filter(Boolean).join(', ');
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(event.title) +
    '&dates=' + toGoogleCalendarTime(start) + '/' + toGoogleCalendarTime(end) +
    '&details=' + encodeURIComponent(event.description ?? '') +
    '&location=' + encodeURIComponent(place)
  );
}

/**
 * Builds a Google Maps search link for the event's location and campus.
 *
 * @param {object} event The event.
 * @returns {string} The link, or '' when there is no location or campus.
 */
function getMapsLink(event) {
  const place = [event.location, event.campus].filter(Boolean).join(', ');
  if (!place) {
    return '';
  }
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place);
}

/**
 * Renders gray placeholders shaped like the main card and the info card, shown while the event loads.
 *
 * @returns {JSX.Element} The skeleton.
 */
function EventDetailSkeleton() {
  // The pulse is skipped for people who turn off motion. The hidden text tells screen readers the page is loading.
  return (
    <div className={columnsClass + ' motion-safe:animate-pulse'} aria-busy="true">
      <p className="sr-only">Loading event...</p>
      <div className={mainCardClass}>
        <div className="h-52.5 bg-border dark:bg-dark-border md:h-67.5" />
        <div className="flex flex-col gap-3 px-5 pt-6 pb-7 md:gap-3.5 md:px-10 md:pt-9 md:pb-10">
          <div className="h-4 w-32 rounded-md bg-border dark:bg-dark-border" />
          <div className="h-9.5 w-3/4 rounded-md bg-border dark:bg-dark-border md:h-13.5" />
          <div className="mt-2 h-7 w-48 rounded-md bg-border dark:bg-dark-border" />
          <div className="h-4 w-full rounded-md bg-border dark:bg-dark-border" />
          <div className="h-4 w-5/6 rounded-md bg-border dark:bg-dark-border" />
        </div>
      </div>
      <div className={infoCardClass}>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-3.5">
            <div className="h-10 w-10 shrink-0 rounded-[10px] bg-border dark:bg-dark-border" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3.5 w-2/3 rounded-md bg-border dark:bg-dark-border" />
              <div className="h-3.5 w-1/3 rounded-md bg-border dark:bg-dark-border" />
            </div>
          </div>
        ))}
        <div className="h-12 rounded-[11px] bg-border dark:bg-dark-border" />
      </div>
    </div>
  );
}

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
  // Try again adds one to this, which loads the event again.
  const [attempt, setAttempt] = useState(0);
  // The page already has its own loading flag, so the auth one is renamed to authLoading.
  const { user, loading: authLoading } = useAuth();
  // The hook uses the id from the URL, so it can run before the event finishes loading.
  const { saved, toggleSave } = useSaveEvent(id);

  // Load the event again whenever the id in the URL changes, or Try again is clicked.
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
            setError(notFoundMessage);
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
  }, [id, attempt]);

  // Only one of these shows at a time: loading, the error or not-found message, or the event.
  let content;
  if (loading) {
    content = <EventDetailSkeleton />;
  } else if (error === notFoundMessage) {
    content = (
      <StatusBlock icon="search" title="Event not found" message="This event may have been removed, or the link may be wrong.">
        <Link to="/" className={primaryButtonClass}>
          Back to all events
        </Link>
      </StatusBlock>
    );
  } else if (error) {
    content = (
      <StatusBlock icon="alert-circle" title="Couldn't load this event" message={error}>
        <button type="button" className={primaryButtonClass} onClick={() => setAttempt((n) => n + 1)}>
          Try again
        </button>
        <Link to="/" className={outlineButtonClass}>
          Back to all events
        </Link>
      </StatusBlock>
    );
  } else {
    // The banner reuses the EventCard gradient for the category. Unknown categories fall back to Other.
    const [gradientStart, gradientEnd] = categoryGradients[event.category] ?? categoryGradients.Other;
    const iconName = categoryIcons[event.category] ?? categoryIcons.Other;
    const calendarLink = getCalendarLink(event);
    const mapsLink = getMapsLink(event);

    content = (
      // Phones stack the two cards. Desktop puts them side by side, with the main card taking the space left over.
      <div className={columnsClass}>
        <article className={mainCardClass}>
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
            <p className="font-body text-[12px] leading-4.5 font-extrabold tracking-[1.68px] text-primary dark:text-dark-link uppercase">
              Featured event
            </p>
            <h1 className="text-[34px] leading-9.5 tracking-[-0.85px] md:text-[48px] md:leading-13.5 md:tracking-[-1.2px]">
              {event.title}
            </h1>
            {/* On desktop the About section has 20px of extra space above it, and 10px between the heading and the text. */}
            <h2 className="text-[22px] leading-7 tracking-[-0.44px] md:pt-5 md:text-[24px] md:leading-7.5 md:tracking-[-0.48px]">
              About this event
            </h2>
            <p className="text-[16px] leading-6.5 text-slate dark:text-dark-slate md:-mt-1">{event.description}</p>
          </div>
        </article>

        {/* The info card. On desktop it is 350px wide and stays in view while the page scrolls, just below the navbar. */}
        <aside className={infoCardClass}>
          <div className={infoRowClass}>
            <span className={infoIconClass}>
              <Icon name="calendar" size={18} />
            </span>
            <p className="min-w-0">
              <span className="block font-bold text-ink dark:text-dark-ink">{formatEventDate(event.dateTime)}</span>
              <span className="mt-0.5 block">{formatEventTime(event.dateTime)}</span>
              {calendarLink && (
                <a href={calendarLink} target="_blank" rel="noopener noreferrer" className={infoLinkClass}>
                  Add to Google Calendar
                </a>
              )}
            </p>
          </div>
          <div className={infoRowClass}>
            <span className={infoIconClass}>
              <Icon name="map-pin" size={18} />
            </span>
            <p className="min-w-0">
              <span className="block font-bold text-ink dark:text-dark-ink">{event.location}</span>
              <span className="mt-0.5 block">{event.campus}</span>
              {mapsLink && (
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className={infoLinkClass}>
                  Open in Maps
                </a>
              )}
            </p>
          </div>
          <div className={infoRowClass}>
            <span className={infoIconClass}>
              <Icon name="users" size={18} />
            </span>
            {/* hostClub is null when its club was deleted, so the card shows "Unknown club" without a link instead of crashing. */}
            <p className="min-w-0 font-bold">
              <span className="block text-ink dark:text-dark-ink">Hosted by</span>
              {event.hostClub?._id ? (
                <Link to={`/clubs/${event.hostClub._id}`} className="relative mt-0.5 block w-fit after:absolute after:-inset-x-2 after:-inset-y-3">
                  {event.hostClub.name} →
                </Link>
              ) : (
                <span className="mt-0.5 block text-ink dark:text-dark-ink">Unknown club</span>
              )}
            </p>
          </div>

          {saved ? (
            <>
              <p className="flex items-center gap-2.5 rounded-[11px] bg-success-50 dark:bg-dark-success-50 px-4 py-3.5 text-[14px] leading-5 font-bold text-success dark:text-dark-success">
                <Icon name="check" size={20} />
                Saved
              </p>
              <Link to="/dashboard" className={buttonClass + ' border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-primary dark:text-dark-link'}>
                View saved events
              </Link>
              <p className={captionClass}>
                It’s saved on your dashboard.{' '}
                <button
                  type="button"
                  className="relative cursor-pointer font-bold text-primary dark:text-dark-link after:absolute after:-inset-x-2 after:-inset-y-3.5 hover:text-primary-dark dark:hover:text-dark-ink"
                  onClick={toggleSave}
                >
                  Unsave
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Guests who click Save are sent to the login page by the hook. */}
              <button
                type="button"
                className={buttonClass + ' cursor-pointer bg-primary dark:bg-dark-primary text-white shadow-[0_8px_18px_var(--color-primary)] shadow-primary/25 hover:bg-primary-dark dark:hover:bg-dark-primary/90'}
                onClick={toggleSave}
              >
                Save event
              </button>
              {!authLoading && !user && <p className={captionClass}>Sign in to save events.</p>}
            </>
          )}
        </aside>
      </div>
    );
  }

  // The gray page fills the full width and cancels the page padding, without changing Layout.jsx.
  // Its inner box uses the page's max width, so it lines up with the navbar and footer.
  return (
    <div className="mx-[calc(50%-50vw)] -my-6 bg-page dark:bg-dark-page md:-my-10">
      <div className="mx-auto max-w-275 px-4 pt-6 pb-12 md:px-8 md:pt-9 md:pb-24">
        {/* -mt-3 py-3 makes the tap area 44px tall, and the smaller bottom margin keeps the card in the same place. */}
        <Link to="/" className="-mt-3 mb-2 flex w-fit items-center gap-1.5 py-3 text-[16px] leading-5 font-bold text-primary dark:text-dark-link md:mb-3 md:text-[14px]">
          <Icon name="arrow-left" strokeWidth={3} />
          Back to all events
        </Link>
        {content}
      </div>
    </div>
  );
}
