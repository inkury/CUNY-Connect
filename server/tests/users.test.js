/*
  Tests for the saved, following, and dashboard routes in routes/users.js.
  These tests call the route handlers directly with fake requests, and they replace the model
  methods with stubs, so they run without a database.
  Owner: Person 4
  TODO: Nothing for now. Add tests here if more user routes are added.
*/
const assert = require("node:assert/strict");
const { test, afterEach } = require("node:test");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const Club = require("../models/Club");
const router = require("../routes/users");

const userId = new mongoose.Types.ObjectId();
const eventId = new mongoose.Types.ObjectId().toString();
const originalExists = Event.exists;
const originalUpdate = User.findByIdAndUpdate;
const originalClubExists = Club.exists;
const originalClubFind = Club.find;
const originalEventFind = Event.find;
const clubId = new mongoose.Types.ObjectId().toString();

afterEach(() => {
  Event.exists = originalExists;
  User.findByIdAndUpdate = originalUpdate;
  Club.exists = originalClubExists;
  Club.find = originalClubFind;
  Event.find = originalEventFind;
});

/**
 * Finds the handler for a route in the users router.
 *
 * @param {string} method The HTTP method, such as "post".
 * @param {string} routePath The route path, such as "/me/saved/:eventId".
 * @returns {function} The route's last handler.
 */
function handler(method, routePath) {
  const layer = router.stack.find((entry) => entry.route?.path === routePath && entry.route.methods[method]);
  return layer.route.stack.at(-1).handle;
}

/**
 * Builds a fake response object that records the status code and JSON body.
 *
 * @returns {object} The fake response.
 */
function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = JSON.parse(JSON.stringify(value)); return this; },
  };
}

const save = handler("post", "/me/saved/:eventId");
const unsave = handler("delete", "/me/saved/:eventId");

test("saving an event adds it with $addToSet and returns the updated list", async () => {
  Event.exists = async () => ({ _id: eventId });
  User.findByIdAndUpdate = async (id, update) => {
    assert.equal(id, userId);
    assert.deepEqual(update, { $addToSet: { savedEvents: eventId } });
    return { savedEvents: [eventId] };
  };
  const res = response();
  await save({ params: { eventId }, user: { _id: userId } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { savedEvents: [eventId] });
});

test("saving an event that does not exist returns 404 and changes nothing", async () => {
  Event.exists = async () => null;
  User.findByIdAndUpdate = async () => assert.fail("user should not be updated");
  const res = response();
  await save({ params: { eventId }, user: { _id: userId } }, res);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Event not found" });
});

test("a bad event id returns 400 on both save and unsave", async () => {
  for (const route of [save, unsave]) {
    const res = response();
    await route({ params: { eventId: "not-an-id" }, user: { _id: userId } }, res);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Invalid event id" });
  }
});

test("unsaving an event removes it with $pull and returns the updated list", async () => {
  User.findByIdAndUpdate = async (id, update) => {
    assert.deepEqual(update, { $pull: { savedEvents: eventId } });
    return { savedEvents: [] };
  };
  const res = response();
  await unsave({ params: { eventId }, user: { _id: userId } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { savedEvents: [] });
});

test("every user route requires a login", () => {
  // The users router runs protect before any route, so no saved route can be reached without a token.
  assert.equal(router.stack[0].handle.name, "protect");
});

const follow = handler("post", "/me/following/:clubId");
const unfollow = handler("delete", "/me/following/:clubId");
const dashboard = handler("get", "/me/dashboard");

test("following an approved club adds it with $addToSet and returns the updated list", async () => {
  Club.exists = async (filter) => {
    assert.deepEqual(filter, { _id: clubId, approved: true });
    return { _id: clubId };
  };
  User.findByIdAndUpdate = async (id, update) => {
    assert.deepEqual(update, { $addToSet: { followedClubs: clubId } });
    return { followedClubs: [clubId] };
  };
  const res = response();
  await follow({ params: { clubId }, user: { _id: userId } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { followedClubs: [clubId] });
});

test("following a missing or unapproved club returns 404 and changes nothing", async () => {
  Club.exists = async () => null;
  User.findByIdAndUpdate = async () => assert.fail("user should not be updated");
  const res = response();
  await follow({ params: { clubId }, user: { _id: userId } }, res);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Club not found" });
});

test("a bad club id returns 400 on both follow and unfollow", async () => {
  for (const route of [follow, unfollow]) {
    const res = response();
    await route({ params: { clubId: "not-an-id" }, user: { _id: userId } }, res);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Invalid club id" });
  }
});

test("unfollowing a club removes it with $pull and returns the updated list", async () => {
  User.findByIdAndUpdate = async (id, update) => {
    assert.deepEqual(update, { $pull: { followedClubs: clubId } });
    return { followedClubs: [] };
  };
  const res = response();
  await unfollow({ params: { clubId }, user: { _id: userId } }, res);
  assert.deepEqual(res.body, { followedClubs: [] });
});

test("the dashboard returns upcoming saved events, events from followed clubs, and the followed clubs", async () => {
  const savedEvent = { _id: eventId, title: "Saved" };
  const followedEvent = { _id: "e2", title: "From a followed club" };
  const club = { _id: clubId, name: "Computer Science Club", campus: "Hunter" };
  const before = Date.now();

  // Each stub mimics a mongoose query, which is chained with sort and populate before it resolves.
  Event.find = (filter) => {
    assert.ok(filter.dateTime.$gte.getTime() >= before);
    const result = filter._id ? [savedEvent] : [followedEvent];
    if (filter._id) assert.deepEqual(filter._id, { $in: [eventId] });
    else assert.deepEqual(filter.hostClub, { $in: [clubId] });
    return {
      sort(order) { assert.deepEqual(order, { dateTime: 1 }); return this; },
      populate(field, fields) {
        assert.equal(field, "hostClub");
        assert.equal(fields, "_id name campus");
        return Promise.resolve(result);
      },
    };
  };
  Club.find = (filter) => {
    assert.deepEqual(filter, { _id: { $in: [clubId] } });
    return { select: async () => [club] };
  };

  const res = response();
  await dashboard({ user: { _id: userId, savedEvents: [eventId], followedClubs: [clubId] } }, res);
  assert.deepEqual(res.body, { savedEvents: [savedEvent], followedEvents: [followedEvent], followedClubs: [club] });
});
