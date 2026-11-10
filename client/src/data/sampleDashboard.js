/*
  Sample dashboard data for the CUNY-Connect client.
  This file has the same shape as the real GET /api/users/me/dashboard response, plus a sample user,
  so the Dashboard page can be built before the frontend can log in.
  The events come from the real seed data, with dates set relative to today so they always look upcoming.
  Owner: Person 4
  TODO: Delete this file once the Dashboard page loads real data through the API client.
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

// The clubs below match the seed data, and each one is written the way the API sends a populated hostClub.
const mexicanStudentUnion = { _id: "c1", name: "Mexican Student Union", campus: "Hunter" };
const preLawSociety = { _id: "c2", name: "Pre-Law Society", campus: "Baruch" };
const queensCollege = { _id: "c3", name: "Queens College", campus: "Queens College" };

// Until AuthContext exists, this stands in for the logged-in user. The officer role shows the Officer tools link.
export const sampleUser = { _id: "u1", name: "Demo Student", role: "officer" };

const sampleDashboard = {
  savedEvents: [
    {
      _id: "e1",
      title: "Día de los Muertos Celebration",
      description: "Annual celebration with a community altar, mariachi music, traditional dances, and pan de muerto.",
      dateTime: daysFromNow(2, 17),
      location: "Hunter College",
      campus: "Hunter",
      category: "Cultural",
      hostClub: mexicanStudentUnion,
    },
    {
      _id: "e2",
      title: "A Can of Kindness Drive",
      description: "Thanksgiving food drive run with the Office of Diversity, Compliance and Equity Initiatives.",
      dateTime: daysFromNow(4, 12),
      location: "Baruch College",
      campus: "Baruch",
      category: "Volunteering",
      hostClub: preLawSociety,
    },
  ],
  followedEvents: [
    {
      _id: "e3",
      title: "A Can of Kindness Drive",
      description: "Thanksgiving food drive run with the Office of Diversity, Compliance and Equity Initiatives.",
      dateTime: daysFromNow(6, 12),
      location: "Baruch College",
      campus: "Baruch",
      category: "Volunteering",
      hostClub: preLawSociety,
    },
    {
      _id: "e4",
      title: "Roundtable on English Major Careers",
      description: "How to start a bookstore, press, or literary organization in Queens.",
      dateTime: daysFromNow(8, 12, 15),
      location: "Klapper Hall Student Gallery, 4th Floor",
      campus: "Queens College",
      category: "Career",
      hostClub: queensCollege,
    },
    {
      _id: "e5",
      title: "QC Opera Studio: Die Fledermaus",
      description: "A staged production of Die Fledermaus by the QC Opera Studio.",
      dateTime: daysFromNow(12, 19, 30),
      location: "LeFrak Concert Hall",
      campus: "Queens College",
      category: "Arts",
      hostClub: queensCollege,
    },
  ],
  followedClubs: [preLawSociety, queensCollege],
};

export default sampleDashboard;
