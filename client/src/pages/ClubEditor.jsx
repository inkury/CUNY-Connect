/*
  ClubEditor page for CUNY-Connect, shown at /officer/club. With a club id in the link, it edits that club instead.
  Any logged in student can request a new club, which waits for an admin to approve it. Officers use the
  same form to update their club's name, campus, and description. There is no Figma frame for it, so it
  follows the style of the event form.
  Owner: Person 4
  TODO: Saving needs Kenneth's POST and PATCH /api/clubs routes. Until they are merged, the form shows the server's error.
*/
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import { CAMPUSES } from "../constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../components/Icon.jsx";
import StatusBlock from "../components/StatusBlock.jsx";
import { SelectField, TextAreaField, TextField } from "../components/FormFields.jsx";
import { primaryButtonClass, secondaryButtonClass } from "../components/buttonStyles.js";

/**
 * Renders the start a club and edit club page.
 *
 * @returns {JSX.Element} The page.
 */
export default function ClubEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const clubId = searchParams.get("id");
  const isEditing = Boolean(clubId);

  // New clubs start on the student's own campus, since that is almost always where the club meets.
  const [form, setForm] = useState({ name: "", campus: user?.campus || CAMPUSES[0], description: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let ignore = false;

    async function loadClub() {
      try {
        // Only clubs the user runs come back here, so nobody can open the edit form for someone else's club.
        const response = await api.get("/users/me/clubs");
        const club = response.data.find((item) => item._id === clubId);
        if (ignore) return;
        if (!club) {
          setLoadError("You can only edit a club you run.");
          return;
        }
        setForm({ name: club.name, campus: club.campus, description: club.description ?? "" });
      } catch (err) {
        if (!ignore) setLoadError(err.response?.data?.message || "Could not load this club. Please try again later.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadClub();
    return () => {
      ignore = true;
    };
  }, [clubId, isEditing]);

  // Changes one field. Its error is cleared as soon as the user starts fixing it.
  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setServerError("");
    const foundErrors = {};
    if (!form.name.trim()) foundErrors.name = "Add your club's name.";
    if (!form.description.trim()) foundErrors.description = "Add a short description so students know what the club does.";
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    const body = { name: form.name.trim(), campus: form.campus, description: form.description.trim() };
    setSaving(true);
    try {
      if (isEditing) {
        await api.patch(`/clubs/${clubId}`, body);
        navigate(`/officer?club=${clubId}`, {
          state: { toast: { title: "Club updated", message: "Your club page shows the new details." } },
        });
      } else {
        await api.post("/clubs", body);
        setSubmitted(true);
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not save the club. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="motion-safe:animate-pulse" aria-busy="true">
        <p className="sr-only">Loading your club...</p>
        <div className="h-10 w-72 max-w-full rounded-md bg-border dark:bg-dark-border" />
        <div className="mt-8 h-96 max-w-2xl rounded-2xl bg-border dark:bg-dark-border" />
      </div>
    );
  }

  if (loadError) {
    return (
      <StatusBlock icon="alert-circle" title="Couldn't open this club" message={loadError}>
        <Link to="/officer" className={primaryButtonClass}>
          Back to officer dashboard
        </Link>
      </StatusBlock>
    );
  }

  // A new club is not public until an admin approves it, so the student is told what happens next.
  if (submitted) {
    return (
      <StatusBlock icon="check" title="Club submitted" message={`${form.name} is waiting for an admin to approve it. Once it's approved, you can post events.`}>
        <Link to="/dashboard" className={primaryButtonClass}>
          Back to dashboard
        </Link>
      </StatusBlock>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;
  const backLink = isEditing ? `/officer?club=${clubId}` : "/dashboard";

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link to={backLink} className="flex w-fit items-center gap-1.5 text-[14px] leading-5 font-bold">
        <Icon name="arrow-left" />
        {isEditing ? "Back to officer dashboard" : "Back to dashboard"}
      </Link>

      <div>
        <h1>{isEditing ? "Edit club profile" : "Start a club"}</h1>
        <p className="mt-2">
          {isEditing
            ? "Keep your club page accurate and welcoming."
            : "Tell us about your club. An admin reviews every new club before it shows up for students."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-5 md:p-8">
        {(errorCount > 0 || serverError) && (
          <p role="alert" className="flex items-center gap-2 rounded-[10px] border border-red-300 dark:border-red-400/50 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-[14px] leading-5 font-bold text-red-700 dark:text-red-400">
            <Icon name="alert-circle" />
            {serverError || `Fix ${errorCount} ${errorCount === 1 ? "field" : "fields"} before saving.`}
          </p>
        )}
        <TextField id="name" label="Club name" value={form.name} onChange={(value) => updateField("name", value)} placeholder="Hunter Coding Club" error={errors.name} />
        <SelectField id="campus" label="Campus" value={form.campus} onChange={(value) => updateField("campus", value)} options={CAMPUSES} />
        <TextAreaField
          id="description"
          label="Description"
          value={form.description}
          onChange={(value) => updateField("description", value)}
          placeholder="What does your club do, and who should join?"
          error={errors.description}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Link to={backLink} className={secondaryButtonClass}>
            Cancel
          </Link>
          <button type="submit" className={primaryButtonClass} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save changes" : "Submit for approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
