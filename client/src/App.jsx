/*
  Main layout and route table for the CUNY-Connect client.
  Every page in the app is registered here. Anyone who adds a page adds its route here in their PR.
  Owner: Person 1
  TODO: Person 3 adds a shared page layout and footer.
*/
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Feed from './pages/Feed.jsx';
import EventDetail from './pages/EventDetail.jsx';
import ClubProfile from './pages/ClubProfile.jsx';
import AdminClubs from './pages/AdminClubs.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import OfficerDashboard from './pages/OfficerDashboard.jsx';
import ClubEditor from './pages/ClubEditor.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Renders the navbar and the page that matches the current URL.
 *
 * @returns {JSX.Element} The app layout with every route.
 */
export default function App() {
  // Pages that need a login are wrapped in ProtectedRoute here, so each page does not have to check auth itself.
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/clubs/:id" element={<ClubProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer"
            element={
              <ProtectedRoute roles={['officer']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/club"
            element={
              <ProtectedRoute roles={['officer']}>
                <ClubEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminClubs />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
