/*
  Feed page for CUNY-Connect, shown at /.
  This is the home page, where students browse upcoming events across all CUNY campuses.
  It shows a full-width navy hero banner and a filter card, then loads the events from GET /events and shows them
  as EventCards. Find events reloads the list with the chosen campus, date, and category.
  While loading it shows gray skeleton cards. Empty results and errors show a centered message with a button.
  Owner: Person 3
*/
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import EventCard from '../components/EventCard.jsx';
import Icon from '../components/Icon.jsx';
import StatusBlock from '../components/StatusBlock.jsx';
import { CAMPUSES, CATEGORIES } from '../constants.js';
import { formatEventDate } from '../utils/dateHelpers.js';

// No filters chosen. An empty value means "All" or "Any" in the dropdowns.
const noFilters = { campus: '', date: '', category: '' };

/**
 * Turns a date into YYYY-MM-DD in the viewer's own time zone, which is the format GET /events expects.
 *
 * @param {Date} date The day.
 * @returns {string} The day, for example "2026-11-21".
 */
function toDateValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

/**
 * Builds the Date dropdown choices: Today, Tomorrow, then the next 12 days.
 *
 * @returns {{value: string, label: string}[]} The choices, for example { value: "2026-11-21", label: "Sat, Nov 21" }.
 */
function getDateOptions() {
  const options = [];
  for (let daysAway = 0; daysAway < 14; daysAway++) {
    const date = new Date();
    date.setDate(date.getDate() + daysAway);
    let label = formatEventDate(date);
    if (daysAway === 0) {
      label = 'Today';
    } else if (daysAway === 1) {
      label = 'Tomorrow';
    }
    options.push({ value: toDateValue(date), label });
  }
  return options;
}

/**
 * Renders one labeled dropdown in the filter card, styled like the Figma select.
 *
 * @param {object} props The component props.
 * @param {string} props.id The id that links the label to the dropdown.
 * @param {string} props.label The label above the dropdown.
 * @param {string} props.value The chosen value. An empty string is the "All" choice.
 * @param {function} props.onChange Called with the new value.
 * @param {string} props.allLabel The text for the empty choice, for example "All campuses".
 * @param {{value: string, label: string}[]} props.options The other choices.
 * @returns {JSX.Element} The label and dropdown.
 */
