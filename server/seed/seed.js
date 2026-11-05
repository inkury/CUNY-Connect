/*
  Seed script for CUNY-Connect.
  This file fills the database with real clubs and events from every campus folder in seed/data,
  plus a demo student, officer, and admin, so the app has something to show during development and demos.
  Run it from server/ with npm run seed. It replaces every club and event, so only run it on the dev database.
  Owner: Person 4
  TODO: Add more campus folders to seed/data as we collect them. The script picks them up automatically.
*/
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const User = require("../models/User");
const Club = require("../models/Club");
const Event = require("../models/Event");

const DATA_DIR = path.join(__dirname, "data");
const DAY_MS = 24 * 60 * 60 * 1000;

// These accounts exist only for testing and demos, so the shared password is written here on purpose.
const DEMO_PASSWORD = "password123";
const DEMO_USERS = [
  { name: "Demo Student", email: "student@cunyconnect.dev", campus: "Hunter", role: "student" },
  { name: "Demo Officer", email: "officer@cunyconnect.dev", campus: "Hunter", role: "officer" },
  { name: "Demo Admin", email: "admin@cunyconnect.dev", campus: "Hunter", role: "admin" },
];
// The demo officer runs this club, so the officer pages have real events to manage.
const OFFICER_CLUB = { campus: "Hunter", name: "Computer Science Club" };

/**
 * Reads the clubs and events from every campus folder in seed/data.
 *
 * @param {string} dataDir The folder that holds one subfolder per campus.
 * @returns {{clubs: object[], events: object[]}} Every club and event, with events still naming their host club.
 */
function loadCampusData(dataDir) {
  const clubs = [];
  const events = [];

  // Each campus lives in its own folder, so adding a campus never means editing this script.
  const folders = fs.readdirSync(dataDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const folder of folders) {
    const dir = path.join(dataDir, folder.name);
    clubs.push(...JSON.parse(fs.readFileSync(path.join(dir, "clubs.json"), "utf8")));
    events.push(...JSON.parse(fs.readFileSync(path.join(dir, "events.json"), "utf8")));
  }

  return { clubs, events };
}

/**
 * Moves every event forward by whole days when the earliest one is no longer upcoming.
 *
 * @param {object[]} events The events to shift, each with an ISO dateTime string.
 * @param {Date} now The current time.
 * @returns {object[]} New event objects with shifted dateTime values.
 */
function shiftDatesForward(events, now) {
  if (events.length === 0) return [];

  const earliest = Math.min(...events.map((event) => new Date(event.dateTime).getTime()));
  const tomorrow = now.getTime() + DAY_MS;

  // Real dates are kept while they are still upcoming, so the data matches the source pages for as long as possible.
  if (earliest >= tomorrow) return events.map((event) => ({ ...event }));

  // Shifting by whole days keeps every event at its real time of day and keeps the gaps between events the same.
  const days = Math.ceil((tomorrow - earliest) / DAY_MS);
  return events.map((event) => ({
    ...event,
    dateTime: new Date(new Date(event.dateTime).getTime() + days * DAY_MS).toISOString(),
  }));
}

/**
 * Builds the key used to find a club, since two campuses can have clubs with the same name.
 *
 * @param {string} campus The club's campus.
 * @param {string} name The club's name.
 * @returns {string} The lookup key.
 */
function clubKey(campus, name) {
  return `${campus}::${name}`;
}

/**
 * Replaces the hostClub name on each event with the id of the matching club.
 *
 * @param {object[]} events The events, each naming its host club.
 * @param {Map<string, object>} clubIds Club ids keyed by clubKey.
 * @returns {object[]} Events ready to insert.
 */
function linkEventsToClubs(events, clubIds) {
  return events.map((event) => {
    const id = clubIds.get(clubKey(event.campus, event.hostClub));

    // A typo in a JSON file should stop the seed loudly instead of leaving an event with no host.
    if (!id) {
      throw new Error(`No club named "${event.hostClub}" at ${event.campus} for event "${event.title}"`);
    }
    return { ...event, hostClub: id };
  });
}

/**
 * Connects to the database, replaces all clubs and events, and recreates the demo users.
 *
 * @returns {Promise<void>} Resolves once the database has been seeded.
 */
async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes("<")) {
    throw new Error("MONGO_URI is not set in server/.env, so there is no database to seed.");
  }

  const { clubs, events } = loadCampusData(DATA_DIR);
  const shiftedEvents = shiftDatesForward(events, new Date());

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Old clubs and events are removed first, otherwise running the seed twice would duplicate everything.
  await Event.deleteMany({});
  await Club.deleteMany({});

  const savedClubs = await Club.insertMany(clubs);
  const clubIds = new Map(savedClubs.map((club) => [clubKey(club.campus, club.name), club._id]));

  const savedEvents = await Event.insertMany(linkEventsToClubs(shiftedEvents, clubIds));

  // Teammates' own test accounts are kept, but their saves and follows would point at deleted ids, so those are cleared.
  await User.updateMany({}, { $set: { savedEvents: [], followedClubs: [] } });
  await User.deleteMany({ email: { $in: DEMO_USERS.map((user) => user.email) } });

  // User.create is used instead of insertMany because only save runs the hook that hashes the password.
  const [student, officer] = await User.create(
    DEMO_USERS.map((user) => ({ ...user, password: DEMO_PASSWORD })),
  );

  const officerClubId = clubIds.get(clubKey(OFFICER_CLUB.campus, OFFICER_CLUB.name));
  await Club.updateOne({ _id: officerClubId }, { $addToSet: { officers: officer._id } });

  // The demo student starts with a couple of saves and a follow, so the dashboard is not empty in demos.
  student.savedEvents = savedEvents.slice(0, 2).map((event) => event._id);
  student.followedClubs = [officerClubId];
  await student.save();

  console.log(`Seeded ${savedClubs.length} clubs, ${savedEvents.length} events, and ${DEMO_USERS.length} demo users.`);
  console.log(`Demo logins use the password ${DEMO_PASSWORD}: ${DEMO_USERS.map((user) => user.email).join(", ")}`);
}

// The helpers are exported so they can be tested without a database, and the seed only runs when called directly.
if (require.main === module) {
  seed()
    .catch((err) => {
      console.error(`Seed failed: ${err.message}`);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { loadCampusData, shiftDatesForward, clubKey, linkEventsToClubs };
