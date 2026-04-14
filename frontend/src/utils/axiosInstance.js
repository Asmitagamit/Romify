// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000/api"
// });

// axiosInstance.interceptors.response.use(
//   response => response,
//   async error => {

//     if (error.response.status === 401) {

//       const refreshToken = localStorage.getItem("refreshToken");

//       const res = await axios.post(
//         "http://localhost:5000/api/auth/refresh",
//         { refreshToken }
//       );

//       localStorage.setItem("token", res.data.accessToken);

//       error.config.headers.Authorization =
//         "Bearer " + res.data.accessToken;

//       return axios(error.config);
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api"
});

// 🔁 Request interceptor (attach token)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔁 Response interceptor (handle expiry)
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        // Save new token
        localStorage.setItem("token", newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);

      } catch (err) {
        console.error("Token refresh failed:", err);
        // ❌ Refresh failed → logout
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;