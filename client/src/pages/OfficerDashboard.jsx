/*
  OfficerDashboard page for CUNY-Connect, shown at /officer.
  This page is home base for club officers. It lists the upcoming events of the club they run, with edit
  and delete buttons, and links to create an event or edit the club. It matches the Figma frames
  12 Officer dashboard, 15 Event published, and 17 Delete event.
  Owner: Person 4
  TODO: Deleting needs Kenneth's DELETE /api/events/:id. Until it is merged, the delete popup shows the server's error.
*/
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import { categoryGradients } from "../components/EventCard.jsx";
import Icon from "../components/Icon.jsx";
import StatusBlock from "../components/StatusBlock.jsx";
import { dangerButtonClass, primaryButtonClass, secondaryButtonClass } from "../components/buttonStyles.js";
import { formatEventDateTime, getMonthShort, getWeekdayShort } from "../utils/dateHelpers.js";

/**
 * Renders the pop up message in the top right corner, like "Event published".
 *
 * @param {object} props The component props.
 * @param {string} props.title The bold first line.
 * @param {string} props.message The second line.
 * @param {function} props.onClose Called when the user closes it, or when it hides on its own.
 * @returns {JSX.Element} The message.
 */
function Toast({ title, message, onClose }) {
  // The message hides itself after a few seconds, so it never covers the page for long.
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      className="fixed top-20 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-[0_10px_30px_rgba(23,32,51,0.12)]"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success-50 text-success">
        <Icon name="check" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-5 font-bold text-ink">{title}</p>
        <p className="text-[14px] leading-5">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="cursor-pointer text-slate hover:text-ink" aria-label="Close message">
        <Icon name="x" size={18} />
      </button>
    </div>
  );
}

/**
 * Renders the popup that asks the officer to confirm deleting an event.
 *
 * @param {object} props The component props.
 * @param {object} props.event The event that would be deleted.
 * @param {boolean} props.deleting Whether the delete request is still running.
 * @param {string} props.error A message to show if the delete failed.
 * @param {function} props.onCancel Called when the officer backs out.
 * @param {function} props.onConfirm Called when the officer confirms.
 * @returns {JSX.Element} The confirm popup.
 */
