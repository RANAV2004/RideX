"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rideAPI, userAPI } from "@/lib/api";
import { useStore } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import {
  ToggleLeft, ToggleRight, DollarSign, Star, Car, MapPin,
  Navigation, Clock, ChevronRight, CheckCircle
} from "lucide-react";

export default function DriverDashboard() {
  const { user, setUser, setActiveRide } = useStore();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);

  useEffect(() => {
    if (isAvailable) {
      fetchPendingRides();
      const interval = setInterval(fetchPendingRides, 5000);
      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("new_ride_request", (ride: any) => {
      setPendingRides((prev) => {
        if (prev.find((r) => r._id === ride._id)) return prev;
        return [ride, ...prev];
      });
    });
    return () => { socket.off("new_ride_request"); };
  }, []);

  const fetchPendingRides = async () => {
    try {
      const { data } = await rideAPI.getPending();
      setPendingRides(data);
    } catch {}
  };

  const toggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    try {
      const { data } = await userAPI.toggleAvailability(newVal);
      setUser(data);
    } catch {}
  };

  const acceptRide = async (rideId: string) => {
    setAccepting(rideId);
    try {
      const { data } = await rideAPI.accept(rideId);
      setActiveRide(data);
      router.push(`/ride/${rideId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not accept ride");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-gray-500">Hello, {user?.name?.split(" ")[0]}!</p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            isAvailable ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          {isAvailable ? (
            <><ToggleRight size={22} /> Online</>
          ) : (
            <><ToggleLeft size={22} /> Offline</>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center">
              <DollarSign className="mx-auto mb-2 text-green-500" size={24} />
              <div className="text-2xl font-bold">${user?.earnings?.toFixed(2) || "0.00"}</div>
              <div className="text-xs text-gray-500">Total Earned</div>
            </div>
            <div className="card text-center">
              <Star className="mx-auto mb-2 text-yellow-400" size={24} />
              <div className="text-2xl font-bold">{user?.rating?.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="card text-center">
              <Car className="mx-auto mb-2 text-gray-400" size={24} />
              <div className="text-2xl font-bold">{user?.totalRides}</div>
              <div className="text-xs text-gray-500">Total Trips</div>
            </div>
            <div className="card text-center">
              <Clock className="mx-auto mb-2 text-gray-400" size={24} />
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-gray-500">Hrs Online</div>
            </div>
          </div>

          {/* Vehicle info */}
          {user?.vehicle && (
            <div className="card">
              <h3 className="font-semibold mb-3">Your Vehicle</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-medium">{user.vehicle.year} {user.vehicle.make} {user.vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plate</span>
                  <span className="font-mono font-bold">{user.vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color</span>
                  <span className="font-medium">{user.vehicle.color}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending Rides */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {isAvailable ? "Nearby Ride Requests" : "Go online to see requests"}
            </h2>
            {isAvailable && (
              <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
          </div>

          {!isAvailable ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Car size={48} className="text-gray-300 mb-4" />
              <h3 className="text-gray-500 font-medium">You are currently offline</h3>
              <p className="text-gray-400 text-sm mt-1">Toggle the switch above to start accepting rides</p>
            </div>
          ) : pendingRides.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <MapPin size={48} className="text-gray-300 mb-4" />
              <h3 className="text-gray-500 font-medium">No rides nearby</h3>
              <p className="text-gray-400 text-sm mt-1">New requests will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRides.map((ride) => (
                <div key={ride._id} className="card border-2 border-gray-100 hover:border-black transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
                          {ride.rider?.name?.[0] || "?"}
                        </div>
                        <span className="font-semibold">{ride.rider?.name || "Rider"}</span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Star size={12} className="text-yellow-400" />
                          {ride.rider?.rating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${ride.fare?.total}</div>
                      <div className="text-xs text-gray-500 capitalize">{ride.rideType}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-black mt-1 shrink-0"></div>
                      <span className="text-gray-700">{ride.pickup?.address}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Navigation size={14} className="text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{ride.destination?.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{ride.distance} km</span>
                      <span>{ride.duration} min</span>
                    </div>
                    <button
                      onClick={() => acceptRide(ride._id)}
                      disabled={accepting === ride._id}
                      className="btn-primary flex items-center gap-2 py-2"
                    >
                      <CheckCircle size={16} />
                      {accepting === ride._id ? "Accepting..." : "Accept"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
