/*
  Admin routes for CUNY-Connect.
  This file lets admins see clubs waiting for approval and approve them.
  Owner: Person 2
  TODO: Implement each route. The pending list returns unapproved clubs, newest first.
  Approving sets the club's approved flag to true, or returns 404 when the club does not exist.
  Decide with Person 1 whether approving a club also promotes its officers' role to officer.
*/
const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const notImplemented = require('../utils/notImplemented');

const router = express.Router();

// Every route here is admin-only, so the checks run once for the whole router instead of on each route.
router.use(protect, requireRole('admin'));

// These paths are relative to /api/admin, where index.js mounts this router.
router.get('/clubs/pending', notImplemented);

router.patch('/clubs/:id/approve', notImplemented);

module.exports = router;
