/*
  Date helpers for the CUNY-Connect client.
  This file turns an event's ISO dateTime string into the short text shown on event cards.
  Owner: Person 3
  TODO: Decide whether times should always show in New York time. For now they use the viewer's own time zone.
*/

const millisecondsPerDay = 24 * 60 * 60 * 1000;

/**
 * Gets the short month name of a date.
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} The month, for example "Nov".
 */
export function getMonthShort(dateTime) {
  return new Date(dateTime).toLocaleDateString('en-US', { month: 'short' });
}

/**
 * Gets the short weekday name of a date.
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} The weekday, for example "Sat".
 */
export function getWeekdayShort(dateTime) {
  return new Date(dateTime).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Formats the date and time for the calendar row on a card.
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} The date and time, for example "Sat, Nov 7 · 6:00 PM".
 */
export function formatEventDateTime(dateTime) {
  const date = new Date(dateTime);
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return day + ' · ' + time;
}

/**
 * Builds the countdown label for an event.
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} "Today", "Tomorrow", "In X days", or an empty string if the event has passed.
 */
export function getCountdownLabel(dateTime) {
  const eventDate = new Date(dateTime);
  const now = new Date();
  if (eventDate < now) {
    return '';
  }

  // Comparing midnights counts calendar days, so tomorrow at 9 AM is "Tomorrow" even if it is under 24 hours away.
  // Math.round handles the one hour shift on days when the clocks change.
  const eventMidnight = new Date(eventDate).setHours(0, 0, 0, 0);
  const todayMidnight = new Date(now).setHours(0, 0, 0, 0);
  const daysAway = Math.round((eventMidnight - todayMidnight) / millisecondsPerDay);

  if (daysAway === 0) {
    return 'Today';
  }
  if (daysAway === 1) {
    return 'Tomorrow';
  }
  return 'In ' + daysAway + ' days';
}
