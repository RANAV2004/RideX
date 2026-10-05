import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "rider" | "driver";
  avatar?: string;
  rating: number;
  totalRides: number;
  earnings?: number;
  vehicle?: any;
  isAvailable?: boolean;
}

interface Ride {
  _id: string;
  status: string;
  pickup: { address: string; coordinates: { lat: number; lng: number } };
  destination: { address: string; coordinates: { lat: number; lng: number } };
  fare: { total: number; baseFare: number; distanceFare: number; timeFare: number };
  rideType: string;
  rider?: any;
  driver?: any;
  otp?: string;
  distance: number;
  duration: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  activeRide: Ride | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setActiveRide: (ride: Ride | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  activeRide: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  },
  setActiveRide: (ride) => set({ activeRide: ride }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, activeRide: null });
  },
}));
