"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rideAPI } from "@/lib/api";
import { useStore } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import {
  MapPin, Navigation, Car, DollarSign, Clock, Star,
  ChevronRight, Loader
} from "lucide-react";

const RIDE_TYPES = [
  { type: "economy", label: "Economy", icon: "🚗", desc: "Affordable everyday rides" },
  { type: "comfort", label: "Comfort", icon: "🚙", desc: "Newer cars with extra legroom" },
  { type: "xl", label: "XL", icon: "🚐", desc: "For groups up to 6" },
  { type: "luxury", label: "Luxury", icon: "🚘", desc: "Premium experience" },
];

export default function RiderDashboard() {
  const { user, activeRide, setActiveRide } = useStore();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedType, setSelectedType] = useState("economy");
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Simulate coordinates for demo
  const getCoords = (address: string) => ({
    lat: 40.7128 + (Math.random() - 0.5) * 0.1,
    lng: -74.006 + (Math.random() - 0.5) * 0.1,
  });

  useEffect(() => {
    // Check for active ride
    const checkActive = async () => {
      try {
        const { data } = await rideAPI.getActive();
        if (data) {
          setActiveRide(data);
          router.push(`/ride/${data._id}`);
        }
      } catch {}
    };
    checkActive();

    // Listen for ride events
    const socket = getSocket();
    socket.on("ride_accepted", (ride: any) => {
      setActiveRide(ride);
      router.push(`/ride/${ride._id}`);
    });
    return () => { socket.off("ride_accepted"); };
  }, []);

  const handleEstimate = async () => {
    if (!pickup || !destination) return;
    setLoading(true);
    try {
      const { data } = await rideAPI.estimate({
        pickup: { address: pickup, coordinates: getCoords(pickup) },
        destination: { address: destination, coordinates: getCoords(destination) },
      });
      setEstimates(data.estimates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setBooking(true);
    try {
      const { data } = await rideAPI.request({
        pickup: { address: pickup, coordinates: getCoords(pickup) },
        destination: { address: destination, coordinates: getCoords(destination) },
        rideType: selectedType,
        paymentMethod: "cash",
      });
      setActiveRide(data);
      router.push(`/ride/${data._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Booking Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Good to see you, {user?.name?.split(" ")[0]}! 👋</h1>
            <p className="text-gray-500">Where would you like to go?</p>
          </div>

          <div className="card space-y-4">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-black absolute left-3 top-1/2 -translate-y-1/2"></div>
              <input
                type="text"
                placeholder="Pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="input-field pl-8"
              />
            </div>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={14} />
              <input
                type="text"
                placeholder="Where to?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input-field pl-8"
              />
            </div>
            <button
              onClick={handleEstimate}
              disabled={!pickup || !destination || loading}
              className="btn-primary w-full"
            >
              {loading ? <Loader className="animate-spin mx-auto" size={20} /> : "Get Estimates"}
            </button>
          </div>

          {/* Ride Type Selection */}
          {estimates.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3">Choose your ride</h3>
              <div className="space-y-3">
                {RIDE_TYPES.map((rt) => {
                  const est = estimates.find((e) => e.type === rt.type);
                  return (
                    <div
                      key={rt.type}
                      onClick={() => setSelectedType(rt.type)}
                      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                        selectedType === rt.type ? "border-black bg-gray-50" : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-2xl">{rt.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{rt.label}</div>
                        <div className="text-xs text-gray-500">{rt.desc} · {est?.eta}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${est?.total}</div>
                        <div className="text-xs text-gray-500">{est?.distance} km</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleBook}
                disabled={booking}
                className="btn-primary w-full mt-4"
              >
                {booking ? "Booking..." : `Book ${RIDE_TYPES.find(r => r.type === selectedType)?.label}`}
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <Car className="mx-auto mb-2 text-gray-400" size={24} />
              <div className="text-2xl font-bold">{user?.totalRides}</div>
              <div className="text-xs text-gray-500">Total Rides</div>
            </div>
            <div className="card text-center">
              <Star className="mx-auto mb-2 text-yellow-400" size={24} />
              <div className="text-2xl font-bold">{user?.rating?.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Your Rating</div>
            </div>
            <div className="card text-center">
              <Clock className="mx-auto mb-2 text-gray-400" size={24} />
              <div className="text-2xl font-bold">~8</div>
              <div className="text-xs text-gray-500">Avg Wait (min)</div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="card h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 relative overflow-hidden">
            <div className="text-center text-gray-400">
              <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Live Map</p>
              <p className="text-sm">Connect Google Maps API key to enable</p>
              <p className="text-xs mt-1 text-gray-300">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/ride/history")}
              className="card hover:shadow-lg transition-shadow flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-semibold">Ride History</div>
                <div className="text-sm text-gray-500">View past trips</div>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
            <button
              onClick={() => router.push("/chat")}
              className="card hover:shadow-lg transition-shadow flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-semibold">Support Chat</div>
                <div className="text-sm text-gray-500">Talk to our bot</div>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
