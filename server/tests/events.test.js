const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Club = require('../models/Club');
const router = require('../routes/events');

const list = router.stack.find(layer => layer.route?.path === '/').route.stack[0].handle;
const detail = router.stack.find(layer => layer.route?.path === '/:id').route.stack[0].handle;
const originalFind = Event.collection.find;
const originalFindOne = Event.collection.findOne;
const originalClubFind = Club.collection.find;

after(() => {
  Event.collection.find = originalFind;
  Event.collection.findOne = originalFindOne;
  Club.collection.find = originalClubFind;
});

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = JSON.parse(JSON.stringify(value)); return this; },
  };
}

test('list applies upcoming, campus, category, UTC day, and ascending sort', async () => {
  Event.collection.find = (filter, options) => {
    assert.equal(filter.campus, 'Hunter');
    assert.equal(filter.category, 'Tech');
    assert.equal(filter.dateTime.$gte.toISOString(), '2099-11-05T00:00:00.000Z');
    assert.equal(filter.dateTime.$lt.toISOString(), '2099-11-06T00:00:00.000Z');
    assert.deepEqual(options.sort, { dateTime: 1 });
    return { toArray: async () => [] };
  };
  const res = response();
  await list({ query: { campus: 'Hunter', category: 'Tech', date: '2099-11-05' } }, res);
  assert.deepEqual(res.body, []);
});

test('unfiltered list starts at now; past dates retain the upcoming restriction', async () => {
  const before = Date.now();
  Event.collection.find = filter => {
    assert.ok(filter.dateTime.$gte.getTime() >= before);
    assert.ok(filter.dateTime.$gte.getTime() <= Date.now());
    assert.equal(filter.dateTime.$lt, undefined);
    return { toArray: async () => [] };
  };
  await list({ query: {} }, response());
  Event.collection.find = filter => {
    assert.ok(filter.dateTime.$gte.getTime() >= before);
    assert.equal(filter.dateTime.$lt.toISOString(), '2000-01-02T00:00:00.000Z');
    return { toArray: async () => [] };
  };
  await list({ query: { date: '2000-01-01' } }, response());
});

test('rejects invalid dates and repeated filter parameters', async () => {
  for (const query of [
    { date: '2026-02-30' }, { date: 'invalid' }, { date: ['2026-11-05'] },
    { campus: ['Hunter', 'Queens'] }, { category: { $ne: '' } },
  ]) {
    const res = response();
    await list({ query }, res);
    assert.equal(res.statusCode, 400);
  }
});

test('invalid and missing event IDs return the exact 404 body', async () => {
  Event.collection.findOne = async () => null;
  for (const id of ['invalid', '123', new mongoose.Types.ObjectId().toString()]) {
    const res = response();
    await detail({ params: { id } }, res);
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { message: 'Event not found' });
  }
});

test('both endpoints populate only host club ID, name, campus and serialize ISO dates', async () => {
  const clubId = new mongoose.Types.ObjectId();
  const eventId = new mongoose.Types.ObjectId();
  const event = { _id: eventId, title: 'Meetup', dateTime: new Date('2099-11-05T18:00:00.000Z'), hostClub: clubId };
  Event.collection.find = () => ({ toArray: async () => [event] });
  Event.collection.findOne = async filter => {
    assert.equal(filter._id.toString(), eventId.toString());
    return event;
  };
  Club.collection.find = (filter, options) => {
    assert.deepEqual(options.projection, { _id: 1, name: 1, campus: 1 });
    return { toArray: async () => [{ _id: clubId, name: 'Tech Club', campus: 'Hunter' }] };
  };
  for (const handler of [list, detail]) {
    const res = response();
    await handler({ query: {}, params: { id: eventId.toString() } }, res);
    const result = Array.isArray(res.body) ? res.body[0] : res.body;
    assert.equal(result._id, eventId.toString());
    assert.equal(result.dateTime, '2099-11-05T18:00:00.000Z');
    assert.deepEqual(result.hostClub, { _id: clubId.toString(), name: 'Tech Club', campus: 'Hunter' });
  }
});

test('database errors propagate to Express error handling', async () => {
  Event.collection.findOne = async () => { throw new Error('Database unavailable'); };
  await assert.rejects(detail({ params: { id: new mongoose.Types.ObjectId().toString() } }, response()), /Database unavailable/);
});
