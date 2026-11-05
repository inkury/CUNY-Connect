/*
  Tests for the helper functions in seed/seed.js.
  These tests check the seed data files and the date shifting without connecting to a database.
  Owner: Person 4
  TODO: Nothing for now. Add a test here if the seed script gets a new helper.
*/
const assert = require("node:assert/strict");
const path = require("path");
const { test } = require("node:test");
const { loadCampusData, shiftDatesForward, clubKey, linkEventsToClubs } = require("../seed/seed");

const DAY_MS = 24 * 60 * 60 * 1000;

test("every campus event names a host club that exists at the same campus", () => {
  const { clubs, events } = loadCampusData(path.join(__dirname, "..", "seed", "data"));
  const ids = new Map(clubs.map((club, i) => [clubKey(club.campus, club.name), `id${i}`]));
  assert.ok(events.length > 0);
  assert.doesNotThrow(() => linkEventsToClubs(events, ids));
});

test("past dates move forward by whole days so the earliest event is tomorrow", () => {
  const now = new Date("2026-12-01T12:00:00.000Z");
  const events = [
    { title: "a", dateTime: "2026-11-01T18:00:00.000Z" },
    { title: "b", dateTime: "2026-11-03T22:30:00.000Z" },
  ];
  const shifted = shiftDatesForward(events, now);
  const first = new Date(shifted[0].dateTime);
  const second = new Date(shifted[1].dateTime);
  assert.ok(first.getTime() >= now.getTime() + DAY_MS);
  assert.ok(first.getTime() < now.getTime() + 2 * DAY_MS);
  // The time of day and the gap between events stay the same after shifting.
  assert.equal(first.toISOString().slice(11), "18:00:00.000Z");
  assert.equal(second - first, 2 * DAY_MS + 4.5 * 60 * 60 * 1000);
});

test("upcoming dates are left alone", () => {
  const events = [{ title: "a", dateTime: "2099-01-01T18:00:00.000Z" }];
  assert.deepEqual(shiftDatesForward(events, new Date()), events);
});

test("an event with an unknown host club stops the seed", () => {
  const events = [{ title: "x", campus: "Hunter", hostClub: "Not A Club" }];
  assert.throws(() => linkEventsToClubs(events, new Map()), /No club named "Not A Club"/);
});