function FilterSelect({ id, label, value, onChange, allLabel, options }) {
  return (
    <div className="flex h-20 min-w-0 flex-col gap-2 md:flex-1">
      <label htmlFor={id} className="text-[14px] leading-5 font-bold text-slate-600 dark:text-dark-slate-600">
        {label}
      </label>
      {/* The Figma select is 80px tall with 4px of space under the field. appearance-none hides the browser's own arrow, so the Figma chevron can sit on top instead. */}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full cursor-pointer appearance-none rounded-[10px] border border-border dark:border-dark-border bg-white dark:bg-dark-surface pr-10 pl-3.5 text-[16px] leading-6.5 text-ink dark:text-dark-ink"
        >
          <option value="">{allLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-right"
          size={18}
          strokeWidth={2.67}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rotate-90 text-slate dark:text-dark-slate"
        />
      </div>
    </div>
  );
}

// The navy button style, the same as the Find events button.
const primaryButtonClass =
  'flex cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-primary dark:bg-dark-primary px-5.5 py-3 text-[16px] leading-6 font-bold text-white shadow-[0_8px_18px_var(--color-primary)] shadow-primary/25 transition-colors hover:bg-primary-dark dark:hover:bg-dark-primary/90';

/**
 * Renders a gray placeholder shaped like an EventCard, shown while the events load.
 *
 * @returns {JSX.Element} The skeleton card.
 */
function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
      <div className="h-37.5 bg-border dark:bg-dark-border" />
      {/* Each row has the same height as the matching row in EventCard: the pill, the countdown, a two-line title,
          the date and campus lines, and the footer. That keeps the skeleton 421px tall, the same as a real card. */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="h-7 w-24 rounded-full bg-border dark:bg-dark-border" />
        <div className="h-4 w-20 rounded-md bg-border dark:bg-dark-border" />
        <div className="flex flex-col gap-2 py-0.5">
          <div className="h-4.5 w-full rounded-md bg-border dark:bg-dark-border" />
          <div className="h-4.5 w-2/3 rounded-md bg-border dark:bg-dark-border" />
        </div>
        <div className="flex h-5 items-center">
          <div className="h-4 w-1/2 rounded-md bg-border dark:bg-dark-border" />
        </div>
        <div className="flex h-5 items-center">
          <div className="h-4 w-1/3 rounded-md bg-border dark:bg-dark-border" />
        </div>
        <div className="flex items-center justify-between border-t border-border dark:border-dark-border pt-3">
          <div className="h-4 w-2/5 rounded-md bg-border dark:bg-dark-border" />
          <div className="h-8 w-8 rounded-full bg-border dark:bg-dark-border" />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the event feed.
 *
 * @returns {JSX.Element} The heading and a grid of event cards, or a loading, error, or empty message.
 */
export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // filters is what the dropdowns show right now. search is what the events were last loaded with.
  const [filters, setFilters] = useState(noFilters);
  const [search, setSearch] = useState(noFilters);
  // The number of upcoming events for the hero chip. It only changes on a load with no filters, and is null until then.
  const [upcomingCount, setUpcomingCount] = useState(null);

  const campusOptions = CAMPUSES.map((campus) => ({ value: campus, label: campus }));
  const categoryOptions = CATEGORIES.map((category) => ({ value: category, label: category }));
  const dateOptions = getDateOptions();

  // Load the events when the page first shows, and again every time Find events or Clear filters sets a new search.
  useEffect(() => {
    // If the page closes or a newer search starts before the request finishes, ignore the old answer.
    let ignore = false;

    async function loadEvents() {
      setLoading(true);
      setError('');
      // Only the chosen filters are sent, for example { campus: 'Hunter' } when just a campus is picked.
      const params = Object.fromEntries(Object.entries(search).filter(([, value]) => value !== ''));
      try {
        const response = await api.get('/events', { params });
        if (!ignore) {
          setEvents(response.data);
          if (Object.keys(params).length === 0) {
            setUpcomingCount(response.data.length);
          }
        }
      } catch (err) {
        // The server sends errors as { message }. If there is no answer at all, the server is probably not running.
        if (!ignore) {
          setEvents([]);
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
  }, [search]);

  // Changes one dropdown, for example updateFilter('campus', 'Hunter').
  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  // A new object is used every time, so Find events reloads even when the filters did not change.
  function handleFind(event) {
    event.preventDefault();
    setSearch({ ...filters });
  }

  function clearFilters() {
    setFilters(noFilters);
    setSearch({ ...noFilters });
  }

  // Loads the same search again. A copy of the object is a new value, so the effect above runs again.
  function retry() {
    setSearch((current) => ({ ...current }));
  }

  const hasFilters = Object.values(search).some((value) => value !== '');
  // The hero chip shows just "Events" until the first unfiltered load finishes, then a count like "27 events".
  let chipLabel = 'Events';
  if (upcomingCount !== null) {
    chipLabel = upcomingCount + (upcomingCount === 1 ? ' event' : ' events');
  }

  // Only one of these shows at a time: loading, then either the error, the empty message, or the cards.
  let content;
  if (loading) {
    // Six gray cards in the same grid as the real ones, with a gray bar where the count goes. The pulse is skipped
    // for people who turn off motion. The hidden text tells screen readers the page is loading.
    content = (
      <div className="motion-safe:animate-pulse" aria-busy="true">
        <p className="sr-only">Loading events...</p>
        <div className="mb-6 flex h-6.5 items-center">
          <div className="h-4 w-44 rounded-md bg-border dark:bg-dark-border" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <EventCardSkeleton key={n} />
          ))}
        </div>
      </div>
    );
  } else if (error) {
    content = (
      <StatusBlock icon="alert-circle" title="Couldn't load events" message={error}>
        <button type="button" className={primaryButtonClass} onClick={retry}>
          Try again
        </button>
      </StatusBlock>
    );
  } else if (events.length === 0 && hasFilters) {
    content = (
      <StatusBlock icon="search" title="No events match these filters" message="Try a different campus, date, or category.">
        <button type="button" className={primaryButtonClass} onClick={clearFilters}>
          Clear filters
        </button>
      </StatusBlock>
    );
  } else if (events.length === 0) {
    content = (
      <StatusBlock
        icon="calendar"
        title="No upcoming events yet"
        message="Check back soon. New events from across CUNY will show up here."
      />
    );
  } else {
    // The grid starts at one column on phones and adds columns on bigger screens.
    content = (
      <>
        <p className="mb-6 text-slate dark:text-dark-slate">
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
      {/* The hero breaks out of the page's centered column to fill the full width, and the negative top margin cancels
          the page's top padding so it sits right under the navbar. Colors and sizes come from the Figma hero. */}
      <section className="relative mx-[calc(50%-50vw)] -mt-6 overflow-hidden bg-[linear-gradient(129.57deg,var(--color-primary-dark)_0%,var(--color-hero-end)_71.43%)] md:-mt-10 md:bg-[linear-gradient(158.11deg,var(--color-primary-dark)_0%,var(--color-hero-end)_71.43%)]">
        {/* The inner box uses the page's max width, so the hero text lines up with the events below it. */}
        <div className="relative mx-auto flex max-w-275 flex-col items-start gap-4 px-6 pt-12 pb-30 md:gap-4.5 md:px-8 md:pt-18">
          {/* Soft decorative rings. The phone has one filled circle, and desktop has an outlined ring and a large filled circle. */}
          <span className="absolute top-75 -right-27.5 h-80 w-80 rounded-full bg-white/6 md:hidden" aria-hidden="true" />
          <span className="absolute -top-65 left-172.5 hidden h-155 w-155 rounded-full border-2 border-white/25 md:block" aria-hidden="true" />
          <span className="absolute top-60 left-132.5 hidden h-250 w-250 rounded-full bg-white/5 md:block" aria-hidden="true" />

          <p className="relative font-body text-[12px] leading-4.5 font-extrabold tracking-[1.68px] text-on-brand-muted uppercase">
            Your CUNY community starts here
          </p>
          {/* The line breaks differ: phones break after "next", desktop breaks after "campus". */}
          <h1 className="relative text-[38px] leading-10.5 tracking-[-1.14px] text-white md:text-[64px] md:leading-16.5 md:tracking-[-2.24px]">
            Find your next <br className="md:hidden" />
            <span className="text-accent">
              campus
              <br className="hidden md:inline" /> moment.
            </span>
          </h1>
          <p className="relative max-w-150 text-[16px] leading-6.5 text-on-brand-muted md:text-[18px] md:leading-7">
            Discover events, meet people, and find your community across all 25 CUNY colleges.
          </p>

          {/* Phone: one tilted chip under the text, like the Figma phone frame. It is placed from the bottom, inside the
              hero's bottom padding, so it never covers the text when the text wraps to more lines on narrow phones. */}
          <div className="absolute right-8.5 bottom-16.25 flex rotate-3 items-center gap-2 rounded-xl bg-white dark:bg-dark-surface py-2.5 pr-4 pl-3.5 md:hidden">
            <Icon name="calendar" size={18} className="text-primary dark:text-dark-link" />
            <span className="text-[14px] leading-5 font-bold text-primary dark:text-dark-link">{chipLabel}</span>
          </div>

          {/* Desktop: two tilted chips on the right. They need the full width, so they show from xl (1280px) up. */}
          <div className="absolute top-36.75 left-217.25 hidden rotate-4 items-center gap-2.5 rounded-[14px] bg-white dark:bg-dark-surface py-3 pr-4.5 pl-4 shadow-[0_4px_14px_var(--color-ink)] shadow-ink/6 xl:flex">
            <Icon name="calendar" size={20} className="text-primary dark:text-dark-link" />
            <span className="text-[16px] leading-5 font-bold text-primary dark:text-dark-link">{chipLabel}</span>
          </div>
          <div className="absolute top-63.75 left-188 hidden -rotate-3 items-center gap-2.5 rounded-[14px] bg-white dark:bg-dark-surface py-3 pr-4.5 pl-4 shadow-[0_4px_14px_var(--color-ink)] shadow-ink/6 xl:flex">
            <Icon name="users" size={20} className="text-primary dark:text-dark-link" />
            <span className="text-[16px] leading-5 font-bold text-primary dark:text-dark-link">25 colleges</span>
          </div>
        </div>
      </section>

      {/* The filter card overlaps the bottom of the hero: 56px on phones and 64px on desktop, like the Figma.
          Phones stack the controls. Desktop puts them in one row with the button at the bottom. */}
      <form
        onSubmit={handleFind}
        className="relative -mt-14 mb-10 flex flex-col gap-3.5 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-4.5 shadow-[0_4px_14px_var(--color-ink)] shadow-ink/6 md:-mt-16 md:mb-14 md:flex-row md:items-end md:gap-4 md:p-5"
      >
        <FilterSelect
          id="filter-campus"
          label="Campus"
          value={filters.campus}
          onChange={(value) => updateFilter('campus', value)}
          allLabel="All campuses"
          options={campusOptions}
        />
        <FilterSelect
          id="filter-date"
          label="Date"
          value={filters.date}
          onChange={(value) => updateFilter('date', value)}
          allLabel="Any date"
          options={dateOptions}
        />
        <FilterSelect
          id="filter-category"
          label="Category"
          value={filters.category}
          onChange={(value) => updateFilter('category', value)}
          allLabel="All categories"
          options={categoryOptions}
        />
        <button
          type="submit"
          className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-primary dark:bg-dark-primary px-5.5 py-3 text-[16px] leading-6 font-bold text-white shadow-[0_8px_18px_var(--color-primary)] shadow-primary/25 transition-colors hover:bg-primary-dark dark:hover:bg-dark-primary/90"
        >
          <Icon name="search" size={18} strokeWidth={2.67} />
          Find events
        </button>
      </form>

      <p className="mb-2 font-body text-[12px] leading-4 font-extrabold tracking-widest text-primary dark:text-dark-link uppercase">
        Happening around CUNY
      </p>
      <h1 className="mb-2">Events worth showing up for</h1>
      {content}
    </>
  );
}
