/*
  Save button logic for the CUNY-Connect client.
  This hook tells a component whether the logged-in user saved an event, and saves or unsaves it with
  POST and DELETE /users/me/saved/:eventId. EventCard and EventDetail both use it, so they always agree.
  Owner: Person 3
*/
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Returns whether an event is saved and a function that saves or unsaves it.
 *
 * @param {string} eventId The _id of the event.
 * @returns {{saved: boolean, toggleSave: function}} The saved state and the toggle function.
 */
export default function useSaveEvent(eventId) {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  // Ids from the server are strings, but comparing as strings keeps this safe if one is ever an object id.
  const saved = Boolean(user?.savedEvents?.some((savedId) => String(savedId) === String(eventId)));

  // Adds or removes this event in the user's savedEvents. It updates from the latest user, so other changes are kept.
  function setSavedLocally(shouldBeSaved) {
    setUser((current) => {
      // The user may have logged out while a request was running, so there is nothing to update.
      if (!current) {
        return current;
      }
      const others = (current.savedEvents ?? []).filter((savedId) => String(savedId) !== String(eventId));
      return { ...current, savedEvents: shouldBeSaved ? [...others, eventId] : others };
    });
  }

  async function toggleSave() {
    // While the saved session is still being checked, the user is not known yet, so the click is ignored.
    if (loading) {
      return;
    }
    // Saving needs a login, so guests are sent to the login page.
    if (!user) {
      navigate('/login');
      return;
    }

    const wasSaved = saved;
    // Flip the button right away, so it feels instant, then confirm with the server.
    setSavedLocally(!wasSaved);
    try {
      const response = wasSaved
        ? await api.delete(`/users/me/saved/${eventId}`)
        : await api.post(`/users/me/saved/${eventId}`);
      // The server sends back the full saved list, which is the source of truth.
      setUser((current) => (current ? { ...current, savedEvents: response.data.savedEvents } : current));
    } catch {
      // The request failed, so the button goes back to how it was.
      setSavedLocally(wasSaved);
    }
  }

  return { saved, toggleSave };
}
