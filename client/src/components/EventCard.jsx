/*
  Event card for the CUNY-Connect client.
  This file shows a short preview of one event, and it is reused by the Feed, Dashboard, and ClubProfile pages.
  All of its data comes in through the event prop.
  Owner: Person 3
  TODO: Connect the save button to Abinash's save route. For now it only changes on this screen and resets on reload.
  TODO: Use the category list from client/src/constants.js (Kenneth) once it exists, instead of the map below.
*/
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { formatEventDateTime, getCountdownLabel, getMonthShort, getWeekdayShort } from '../utils/dateHelpers.js';

// The start and end colors of the banner gradient for each category.
const categoryGradients = {
  Tech: ['#203D8D', '#4166BE'],
  Cultural: ['#B95813', '#F49A10'],
  Career: ['#1B7870', '#45BBAF'],
  Social: ['#6539A8', '#A378E4'],
  Academic: ['#3A773C', '#76B658'],
  Arts: ['#A03060', '#DE7190'],
  Sports: ['#DC2626', '#F97316'],
  Volunteering: ['#059669', '#84CC16'],
  Other: ['#546074', '#94A3B8'],
};

/**
 * Renders a preview of one event.
 *
 * @param {object} props The component props.
 * @param {object} props.event The event to show.
 * @returns {JSX.Element} The event card.
 */
export default function EventCard({ event }) {
  const [saved, setSaved] = useState(false);

  function toggleSaved() {
    setSaved(!saved);
  }

  // Categories that are not in the map fall back to the gray Other gradient.
  const [gradientStart, gradientEnd] = categoryGradients[event.category] ?? categoryGradients.Other;
  const countdown = getCountdownLabel(event.dateTime);

  // h-full and flex-col let every card in a row match the tallest one. overflow-hidden clips the banner to the round corners.
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
      {/* The gradient colors change per category, so they are set with an inline style instead of a class. */}
      <div
        className="relative h-37.5 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}
      >
        {/* Two decorative rings near the top right. */}
        <span className="absolute -top-10 -right-8 h-32 w-32 rounded-full border-2 border-white/25" aria-hidden="true" />
        <span className="absolute -top-4 right-8 h-20 w-20 rounded-full border-2 border-white/20" aria-hidden="true" />

        <div className="absolute bottom-4 left-4 flex h-14.5 w-14.5 flex-col items-center justify-center rounded-[10px] bg-white text-primary">
          <span className="font-heading text-[20px] leading-6 font-bold">{getMonthShort(event.dateTime)}</span>
          <span className="font-body text-[10px] leading-3 font-extrabold uppercase">
            {getWeekdayShort(event.dateTime)}
          </span>
        </div>
      </div>

      {/* flex-1 stretches the body so the footer can sit at the bottom of the card. */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-7 items-center rounded-full bg-primary-50 px-3 font-body text-[11px] font-extrabold tracking-wide text-primary uppercase">
            {event.category}
          </span>
          {/* TODO: Connect this button to Abinash's save route. */}
          <button
            type="button"
            className={'cursor-pointer transition-colors hover:text-primary ' + (saved ? 'text-primary' : 'text-slate')}
            onClick={toggleSaved}
            aria-label={saved ? 'Unsave event' : 'Save event'}
            aria-pressed={saved}
          >
            <Icon name={saved ? 'bookmark-filled' : 'bookmark'} size={20} />
          </button>
        </div>

        {/* Past events have an empty label, so this line does not render for them. */}
        {countdown && <p className="text-[13px] leading-4 font-bold text-accent-dark">{countdown}</p>}

        <h3>
          <Link to={`/events/${event._id}`} className="line-clamp-2 text-ink hover:text-primary">
            {event.title}
          </Link>
        </h3>

        <p className="flex items-center gap-2 text-[14px] leading-5 text-slate">
          <Icon name="calendar" />
          {formatEventDateTime(event.dateTime)}
        </p>
        <p className="flex items-center gap-2 text-[14px] leading-5 text-slate">
          <Icon name="map-pin" />
          {event.campus}
        </p>

        {/* mt-auto pushes the footer to the bottom, so the footers line up across a row. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="min-w-0 truncate text-[14px] leading-5 text-slate">
            By{' '}
            <Link to={`/clubs/${event.hostClub._id}`} className="font-bold text-primary">
              {event.hostClub.name}
            </Link>
          </p>
          <Link
            to={`/events/${event._id}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-primary"
            aria-label={'View ' + event.title}
          >
            <Icon name="chevron-right" />
          </Link>
        </div>
      </div>
    </article>
  );
}
