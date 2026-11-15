/*
  Feed page for CUNY-Connect, shown at /.
  This is the home page, where students browse upcoming events across all CUNY campuses.
  It shows a full-width navy hero banner, then loads the events from GET /events and shows them as EventCards.
  Owner: Person 3
  TODO: Add the campus, date, and category filters next (GET /events takes campus, category, and date).
  TODO: Style the loading, error, and empty messages to match the Figma.
*/
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import EventCard from '../components/EventCard.jsx';
import Icon from '../components/Icon.jsx';

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
      {/* The hero breaks out of the page's centered column to fill the full width, and the negative top margin cancels
          the page's top padding so it sits right under the navbar. Colors and sizes come from the Figma hero. */}
      <section className="relative mx-[calc(50%-50vw)] -mt-6 mb-10 overflow-hidden bg-[linear-gradient(129.57deg,var(--color-primary-dark)_0%,#2a4fb0_71.43%)] md:-mt-10 md:mb-14 md:bg-[linear-gradient(158.11deg,var(--color-primary-dark)_0%,#2a4fb0_71.43%)]">
        {/* The inner box uses the page's max width, so the hero text lines up with the events below it. */}
        <div className="relative mx-auto flex max-w-275 flex-col items-start gap-4 px-6 pt-12 pb-30 md:gap-4.5 md:px-8 md:pt-18">
          {/* Soft decorative rings. The phone has one filled circle, and desktop has an outlined ring and a large filled circle. */}
          <span className="absolute top-75 -right-27.5 h-80 w-80 rounded-full bg-white/6 md:hidden" aria-hidden="true" />
          <span className="absolute -top-65 left-172.5 hidden h-155 w-155 rounded-full border-2 border-white/25 md:block" aria-hidden="true" />
          <span className="absolute top-60 left-132.5 hidden h-250 w-250 rounded-full bg-white/5 md:block" aria-hidden="true" />

          <p className="relative font-body text-[12px] leading-4.5 font-extrabold tracking-[1.68px] text-[#c9d4f2] uppercase">
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
          <p className="relative max-w-150 text-[16px] leading-6.5 text-[#c9d4f2] md:text-[18px] md:leading-7">
            Discover events, meet people, and find your community across all 25 CUNY colleges.
          </p>

          {/* Phone: one tilted chip under the text, like the Figma phone frame. */}
          <div className="absolute top-62.25 right-8.5 flex rotate-3 items-center gap-2 rounded-xl bg-white py-2.5 pr-4 pl-3.5 md:hidden">
            <Icon name="calendar" size={18} className="text-primary" />
            <span className="text-[14px] leading-5 font-bold text-primary">45+ events</span>
          </div>

          {/* Desktop: two tilted chips on the right. They need the full width, so they show from xl (1280px) up. */}
          <div className="absolute top-36.75 left-217.25 hidden rotate-4 items-center gap-2.5 rounded-[14px] bg-white py-3 pr-4.5 pl-4 shadow-[0_4px_14px_rgba(23,32,51,0.06)] xl:flex">
            <Icon name="calendar" size={20} className="text-primary" />
            <span className="text-[16px] leading-5 font-bold text-primary">45+ events</span>
          </div>
          <div className="absolute top-63.75 left-188 hidden -rotate-3 items-center gap-2.5 rounded-[14px] bg-white py-3 pr-4.5 pl-4 shadow-[0_4px_14px_rgba(23,32,51,0.06)] xl:flex">
            <Icon name="users" size={20} className="text-primary" />
            <span className="text-[16px] leading-5 font-bold text-primary">25 colleges</span>
          </div>
        </div>
      </section>

      <p className="mb-2 font-body text-[12px] leading-4 font-extrabold tracking-widest text-primary uppercase">
        Happening around CUNY
      </p>
      <h1 className="mb-2">Events worth showing up for</h1>
      {content}
    </>
  );
}
