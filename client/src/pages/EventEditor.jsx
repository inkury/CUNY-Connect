/*
  EventEditor page for CUNY-Connect, shown at /officer/events/new and /officer/events/:id/edit.
  This page is the form officers use to create a new event or change one, with a live preview of the
  event card on the right. It matches the Figma frames 13 Create event, 14 Create event errors, and 16 Edit event.
  Owner: Person 4
  TODO: Saving needs Kenneth's POST and PATCH /api/events routes. Until they are merged, the form shows the server's error.
*/
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import { CAMPUSES, CATEGORIES } from "../constants.js";
import EventCard from "../components/EventCard.jsx";
import Icon from "../components/Icon.jsx";
import StatusBlock from "../components/StatusBlock.jsx";
import { SelectField, TextAreaField, TextField } from "../components/FormFields.jsx";
import { primaryButtonClass, secondaryButtonClass } from "../components/buttonStyles.js";

const emptyForm = { title: "", description: "", category: "Academic", campus: "", date: "", time: "", location: "" };

/**
 * Turns an event's ISO dateTime into the local date and time strings the date and time inputs expect.
 *
 * @param {string} dateTime The ISO date string saved on the event.
 * @returns {{date: string, time: string}} The date and the time, for example 2026-12-03 and 17:00.
 */
function splitDateTime(dateTime) {
  const value = new Date(dateTime);
  // padStart adds the leading zero the inputs need, so 9 becomes "09".
  const pad = (number) => String(number).padStart(2, "0");
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}

/**
 * Checks the form the same way the server will, so mistakes show up before anything is sent.
 *
 * @param {object} form The current form values.
 * @returns {object} An error message for each field that has a problem, keyed by field name.
 */
function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Add a title so students know what the event is.";
  if (!form.date) errors.date = "Pick the day of the event.";
  if (!form.time) errors.time = "Pick a start time.";
  if (!form.location.trim()) errors.location = "Add a building and room, or an address.";

  // The date and time are only compared once both are filled in, since a half filled date cannot be checked.
  if (form.date && form.time && new Date(`${form.date}T${form.time}`) < new Date()) {
    errors.date = "This date and time has already passed.";
  }
  return errors;
}

/**
 * Renders the create event and edit event page.
 *
 * @returns {JSX.Element} The page.
 */
