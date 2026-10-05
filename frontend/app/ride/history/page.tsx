"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rideAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Car, MapPin, Navigation, DollarSign, Clock, Star, ArrowLeft } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  in_progress: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function RideHistoryPage() {
  const router = useRouter();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await rideAPI.getMyRides();
        setRides(data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-black">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Ride History</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="card text-center py-16">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-500 font-medium">No rides yet</h3>
            <p className="text-gray-400 text-sm">Your completed rides will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`status-badge ${STATUS_COLORS[ride.status] || "bg-gray-100 text-gray-700"}`}>
                      {ride.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${ride.fare?.total}</div>
                    <div className="text-xs text-gray-500 capitalize">{ride.rideType}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0"></div>
                    <span className="text-gray-600">{ride.pickup?.address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Navigation size={13} className="text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-gray-600">{ride.destination?.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Clock size={12} />{ride.duration} min</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{ride.distance} km</span>
                  {ride.driverRating && (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400" /> {ride.driverRating}
                    </span>
                  )}
                  <span className="ml-auto">{new Date(ride.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