function DeleteEventModal({ event, deleting, error, onCancel, onConfirm }) {
  // Pressing Escape closes the popup, which is what people expect from any popup.
  useEffect(() => {
    function handleKey(keyEvent) {
      if (keyEvent.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" onClick={onCancel}>
      {/* Clicks inside the card stop here, so only a click on the dark background closes the popup. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(23,32,51,0.25)]"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-700">
          <Icon name="trash" size={20} />
        </span>
        <h2 id="delete-title" className="mt-4 text-[22px] leading-7">
          Delete “{event.title}”?
        </h2>
        <p className="mt-2 text-[14px] leading-6">
          Students who saved it will no longer see it. This can’t be undone.
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-[10px] bg-red-50 px-3 py-2 text-[14px] leading-5 text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className={secondaryButtonClass} onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className={dangerButtonClass} onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete event"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders one event row in the Your events card, with its edit and delete buttons.
 *
 * @param {object} props The component props.
 * @param {object} props.event The event to show.
 * @param {function} props.onDelete Called when the trash button is clicked.
 * @returns {JSX.Element} The event row.
 */
function OfficerEventRow({ event, onDelete }) {
  // The date tile uses the same category colors as the event cards, so an event looks the same everywhere.
  const [gradientStart, gradientEnd] = categoryGradients[event.category] ?? categoryGradients.Other;

  return (
    <li className="flex items-center gap-4 border-t border-border px-6 py-4.5">
      <div
        className="flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-[10px] text-white"
        style={{ background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}
      >
        <span className="font-heading text-[17px] leading-5 font-bold">{getMonthShort(event.dateTime)}</span>
        <span className="text-[10px] leading-4 uppercase">{getWeekdayShort(event.dateTime)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <Link to={`/events/${event._id}`} className="block truncate text-[16px] leading-5 font-bold text-ink hover:text-primary">
          {event.title}
        </Link>
        <p className="mt-1 truncate text-[12px] leading-4">{formatEventDateTime(event.dateTime)}</p>
      </div>
      <Link to={`/officer/events/${event._id}/edit`} className="text-slate hover:text-primary" aria-label={`Edit ${event.title}`}>
        <Icon name="edit" size={18} />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(event)}
        className="cursor-pointer text-slate hover:text-red-700"
        aria-label={`Delete ${event.title}`}
      >
        <Icon name="trash" size={18} />
      </button>
    </li>
  );
}

/**
 * Renders the officer dashboard for the club the officer runs.
 *
 * @returns {JSX.Element} The page.
 */
export default function OfficerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [toast, setToast] = useState(location.state?.toast ?? null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // The toast comes from the page that sent the officer here, so it is cleared from history right away.
  // Otherwise refreshing the page would show "Event published" again.
  useEffect(() => {
    if (location.state?.toast) navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    // If the page closes before the request finishes, the old answer is ignored.
    let ignore = false;

    async function loadClubs() {
      setError("");
      try {
        const response = await api.get("/users/me/clubs");
        if (!ignore) setClubs(response.data);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Could not load your clubs. Please try again later.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadClubs();
    return () => {
      ignore = true;
    };
  }, [reloadCount]);

  // An officer can run more than one club, so the chosen club lives in the URL, like /officer?club=123.
  const club = clubs.find((item) => item._id === searchParams.get("club")) ?? clubs[0];

  function closeDeleteModal() {
    if (deleting) return;
    setEventToDelete(null);
    setDeleteError("");
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/events/${eventToDelete._id}`);
      // The event is removed from the list on screen, so there is no need to load everything again.
      setClubs((current) =>
        current.map((item) => ({
          ...item,
          upcomingEvents: item.upcomingEvents.filter((event) => event._id !== eventToDelete._id),
        })),
      );
      setToast({ title: "Event deleted", message: `“${eventToDelete.title}” was removed.` });
      setEventToDelete(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete the event. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="motion-safe:animate-pulse" aria-busy="true">
        <p className="sr-only">Loading your clubs...</p>
        <div className="h-10 w-72 max-w-full rounded-md bg-border" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="h-80 rounded-2xl bg-border" />
          <div className="h-52 rounded-2xl bg-border" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <StatusBlock icon="alert-circle" title="Couldn't load your clubs" message={error}>
        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => {
            setLoading(true);
            setReloadCount((count) => count + 1);
          }}
        >
          Try again
        </button>
      </StatusBlock>
    );
  }

  if (!club) {
    return (
      <StatusBlock icon="users" title="You don’t run any clubs yet" message="Start a club, and once an admin approves it you can post events here.">
        <Link to="/officer/club" className={primaryButtonClass}>
          Start a club
        </Link>
      </StatusBlock>
    );
  }

  const events = club.upcomingEvents;

  return (
    <div className="flex flex-col gap-8">
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
      {eventToDelete && (
        <DeleteEventModal
          event={eventToDelete}
          deleting={deleting}
          error={deleteError}
          onCancel={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {/* Officers with more than one club pick which one to manage here. Everyone else just sees the club name. */}
          {clubs.length > 1 ? (
            <select
              aria-label="Choose a club"
              value={club._id}
              onChange={(event) => setSearchParams({ club: event.target.value })}
              className="mb-2 cursor-pointer bg-transparent text-[12px] leading-4.5 font-extrabold tracking-widest text-primary uppercase outline-none"
            >
              {clubs.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="mb-2 text-[12px] leading-4.5 font-extrabold tracking-widest text-primary uppercase">{club.name}</p>
          )}
          <h1>Officer dashboard</h1>
          <p className="mt-2">Create and manage your club’s events.</p>
        </div>
        {/* A club waiting for approval is hidden from students, so it cannot post events yet. */}
        {club.approved && (
          <Link to={`/officer/events/new?club=${club._id}`} className={primaryButtonClass}>
            <Icon name="plus" size={18} />
            Create event
          </Link>
        )}
      </div>

      {!club.approved && (
        <p role="status" className="rounded-[14px] border border-accent/40 bg-accent/10 px-5 py-4 text-ink">
          <span className="font-bold">Waiting for approval.</span> An admin needs to approve {club.name} before you can post events.
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="flex items-center justify-between px-6 py-5.5">
            <h2 className="text-[20px] leading-6 tracking-[-0.2px]">Your events</h2>
            <p className="text-[14px] leading-5">{events.length} upcoming</p>
          </div>
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <OfficerEventRow key={event._id} event={event} onDelete={setEventToDelete} />
              ))}
            </ul>
          ) : (
            <p className="border-t border-border px-6 py-8 text-center">
              No upcoming events yet. {club.approved && "Create one to get it in front of students."}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white px-6 pt-5.5 pb-3">
          <h2 className="text-[20px] leading-6 tracking-[-0.2px]">Club settings</h2>
          <p className="mt-1.5 mb-1.5 text-[14px] leading-5">Keep your club page accurate and welcoming.</p>
          <Link to={`/officer/club?id=${club._id}`} className="flex items-center justify-between border-t border-border py-4 text-[14px] leading-5 font-bold">
            Edit club profile
            <Icon name="chevron-right" size={18} />
          </Link>
          {club.approved && (
            <Link to={`/clubs/${club._id}`} className="flex items-center justify-between border-t border-border py-4 text-[14px] leading-5 font-bold">
              View public page
              <Icon name="chevron-right" size={18} />
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
