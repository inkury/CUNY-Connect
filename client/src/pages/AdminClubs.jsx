/*
  AdminClubs page for CUNY-Connect, shown at /admin.
  This page lets admins approve clubs that students have requested.
  Owner: Person 2
  TODO: Fetch GET /admin/clubs/pending and show each club with an approve button that calls PATCH
  /admin/clubs/:id/approve and then removes it from the list. Show an empty state when nothing is
  pending.
*/

/**
 * Renders the list of clubs waiting for approval.
 *
 * @returns {JSX.Element} The page heading for now.
 */
export default function AdminClubs() {
  return <h1>AdminClubs</h1>;
}
