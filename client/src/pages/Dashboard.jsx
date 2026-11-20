/*
  Dashboard page for CUNY-Connect, shown at /dashboard.
  This page is a student's personal home, with the events they saved and upcoming events from the clubs they follow.
  It loads everything from GET /users/me/dashboard for the logged-in user.
  Owner: Person 4
  TODO: Nothing for now. Add an Unfollow button for followedClubs if the design adds one.
*/
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBlock from "../components/StatusBlock.jsx";
import EventCard, { categoryGradients } from "../components/EventCard.jsx";
import Icon from "../components/Icon.jsx";
import { getMonthShort, getWeekdayShort } from "../utils/dateHelpers.js";

// The same primary button style the Feed and Event Detail pages use, so buttons look the same everywhere.
const primaryButtonClass =
  "flex cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-primary px-5.5 py-3 text-[16px] leading-6 font-bold text-white shadow-[0_8px_18px_var(--color-primary)] shadow-primary/25 transition-colors hover:bg-primary-dark hover:text-white";

/**
 * Picks a greeting that matches the time of day.
 *
 * @param {Date} now The current time.
 * @returns {string} "Good morning", "Good afternoon", or "Good evening".
 */
function getGreeting(now) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Renders a section heading with a short line under it, and an optional link on the right.
 *
 * @param {object} props The component props.
 * @param {string} props.title The heading.
 * @param {string} props.subtitle The line under the heading.
 * @param {string} [props.linkTo] Where the link on the right goes.
 * @param {string} [props.linkLabel] The text of the link on the right.
 * @returns {JSX.Element} The section header.
 */
function SectionHeader({ title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2>{title}</h2>
        <p className="mt-1">{subtitle}</p>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-2 font-bold">
          {linkLabel}
          <Icon name="chevron-right" />
        </Link>
      )}
    </div>
  );
}

/**
 * Renders a message in a dashed box for a section with nothing to show.
 *
 * @param {object} props The component props.
 * @param {string} props.message What to tell the user.
 * @returns {JSX.Element} The empty state.
 */
function EmptyState({ message }) {
  // Every empty state points back to the feed, since that is where students find things to save and clubs to follow.
  return (
    <div className="rounded-2xl border border-dashed border-border bg-page px-6 py-10 text-center">
      <p>{message}</p>
      <Link to="/" className="mt-2 inline-block font-bold">
        Browse events
      </Link>
    </div>
  );
}

/**
 * Renders one compact row for an event from a followed club.
 *
 * @param {object} props The component props.
 * @param {object} props.event The event to show.
 * @returns {JSX.Element} The event row.
 */
