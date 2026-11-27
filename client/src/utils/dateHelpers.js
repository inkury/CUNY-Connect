/*
  Date helpers for the CUNY-Connect client.
  This file turns an event's ISO dateTime string into the short text shown on event cards and the event page,
  and works out the New York days for the Feed date chips and the Google Calendar link.
  Owner: Person 3
  Note: dates and day filters use New York time (the date chips here, and the server's date filter). 
  Displayed times use the viewer's own time zone, which is New York for our users.
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
 * Formats the date for the event page, for example "Sat, Oct 19".
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} The weekday, month, and day.
 */
export function formatEventDate(dateTime) {
  return new Date(dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Formats the start time for the event page, for example "9:00 AM".
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} The start time.
 */
export function formatEventTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Formats the date and time for the calendar row on a card.
 *
 * @param {string} dateTime The ISO date string.
 * @returns {string} The date and time, for example "Sat, Nov 7 · 6:00 PM".
 */
export function formatEventDateTime(dateTime) {
  return formatEventDate(dateTime) + ' · ' + formatEventTime(dateTime);
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

// Date chips on the Feed group events by their New York calendar day, wherever the viewer is.
const newYorkDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
const newYorkWeekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' });
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Gets the New York calendar day of a date, as YYYY-MM-DD. YYYY-MM-DD strings sort in date order.
 *
 * @param {string|Date} dateTime The ISO date string or Date.
 * @returns {string} The day, for example "2026-11-25".
 */
export function getNewYorkDay(dateTime) {
  return newYorkDay.format(new Date(dateTime));
}

/**
 * Adds days to a YYYY-MM-DD day.
 *
 * @param {string} day The day, for example "2026-11-25".
 * @param {number} count How many days to add.
 * @returns {string} The new day, for example "2026-11-27" for 2 days later.
 */
function addDays(day, count) {
  // Noon UTC keeps the date the same in every time zone while the days are added.
  const date = new Date(day + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

/**
 * Gets the first and last New York day for a Feed date chip.
 * Today is today. This weekend is the coming Saturday and Sunday, or today and tomorrow on a Saturday, and just
 * today on a Sunday. This week is today through the coming Sunday.
 *
 * @param {string} chip "today", "weekend", or "week".
 * @returns {{start: string, end: string}} The first and last day, both YYYY-MM-DD and both included.
 */
export function getChipDayRange(chip) {
  const today = getNewYorkDay(new Date());
  const weekday = weekdays.indexOf(newYorkWeekday.format(new Date()));
  const daysToSunday = (7 - weekday) % 7;
  if (chip === 'weekend') {
    const start = weekday === 0 ? today : addDays(today, 6 - weekday);
    return { start, end: addDays(today, daysToSunday) };
  }
  if (chip === 'week') {
    return { start: today, end: addDays(today, daysToSunday) };
  }
  return { start: today, end: today };
}

/**
 * Formats a date for a Google Calendar link: UTC, as YYYYMMDDTHHmmssZ.
 *
 * @param {Date} date The date.
 * @returns {string} The time, for example "20261126T173000Z".
 */
export function toGoogleCalendarTime(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
