const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Club = require('../models/Club');
const router = require('../routes/events');

const list = router.stack.find(layer => layer.route?.path === '/').route.stack[0].handle;
const detail = router.stack.find(layer => layer.route?.path === '/:id').route.stack[0].handle;
const create = router.stack.find(layer => layer.route?.path === '/' && layer.route.methods.post).route.stack.at(-1).handle;
const update = router.stack.find(layer => layer.route?.path === '/:id' && layer.route.methods.patch).route.stack.at(-1).handle;
const remove = router.stack.find(layer => layer.route?.path === '/:id' && layer.route.methods.delete).route.stack.at(-1).handle;
const originalFind = Event.collection.find;
const originalFindOne = Event.collection.findOne;
const originalClubFind = Club.collection.find;
const originalCreate = Event.create;
const originalEventFindById = Event.findById;
const originalClubFindById = Club.findById;

after(() => {
  Event.collection.find = originalFind;
  Event.collection.findOne = originalFindOne;
  Club.collection.find = originalClubFind;
  Event.create = originalCreate;
  Event.findById = originalEventFindById;
  Club.findById = originalClubFindById;
});

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = JSON.parse(JSON.stringify(value)); return this; },
    end() { this.ended = true; return this; },
  };
}

function clubLookup(officers) {
  return id => ({
    select: async fields => {
      assert.equal(fields, 'officers');
      return id ? { officers } : null;
    },
  });
}

function mutableEvent(eventId, hostClubId) {
  return {
    _id: eventId,
    hostClub: hostClubId,
    set(values) { Object.assign(this, values); },
    async save() {},
    async populate(path, projection) {
      assert.equal(path, 'hostClub');
      assert.equal(projection, '_id name campus');
      this.hostClub = { _id: hostClubId, name: 'Tech Club', campus: 'Hunter' };
    },
    async deleteOne() { this.deleted = true; },
  };
}

test('list applies upcoming, campus, category, NY calendar day, and ascending sort', async () => {
  Event.collection.find = (filter, options) => {
    assert.equal(filter.campus, 'Hunter');
    assert.equal(filter.category, 'Tech');
    assert.equal(filter.dateTime.$gte.toISOString(), '2099-11-05T05:00:00.000Z');
    assert.equal(filter.dateTime.$lt.toISOString(), '2099-11-06T05:00:00.000Z');
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
    assert.equal(filter.dateTime.$lt.toISOString(), '2000-01-02T05:00:00.000Z');
    return { toArray: async () => [] };
  };
  await list({ query: { date: '2000-01-01' } }, response());
});

test('NY day boundary uses DST offset', async () => {
  Event.collection.find = filter => {
    assert.equal(filter.dateTime.$gte.toISOString(), '2099-07-05T04:00:00.000Z');
    assert.equal(filter.dateTime.$lt.toISOString(), '2099-07-06T04:00:00.000Z');
    return { toArray: async () => [] };
  };
  await list({ query: { date: '2099-07-05' } }, response());
});

test('a 7:30 PM NY event stays on its calendar date with midnight-to-midnight boundaries', async () => {
  const event = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Evening event',
    dateTime: new Date('2026-11-25T00:30:00.000Z'),
  };
  Event.collection.find = filter => {
    const matches = event.dateTime >= filter.dateTime.$gte
      && event.dateTime < filter.dateTime.$lt;
    return { toArray: async () => (matches ? [event] : []) };
  };

  const tuesday = response();
  await list({ query: { date: '2026-11-24' } }, tuesday);
  assert.equal(tuesday.body.length, 1);
  assert.equal(tuesday.body[0].dateTime, '2026-11-25T00:30:00.000Z');

  const wednesday = response();
  await list({ query: { date: '2026-11-25' } }, wednesday);
  assert.deepEqual(wednesday.body, []);
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

test('officer can create a future event and receives populated host club details', async () => {
  const userId = new mongoose.Types.ObjectId();
  const clubId = new mongoose.Types.ObjectId();
  Club.findById = clubLookup([userId]);
  Event.create = async values => {
    assert.equal(values.title, 'Tech meetup');
    assert.equal(values.description, 'Networking');
    assert.equal(values.location, 'Room 1');
    assert.equal(values.campus, 'Hunter');
    assert.equal(values.category, 'Tech');
    assert.equal(values.hostClub.toString(), clubId.toString());
    assert.equal(values.dateTime.toISOString(), '2099-11-05T18:00:00.000Z');
    return mutableEvent(new mongoose.Types.ObjectId(), clubId);
  };

  const res = response();
  await create({
    user: { _id: userId },
    body: {
      title: 'Tech meetup',
      description: 'Networking',
      dateTime: '2099-11-05T18:00:00.000Z',
      location: 'Room 1',
      campus: 'Hunter',
      category: 'Tech',
      hostClub: clubId.toString(),
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body.hostClub, {
    _id: clubId.toString(),
    name: 'Tech Club',
    campus: 'Hunter',
  });
});

test('event creation rejects past dates and non-officers without creating an event', async () => {
  const userId = new mongoose.Types.ObjectId();
  const clubId = new mongoose.Types.ObjectId();
  const body = {
    title: 'Tech meetup',
    dateTime: '2099-11-05T18:00:00.000Z',
    hostClub: clubId.toString(),
  };
  Event.create = async () => assert.fail('event should not be created');

  Club.findById = clubLookup([]);
  const forbidden = response();
  await create({ user: { _id: userId }, body }, forbidden);
  assert.equal(forbidden.statusCode, 403);

  Club.findById = clubLookup([userId]);
  const invalidDate = response();
  await create({ user: { _id: userId }, body: { ...body, dateTime: '2000-01-01T00:00:00.000Z' } }, invalidDate);
  assert.equal(invalidDate.statusCode, 400);
});

test('host club officer can patch event fields but cannot transfer the event', async () => {
  const userId = new mongoose.Types.ObjectId();
  const clubId = new mongoose.Types.ObjectId();
  const eventId = new mongoose.Types.ObjectId();
  Club.findById = clubLookup([userId]);
  const event = mutableEvent(eventId, clubId);
  Event.findById = async id => {
    assert.equal(id, eventId.toString());
    return event;
  };

  const res = response();
  await update({
    params: { id: eventId.toString() },
    user: { _id: userId },
    body: { title: 'Updated meetup' },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.title, 'Updated meetup');
  assert.deepEqual(res.body.hostClub, {
    _id: clubId.toString(),
    name: 'Tech Club',
    campus: 'Hunter',
  });

  const transfer = response();
  await update({
    params: { id: eventId.toString() },
    user: { _id: userId },
    body: { hostClub: new mongoose.Types.ObjectId().toString() },
  }, transfer);
  assert.equal(transfer.statusCode, 400);
});

test('only the host club officer can delete an event', async () => {
  const userId = new mongoose.Types.ObjectId();
  const clubId = new mongoose.Types.ObjectId();
  const eventId = new mongoose.Types.ObjectId();
  Club.findById = clubLookup([]);
  const event = mutableEvent(eventId, clubId);
  Event.findById = async () => event;

  const res = response();
  await remove({ params: { id: eventId.toString() }, user: { _id: userId } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(event.deleted, undefined);

  Club.findById = clubLookup([userId]);
  const deleted = response();
  await remove({ params: { id: eventId.toString() }, user: { _id: userId } }, deleted);
  assert.equal(deleted.statusCode, 204);
  assert.equal(deleted.ended, true);
  assert.equal(event.deleted, true);
});
