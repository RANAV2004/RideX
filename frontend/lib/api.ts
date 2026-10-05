import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

// ---- AUTH ----
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateLocation: (lat: number, lng: number) =>
    api.put("/auth/update-location", { lat, lng }),
};

// ---- RIDES ----
export const rideAPI = {
  estimate: (data: any) => api.post("/rides/estimate", data),
  request: (data: any) => api.post("/rides/request", data),
  getMyRides: () => api.get("/rides/my-rides"),
  getActive: () => api.get("/rides/active"),
  getPending: () => api.get("/rides/pending"),
  accept: (id: string) => api.put(`/rides/${id}/accept`),
  updateStatus: (id: string, status: string) =>
    api.put(`/rides/${id}/status`, { status }),
  cancel: (id: string) => api.put(`/rides/${id}/cancel`),
  rate: (id: string, rating: number) => api.post(`/rides/${id}/rate`, { rating }),
};

// ---- USERS ----
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.put("/users/profile", data),
  toggleAvailability: (isAvailable: boolean) =>
    api.put("/users/availability", { isAvailable }),
  getNearbyDrivers: (lat: number, lng: number) =>
    api.get(`/users/nearby-drivers?lat=${lat}&lng=${lng}`),
};

// ---- CHAT ----
export const chatAPI = {
  getMessages: (rideId: string) => api.get(`/chat/${rideId}/messages`),
  sendMessage: (rideId: string, content: string) =>
    api.post(`/chat/${rideId}/message`, { content }),
  askBot: (message: string) => api.post("/chat/bot", { message }),
};

export default api;
