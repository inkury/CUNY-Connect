/*
  User routes for CUNY-Connect.
  This file handles the logged in user's own account, saved events, followed clubs, and dashboard data.
  Owner: Person 1 (PATCH /me) and Person 4 (saved, following, and dashboard routes)
  TODO: Person 1 makes PATCH /me update only the name and campus, never the email, role, or password.
  Person 4's saved, following, dashboard, and my clubs routes are done.
*/
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const Club = require("../models/Club");
const { protect } = require("../middleware/auth");
const notImplemented = require("../utils/notImplemented");

const router = express.Router();

/**
 * Adds a club to the logged in user's followed clubs.
 *
 * @param {object} req The incoming request, with the club id in req.params.clubId.
 * @param {object} res The response object.
 * @returns {Promise<void>} Sends { followedClubs } with the updated list of followed club ids.
 */
async function followClub(req, res) {
  const { clubId } = req.params;
  if (!mongoose.isObjectIdOrHexString(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  // Clubs waiting for admin approval are hidden from students, so they cannot be followed yet.
  if (!(await Club.exists({ _id: clubId, approved: true }))) {
    return res.status(404).json({ message: "Club not found" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { followedClubs: clubId } },
    { returnDocument: "after" },
  );
  return res.json({ followedClubs: user.followedClubs });
}

/**
 * Removes a club from the logged in user's followed clubs.
 *
 * @param {object} req The incoming request, with the club id in req.params.clubId.
 * @param {object} res The response object.
 * @returns {Promise<void>} Sends { followedClubs } with the updated list of followed club ids.
 */
async function unfollowClub(req, res) {
  const { clubId } = req.params;
  if (!mongoose.isObjectIdOrHexString(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  // Like unsaving, this skips the club lookup so a user can still unfollow a club that was deleted.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { followedClubs: clubId } },
    { returnDocument: "after" },
  );
  return res.json({ followedClubs: user.followedClubs });
}

/**
 * Returns the clubs the logged in user is an officer of, each with its upcoming events.
 *
 * @param {object} req The incoming request, with the logged in user in req.user.
 * @param {object} res The response object.
 * @returns {Promise<void>} Sends a list of clubs, each with an upcomingEvents list.
 */
async function getMyClubs(req, res) {
  // Clubs still waiting for approval are included, so a new officer can see that their club is pending.
  const clubs = await Club.find({ officers: req.user._id })
    .sort({ name: 1 })
    .select("_id name campus description approved");

  // One query loads every club's events at once, instead of one query per club.
  const events = await Event.find({
    hostClub: { $in: clubs.map((club) => club._id) },
    dateTime: { $gte: new Date() },
  })
    .sort({ dateTime: 1 })
    .populate("hostClub", "_id name campus");

  const result = clubs.map((club) => ({
    ...club.toJSON(),
    upcomingEvents: events.filter((event) => String(event.hostClub._id) === String(club._id)),
  }));
  return res.json(result);
}

/**
 * Returns everything the Dashboard page shows for the logged in user.
 *
 * @param {object} req The incoming request, with the logged in user in req.user.
 * @param {object} res The response object.
 * @returns {Promise<void>} Sends { savedEvents, followedEvents, followedClubs }.
 */
async function getDashboard(req, res) {
  const now = new Date();
  const { savedEvents, followedClubs } = req.user;

  // Only upcoming events are shown, so past saves drop off the dashboard on their own.
  const [saved, fromFollowed, clubs] = await Promise.all([
    Event.find({ _id: { $in: savedEvents }, dateTime: { $gte: now } })
      .sort({ dateTime: 1 })
      .populate("hostClub", "_id name campus"),
    Event.find({ hostClub: { $in: followedClubs }, dateTime: { $gte: now } })
      .sort({ dateTime: 1 })
      .populate("hostClub", "_id name campus"),
    // The followed clubs are sent too, so the page can show each one with an Unfollow button.
    Club.find({ _id: { $in: followedClubs } }).select("_id name campus"),
  ]);

  return res.json({ savedEvents: saved, followedEvents: fromFollowed, followedClubs: clubs });
}

/**
 * Adds an event to the logged in user's saved events.
 *
 * @param {object} req The incoming request, with the event id in req.params.eventId.
 * @param {object} res The response object.
 * @returns {Promise<void>} Sends { savedEvents } with the updated list of saved event ids.
 */
async function saveEvent(req, res) {
  const { eventId } = req.params;
  if (!mongoose.isObjectIdOrHexString(eventId)) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  // Saving an event that does not exist would leave a dangling id on the user, so it is checked first.
  if (!(await Event.exists({ _id: eventId }))) {
    return res.status(404).json({ message: "Event not found" });
  }

  // $addToSet makes saving twice harmless, so a double click never creates a duplicate.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedEvents: eventId } },
    { returnDocument: "after" },
  );
  return res.json({ savedEvents: user.savedEvents });
}

/**
 * Removes an event from the logged in user's saved events.
 *
 * @param {object} req The incoming request, with the event id in req.params.eventId.
 * @param {object} res The response object.
 * @returns {Promise<void>} Sends { savedEvents } with the updated list of saved event ids.
 */
async function unsaveEvent(req, res) {
  const { eventId } = req.params;
  if (!mongoose.isObjectIdOrHexString(eventId)) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  // The event is not looked up here, so a user can still unsave an event that has since been deleted.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedEvents: eventId } },
    { returnDocument: "after" },
  );
  return res.json({ savedEvents: user.savedEvents });
}

// Every route here is about the logged in user, so protect runs once for the whole router.
router.use(protect);

// Person 1 owns profile updates because they are part of the account system.
// This path is relative to /api/users, where index.js mounts this router.
router.patch("/me", notImplemented);

// Person 4 owns saving, following, and the dashboard because they feed the Dashboard page.
router.post("/me/saved/:eventId", saveEvent);

router.delete("/me/saved/:eventId", unsaveEvent);

router.post("/me/following/:clubId", followClub);

router.delete("/me/following/:clubId", unfollowClub);

router.get("/me/dashboard", getDashboard);

// Officers use this on the Officer Dashboard to manage their clubs and events.
router.get("/me/clubs", getMyClubs);

module.exports = router;