function FollowedEventRow({ event }) {
  // The date tile reuses the event card's category colors, so an event looks the same in every list.
  const [gradientStart, gradientEnd] = categoryGradients[event.category] ?? categoryGradients.Other;
  const time = new Date(event.dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <Link
      to={`/events/${event._id}`}
      className="flex items-center gap-3.5 rounded-[14px] border border-border bg-white py-3.5 pr-4 pl-3.5 text-ink transition hover:-translate-y-0.5 hover:text-ink hover:shadow-[0_4px_14px_rgba(23,32,51,0.06)]"
    >
      <div
        className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[10px] text-white"
        style={{ background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}
      >
        <span className="font-heading text-[18px] leading-5 font-bold">{getMonthShort(event.dateTime)}</span>
        <span className="text-[10px] leading-4 uppercase">{getWeekdayShort(event.dateTime)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] leading-5 font-bold">{event.title}</p>
        <p className="truncate text-[12px] leading-4 text-slate">
          {event.campus} · {time}
        </p>
      </div>
      <Icon name="chevron-right" size={18} />
    </Link>
  );
}

/**
 * Renders gray placeholder blocks in the shape of the dashboard while it loads.
 *
 * @returns {JSX.Element} The loading placeholder.
 */
function DashboardSkeleton() {
  // The pulse is skipped for people who turn off motion, and the hidden text tells screen readers the page is loading.
  return (
    <div className="flex flex-col gap-12 motion-safe:animate-pulse" aria-busy="true">
      <p className="sr-only">Loading your dashboard...</p>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-40 rounded-md bg-border" />
        <div className="h-10 w-80 max-w-full rounded-md bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-80 rounded-2xl bg-border" />
        <div className="h-80 rounded-2xl bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="h-21 rounded-[14px] bg-border" />
        <div className="h-21 rounded-[14px] bg-border" />
        <div className="h-21 rounded-[14px] bg-border" />
      </div>
    </div>
  );
}

/**
 * Renders the logged-in user's dashboard.
 *
 * @returns {JSX.Element} The greeting, saved events, and events from followed clubs.
 */
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  // Saving or unsaving a card changes user.savedEvents, so watching it keeps the Saved events section in sync.
  const savedKey = (user?.savedEvents ?? []).join(",");
  const followedKey = (user?.followedClubs ?? []).join(",");

  useEffect(() => {
    if (!user) return;

    // If the page closes or a newer load starts before this one finishes, the old answer is ignored.
    let ignore = false;

    async function loadDashboard() {
      setError("");
      try {
        const response = await api.get("/users/me/dashboard");
        if (!ignore) setDashboard(response.data);
      } catch (err) {
        // The server sends errors as { message }. With no answer at all, the server is probably not running.
        if (!ignore) setError(err.response?.data?.message || "Could not load your dashboard. Please try again later.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, [user, savedKey, followedKey, reloadCount]);

  // Shows the gray placeholders again and loads the dashboard one more time.
  function retry() {
    setLoading(true);
    setReloadCount((count) => count + 1);
  }

  // The saved session is still being checked, so it is too early to say whether anyone is logged in.
  if (authLoading) return <DashboardSkeleton />;

  if (!user) {
    return (
      <StatusBlock icon="users" title="Log in to see your dashboard" message="Your saved events and clubs you follow show up here.">
        <Link to="/login" className={primaryButtonClass}>
          Log in
        </Link>
      </StatusBlock>
    );
  }

  // Only the first load shows placeholders. Later reloads, like after unsaving a card, keep the old content on screen.
  if (loading && !dashboard) return <DashboardSkeleton />;

  if (error && !dashboard) {
    return (
      <StatusBlock icon="alert-circle" title="Couldn't load your dashboard" message={error}>
        <button type="button" className={primaryButtonClass} onClick={retry}>
          Try again
        </button>
      </StatusBlock>
    );
  }

  const { savedEvents, followedEvents, followedClubs } = dashboard;
  const now = new Date();
  const today = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const firstName = user.name.split(" ")[0];

  // Officers and admins get a shortcut to the officer pages, since students cannot use them.
  const canManageEvents = user.role === "officer" || user.role === "admin";

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[12px] leading-4.5 font-extrabold tracking-widest text-primary uppercase">{today}</p>
          <h1>
            {getGreeting(now)}, {firstName}
          </h1>
          <p className="mt-2">Here’s what’s happening in your CUNY world.</p>
        </div>
        {canManageEvents && (
          <Link to="/officer" className="flex items-center gap-2 font-bold">
            Officer tools
            <Icon name="chevron-right" />
          </Link>
        )}
      </div>

      <section>
        <SectionHeader title="Saved events" subtitle="Events you’ve saved." linkTo="/" linkLabel="Explore more" />
        {savedEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {savedEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState message="You haven’t saved any events yet." />
        )}
      </section>

      <section>
        <SectionHeader title="From clubs you follow" subtitle="Fresh picks from your communities." />
        {/* The two empty messages differ, because following no clubs and following quiet clubs need different next steps. */}
        {followedEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {followedEvents.map((event) => (
              <FollowedEventRow key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              followedClubs.length > 0
                ? "The clubs you follow have no upcoming events right now."
                : "You aren’t following any clubs yet."
            }
          />
        )}
      </section>
    </div>
  );
}
