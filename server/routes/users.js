/*
  User routes for CUNY-Connect.
  This file handles the logged-in user's own account, saved events, followed clubs, and dashboard data.
  Owner: Person 1 (PATCH /me) and Person 4 (saved, following, and dashboard routes)
  TODO: Person 1 makes PATCH /me update only the name and campus, never the email, role, or password.
  Person 4 makes the following routes add or remove a club id with $addToSet and $pull, like the
  saved routes already do, and makes the dashboard route return saved events plus upcoming events
  from followed clubs.
*/
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const { protect } = require("../middleware/auth");
const notImplemented = require("../utils/notImplemented");

const router = express.Router();

/**
 * Adds an event to the logged-in user's saved events.
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
 * Removes an event from the logged-in user's saved events.
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

// Every route here is about the logged-in user, so protect runs once for the whole router.
router.use(protect);

// Person 1 owns profile updates because they are part of the account system.
// This path is relative to /api/users, where index.js mounts this router.
router.patch("/me", notImplemented);

// Person 4 owns saving, following, and the dashboard because they feed the Dashboard page.
router.post("/me/saved/:eventId", saveEvent);

router.delete("/me/saved/:eventId", unsaveEvent);

router.post("/me/following/:clubId", notImplemented);

router.delete("/me/following/:clubId", notImplemented);

router.get("/me/dashboard", notImplemented);

module.exports = router;