export default function EventEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [club, setClub] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        // The officer's own clubs are loaded either way, which also confirms they run the club they are posting for.
        const clubsResponse = await api.get("/users/me/clubs");
        let clubId = searchParams.get("club");
        let startingForm = null;

        if (isEditing) {
          const eventResponse = await api.get(`/events/${id}`);
          const event = eventResponse.data;
          clubId = event.hostClub._id;
          startingForm = {
            title: event.title,
            description: event.description ?? "",
            category: event.category ?? "Other",
            campus: event.campus ?? "",
            location: event.location ?? "",
            ...splitDateTime(event.dateTime),
          };
        }

        const myClub = clubsResponse.data.find((item) => item._id === clubId) ?? (!isEditing && clubsResponse.data[0]);
        if (ignore) return;
        if (!myClub) {
          setLoadError("You can only create or edit events for a club you run.");
          return;
        }
        setClub(myClub);
        // A new event starts on the club's own campus, since most clubs host events at their own college.
        setForm(startingForm ?? { ...emptyForm, campus: myClub.campus });
      } catch (err) {
        if (!ignore) setLoadError(err.response?.data?.message || "Could not load this page. Please try again later.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id, isEditing, searchParams]);

  // Changes one field. Its error is cleared as soon as the officer starts fixing it.
  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setServerError("");
    const foundErrors = validate(form);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    // The date and time inputs are in the officer's own time zone, so they are joined and turned into one ISO date.
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      campus: form.campus,
      location: form.location.trim(),
      dateTime: new Date(`${form.date}T${form.time}`).toISOString(),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.patch(`/events/${id}`, body);
      } else {
        await api.post("/events", { ...body, hostClub: club._id });
      }
      const toast = isEditing
        ? { title: "Event updated", message: "Your changes are live." }
        : { title: "Event published", message: "Students across CUNY can now see it." };
      navigate(`/officer?club=${club._id}`, { state: { toast } });
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not save the event. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="motion-safe:animate-pulse" aria-busy="true">
        <p className="sr-only">Loading the event form...</p>
        <div className="h-10 w-72 max-w-full rounded-md bg-border" />
        <div className="mt-8 h-150 rounded-2xl bg-border" />
      </div>
    );
  }

  if (loadError) {
    return (
      <StatusBlock icon="alert-circle" title="Couldn't open this event" message={loadError}>
        <Link to="/officer" className={primaryButtonClass}>
          Back to officer dashboard
        </Link>
      </StatusBlock>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  // The preview is built from the form as the officer types, shaped like a real event so EventCard can draw it.
  const previewDate = form.date && form.time ? new Date(`${form.date}T${form.time}`) : new Date();
  const previewEvent = {
    _id: "preview",
    title: form.title.trim() || "Your event title",
    category: form.category,
    campus: form.campus,
    dateTime: previewDate.toISOString(),
    hostClub: { _id: club._id, name: club.name, campus: club.campus },
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/officer?club=${club._id}`} className="flex w-fit items-center gap-1.5 text-[14px] leading-5 font-bold">
        <Icon name="arrow-left" />
        Back to officer dashboard
      </Link>

      <div>
        <p className="mb-2 text-[12px] leading-4.5 font-extrabold tracking-widest text-primary uppercase">{club.name}</p>
        <h1>{isEditing ? "Edit event" : "Create event"}</h1>
        <p className="mt-2">Fill in the details. The card on the right shows how students will see it.</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_370px]">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 md:p-8">
          {(errorCount > 0 || serverError) && (
            <p role="alert" className="flex items-center gap-2 rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-[14px] leading-5 font-bold text-red-700">
              <Icon name="alert-circle" />
              {serverError || `Fix ${errorCount} ${errorCount === 1 ? "field" : "fields"} before publishing.`}
            </p>
          )}

          <p className="text-[12px] leading-4.5 font-extrabold tracking-widest uppercase">Basics</p>
          <TextField
            id="title"
            label="Event title"
            value={form.title}
            onChange={(value) => updateField("title", value)}
            placeholder="Intro to Git and GitHub"
            error={errors.title}
          />
          <TextAreaField
            id="description"
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Tell students what to expect"
          />
          <div className="flex flex-col gap-4 md:flex-row">
            <SelectField id="category" label="Category" value={form.category} onChange={(value) => updateField("category", value)} options={CATEGORIES} />
            <SelectField id="campus" label="Host college" value={form.campus} onChange={(value) => updateField("campus", value)} options={CAMPUSES} />
          </div>

          <p className="text-[12px] leading-4.5 font-extrabold tracking-widest uppercase">When &amp; where</p>
          <div className="flex flex-col gap-4 md:flex-row">
            <TextField id="date" type="date" label="Date" value={form.date} onChange={(value) => updateField("date", value)} error={errors.date} />
            <TextField id="time" type="time" label="Start time" value={form.time} onChange={(value) => updateField("time", value)} error={errors.time} />
          </div>
          <TextField
            id="location"
            label="Location"
            value={form.location}
            onChange={(value) => updateField("location", value)}
            placeholder="Building, room, or address"
            error={errors.location}
          />

          <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] leading-4">* Title, date, time and location are required.</p>
            <div className="flex gap-3">
              <Link to={`/officer?club=${club._id}`} className={secondaryButtonClass}>
                Cancel
              </Link>
              <button type="submit" className={primaryButtonClass} disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Save changes" : "Publish event"}
              </button>
            </div>
          </div>
        </form>

        <aside className="flex flex-col gap-3">
          <p className="text-[12px] leading-4.5 font-extrabold tracking-widest uppercase">Preview</p>
          {/* The preview is only for looking, so clicks are turned off and its links and save button do nothing. */}
          <div className="pointer-events-none" aria-hidden="true">
            <EventCard event={previewEvent} />
          </div>
          <p className="text-[12px] leading-4">This is how your event appears in the feed.</p>
        </aside>
      </div>
    </div>
  );
}
