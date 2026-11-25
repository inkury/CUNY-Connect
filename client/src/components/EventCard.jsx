/*
  Event card for the CUNY-Connect client.
  This file shows a short preview of one event, and it is reused by the Feed, Dashboard, and ClubProfile pages.
  All of its data comes in through the event prop. An event whose club was deleted shows "Unknown club".
  Owner: Person 3
*/
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import useSaveEvent from '../hooks/useSaveEvent.js';
import { formatEventDateTime, getCountdownLabel, getMonthShort, getWeekdayShort } from '../utils/dateHelpers.js';

// The start and end colors of the banner gradient for each category.
// It has one entry for each category in CATEGORIES from client/src/constants.js, in the same order.
// The colors themselves are defined once in global.css.
export const categoryGradients = {
  Academic: ['var(--color-category-academic-start)', 'var(--color-category-academic-end)'],
  Career: ['var(--color-category-career-start)', 'var(--color-category-career-end)'],
  Cultural: ['var(--color-category-cultural-start)', 'var(--color-category-cultural-end)'],
  Social: ['var(--color-category-social-start)', 'var(--color-category-social-end)'],
  Sports: ['var(--color-category-sports-start)', 'var(--color-category-sports-end)'],
  Arts: ['var(--color-category-arts-start)', 'var(--color-category-arts-end)'],
  Tech: ['var(--color-category-tech-start)', 'var(--color-category-tech-end)'],
  Volunteering: ['var(--color-category-volunteering-start)', 'var(--color-category-volunteering-end)'],
  Other: ['var(--color-category-other-start)', 'var(--color-category-other-end)'],
};

/**
 * Renders a preview of one event.
 *
 * @param {object} props The component props.
 * @param {object} props.event The event to show.
 * @returns {JSX.Element} The event card.
 */
export default function EventCard({ event }) {
  // The shared hook saves to the server, so the bookmark matches EventDetail and stays after a reload.
  const { saved, toggleSave } = useSaveEvent(event._id);

  // Categories that are not in the map fall back to the gray Other gradient.
  const [gradientStart, gradientEnd] = categoryGradients[event.category] ?? categoryGradients.Other;
  const countdown = getCountdownLabel(event.dateTime);

  // h-full and flex-col let every card in a row match the tallest one. overflow-hidden clips the banner to the round corners.
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface shadow-[0_4px_14px_var(--color-black)] shadow-black/6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_var(--color-black)] hover:shadow-black/12">
      {/* The gradient colors change per category, so they are set with an inline style instead of a class. */}
      <div
        className="relative h-37.5 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}
      >
        {/* Two decorative rings near the top right. */}
        <span className="absolute -top-10 -right-8 h-32 w-32 rounded-full border-2 border-white/25" aria-hidden="true" />
        <span className="absolute -top-4 right-8 h-20 w-20 rounded-full border-2 border-white/20" aria-hidden="true" />

        <div className="absolute bottom-4 left-4 flex h-14.5 w-14.5 flex-col items-center justify-center rounded-[10px] bg-white dark:bg-dark-surface text-primary dark:text-dark-link">
          <span className="font-heading text-[20px] leading-6 font-bold">{getMonthShort(event.dateTime)}</span>
          <span className="font-body text-[10px] leading-3 font-extrabold uppercase">
            {getWeekdayShort(event.dateTime)}
          </span>
        </div>
      </div>

      {/* flex-1 stretches the body so the footer can sit at the bottom of the card. */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-7 items-center rounded-full bg-primary-50 dark:bg-dark-primary-50 px-3 font-body text-[11px] font-extrabold tracking-wide text-primary dark:text-dark-link uppercase">
            {event.category}
          </span>
          <button
            type="button"
            // -m-3 p-3 makes the tap area 44px without moving the icon.
            className={'-m-3 cursor-pointer p-3 transition-colors hover:text-primary dark:hover:text-dark-link ' + (saved ? 'text-primary dark:text-dark-link' : 'text-slate dark:text-dark-slate')}
            onClick={toggleSave}
            aria-label={saved ? 'Unsave event' : 'Save event'}
            aria-pressed={saved}
          >
            <Icon name={saved ? 'bookmark-filled' : 'bookmark'} size={20} />
          </button>
        </div>

        {/* Past events have an empty label, so this line does not render for them. */}
        {countdown && <p className="text-[13px] leading-4 font-bold text-accent-dark dark:text-accent">{countdown}</p>}

        <h3>
          <Link to={`/events/${event._id}`} className="line-clamp-2 text-ink dark:text-dark-ink hover:text-primary dark:hover:text-dark-link">
            {event.title}
          </Link>
        </h3>

        <p className="flex items-center gap-2 text-[14px] leading-5 text-slate dark:text-dark-slate">
          <Icon name="calendar" />
          {formatEventDateTime(event.dateTime)}
        </p>
        <p className="flex items-center gap-2 text-[14px] leading-5 text-slate dark:text-dark-slate">
          <Icon name="map-pin" />
          {event.campus}
        </p>

        {/* mt-auto pushes the footer to the bottom, so the footers line up across a row. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border dark:border-dark-border pt-3">
          {/* hostClub is null when its club was deleted, so the card shows "Unknown club" without a link instead of crashing. */}
          <p className="min-w-0 truncate text-[14px] leading-5 text-slate dark:text-dark-slate">
            By{' '}
            {event.hostClub?._id ? (
              <Link to={`/clubs/${event.hostClub._id}`} className="font-bold text-primary dark:text-dark-link">
                {event.hostClub.name}
              </Link>
            ) : (
              <span className="font-bold">Unknown club</span>
            )}
          </p>
          <Link
            to={`/events/${event._id}`}
            // The invisible after: box makes the tap area 44px while the circle stays 32px.
            className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 dark:bg-dark-primary-50 text-primary dark:text-dark-link after:absolute after:-inset-1.5"
            aria-label={'View ' + event.title}
          >
            <Icon name="chevron-right" />
          </Link>
        </div>
      </div>
    </article>
  );
}
