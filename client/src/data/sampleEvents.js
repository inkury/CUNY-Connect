/*
  Sample events for the CUNY-Connect client.
  This file holds preview data based on server/seed/data/hunter/events.json, so the cards can be built before the API is ready.
  Dates are made relative to today, so the countdown labels always have something to show.
  Owner: Person 3
  TODO: Delete this file once the Feed gets real data from GET /api/events.
*/

/**
 * Builds an ISO date string a number of days from today.
 *
 * @param {number} days How many days from today, where 0 is today.
 * @param {number} hour The hour on a 24 hour clock.
 * @param {number} [minute] The minute.
 * @returns {string} The ISO date string.
 */
function daysFromNow(days, hour, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// The clubs from the seed data that host these events.
const hunterCollege = { _id: 'c1', name: 'Hunter College', campus: 'Hunter' };
const mexicanStudentUnion = { _id: 'c2', name: 'Mexican Student Union', campus: 'Hunter' };
const computerScienceClub = { _id: 'c3', name: 'Computer Science Club', campus: 'Hunter' };

const sampleEvents = [
  {
    _id: 'e1',
    title: 'Homecoming 2026',
    description: 'Cheer on the Hunter Hawks, join the tailgate, and reconnect with alumni at the evening reception.',
    // This one is late in the day so it still counts as upcoming, and shows "Today", for most of the day.
    dateTime: daysFromNow(0, 23, 30),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Sports',
    hostClub: hunterCollege,
  },
  {
    _id: 'e2',
    title: 'Día de los Muertos Celebration',
    description: 'Annual celebration with a community altar, mariachi music, traditional dances, and pan de muerto. All are welcome.',
    dateTime: daysFromNow(1, 17),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Cultural',
    hostClub: mexicanStudentUnion,
  },
  {
    _id: 'e3',
    title: 'Résumé Clinic',
    description: 'A hands on hour to strengthen your résumé for job and internship applications.',
    dateTime: daysFromNow(3, 13),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Career',
    hostClub: hunterCollege,
  },
  {
    _id: 'e4',
    // This is the long title that tests the two line cutoff on the card.
    title: 'Reconcilable Differences: Barbara Perry in Conversation with Alexis Coe',
    description: 'Historian Barbara Perry discusses her new book in conversation with author Alexis Coe.',
    dateTime: daysFromNow(6, 18),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Academic',
    hostClub: hunterCollege,
  },
  {
    _id: 'e5',
    title: 'Transfer Student Finals Study Hangout',
    description: 'A cozy space for transfer students to study, recharge, and meet each other before finals.',
    dateTime: daysFromNow(9, 12),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Social',
    hostClub: hunterCollege,
  },
  {
    _id: 'e6',
    title: 'Met Opera Outing: Samson et Dalila',
    description: "The Office of the Arts has a limited number of tickets to the Met Opera's dress rehearsal of Samson et Dalila.",
    dateTime: daysFromNow(12, 10),
    location: 'Metropolitan Opera, Lincoln Center',
    campus: 'Hunter',
    category: 'Arts',
    hostClub: hunterCollege,
  },
  {
    _id: 'e7',
    title: 'Understanding Your Financial Aid & FAFSA Filing 101',
    description: 'The Office of Financial Aid walks through financial aid basics and filing the 2027-2028 FAFSA.',
    dateTime: daysFromNow(16, 17),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Other',
    hostClub: hunterCollege,
  },
  {
    _id: 'e8',
    // The seed data has no Tech events, so this one is made up to show the Tech gradient.
    title: 'Intro to Web Development Workshop',
    description: 'Build and publish your first web page with the Computer Science Club. No experience needed, just bring a laptop.',
    dateTime: daysFromNow(20, 13, 30),
    location: 'Hunter College',
    campus: 'Hunter',
    category: 'Tech',
    hostClub: computerScienceClub,
  },
];

export default sampleEvents;
