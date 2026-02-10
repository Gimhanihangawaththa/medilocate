import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;




// import axios from 'axios';

// // Determine the API base URL based on environment
// let API_BASE_URL;

// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//   API_BASE_URL = 'http://localhost:4000';
// } else if (window.location.hostname === 'frontend' || window.location.hostname.includes('backend')) {
//   API_BASE_URL = 'http://backend:4000';
// } else {
//   API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.250.123.241:4000';
// }

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add Authorization header if token exists
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;







// import axios from 'axios';

// const API_BASE_URL =
//   process.env.REACT_APP_API_URL || 'http://13.250.123.241:4000';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
