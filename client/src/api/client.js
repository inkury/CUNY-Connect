/*
  Shared API client for CUNY-Connect.
  This file creates one axios instance that every page uses to call the Express API,
  for example api.get('/events', { params: { campus: 'Hunter' } }).
  Owner: Person 1
  TODO: Add a request interceptor that sends the token as "Authorization: Bearer <token>",
  and optionally a response interceptor that logs the user out on a 401.
*/
import axios from 'axios';

// The base URL comes from client/.env so the same code works locally and when deployed.
// The fallback keeps the app working if a teammate forgets to create client/.env.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default api;
