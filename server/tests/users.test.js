/*
  Tests for the saved event routes in routes/users.js.
  These tests call the route handlers directly with fake requests, and they replace the model
  methods with stubs, so they run without a database.
  Owner: Person 4
  TODO: Add tests for the following and dashboard routes once they are built.
*/
const assert = require("node:assert/strict");
const { test, afterEach } = require("node:test");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const router = require("../routes/users");

const userId = new mongoose.Types.ObjectId();
const eventId = new mongoose.Types.ObjectId().toString();
const originalExists = Event.exists;
const originalUpdate = User.findByIdAndUpdate;

afterEach(() => {
  Event.exists = originalExists;
  User.findByIdAndUpdate = originalUpdate;
});

/**
 * Finds the handler for a route in the users router.
 *
 * @param {string} method The HTTP method, such as 'post'.
 * @param {string} routePath The route path, such as '/me/saved/:eventId'.
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
