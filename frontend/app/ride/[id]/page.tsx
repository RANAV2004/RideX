"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { rideAPI, chatAPI } from "@/lib/api";
import { useStore } from "@/lib/store";
import { getSocket } from "@/lib/socket";
import {
  MapPin, Navigation, Phone, MessageCircle, Star,
  CheckCircle, XCircle, ArrowLeft, Clock, DollarSign, Shield
} from "lucide-react";

const STATUS_STEPS = ["accepted", "en_route", "arrived", "in_progress", "completed"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Finding driver...",
  accepted: "Driver assigned",
  en_route: "Driver is on the way",
  arrived: "Driver has arrived",
  in_progress: "Ride in progress",
  completed: "Ride completed",
  cancelled: "Ride cancelled",
};

export default function ActiveRidePage() {
  const params = useParams();
  const router = useRouter();
  const { user, setActiveRide } = useStore();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const { data } = await rideAPI.getActive();
        if (data) setRide(data);
        else {
          // Try fetching from history
          setLoading(false);
        }
      } catch {}
      setLoading(false);
    };
    fetchRide();

    const socket = getSocket();
    socket.emit("join_ride", { rideId: params.id });

    socket.on("ride_status_updated", (updatedRide: any) => {
      setRide(updatedRide);
      if (updatedRide.status === "completed") setActiveRide(null);
    });
    socket.on("ride_accepted", (updatedRide: any) => setRide(updatedRide));
    socket.on("ride_cancelled", () => {
      setActiveRide(null);
      router.push("/dashboard");
    });
    socket.on("new_message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("ride_status_updated");
      socket.off("ride_accepted");
      socket.off("ride_cancelled");
      socket.off("new_message");
    };
  }, [params.id]);

  const updateStatus = async (status: string) => {
    try {
      const { data } = await rideAPI.updateStatus(params.id as string, status);
      setRide(data);
    } catch {}
  };

  const cancelRide = async () => {
    if (!confirm("Cancel this ride?")) return;
    await rideAPI.cancel(params.id as string);
    setActiveRide(null);
    router.push("/dashboard");
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      const { data } = await chatAPI.sendMessage(params.id as string, newMsg);
      setMessages((prev) => [...prev, data]);
      setNewMsg("");
    } catch {}
  };

  const loadMessages = async () => {
    setChatOpen(true);
    try {
      const { data } = await chatAPI.getMessages(params.id as string);
      setMessages(data);
    } catch {}
  };

  const submitRating = async () => {
    if (rating === 0) return;
    await rideAPI.rate(params.id as string, rating);
    setRated(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">Ride not found</p>
        <button onClick={() => router.push("/dashboard")} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isDriver = user?.role === "driver";
  const otherPerson = isDriver ? ride.rider : ride.driver;
  const currentStepIndex = STATUS_STEPS.indexOf(ride.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
        <ArrowLeft size={18} /> Back
      </button>

      {/* Status Banner */}
      <div className={`rounded-2xl p-5 mb-6 text-white ${
        ride.status === "completed" ? "bg-green-500" :
        ride.status === "cancelled" ? "bg-red-500" :
        ride.status === "in_progress" ? "bg-blue-600" : "bg-black"
      }`}>
        <div className="text-sm font-medium opacity-80 mb-1">Status</div>
        <div className="text-2xl font-bold">{STATUS_LABELS[ride.status]}</div>
        {ride.status === "pending" && (
          <div className="flex items-center gap-2 mt-2 text-sm opacity-80">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Connecting you with a driver...
          </div>
        )}
        {ride.status === "arrived" && ride.otp && isDriver && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-block">
            <div className="text-xs opacity-70">Rider OTP</div>
            <div className="text-3xl font-mono font-bold tracking-widest">{ride.otp}</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!["cancelled", "pending"].includes(ride.status) && (
        <div className="card mb-6">
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  i <= currentStepIndex ? "bg-black" : "bg-gray-200"
                }`}></div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-1 flex-1 ${i < currentStepIndex ? "bg-black" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_STEPS.map((s) => (
              <div key={s} className="text-xs text-gray-400 capitalize">{s.replace("_", " ")}</div>
            ))}
          </div>
        </div>
      )}

      {/* Ride Details */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Trip Details</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-black mt-1"></div>
            <div>
              <div className="text-xs text-gray-500">Pickup</div>
              <div className="font-medium text-sm">{ride.pickup?.address}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Navigation size={14} className="text-blue-600 mt-1 shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Destination</div>
              <div className="font-medium text-sm">{ride.destination?.address}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            {ride.duration} min
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={14} />
            {ride.distance} km
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <DollarSign size={14} className="text-green-500" />
            ${ride.fare?.total}
          </div>
        </div>
      </div>

      {/* Driver/Rider Info */}
      {otherPerson && (
        <div className="card mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold">
              {otherPerson.name?.[0] || "?"}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{otherPerson.name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star size={12} className="text-yellow-400" />
                {otherPerson.rating?.toFixed(1)}
              </div>
              {!isDriver && otherPerson.vehicle && (
                <div className="text-sm text-gray-500 mt-1">
                  {otherPerson.vehicle.color} {otherPerson.vehicle.make} {otherPerson.vehicle.model} · {otherPerson.vehicle.licensePlate}
                </div>
              )}
            </div>
            <button onClick={loadMessages} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
              <MessageCircle size={16} />
              Chat
            </button>
          </div>
        </div>
      )}

      {/* Driver Actions */}
      {isDriver && ride.status !== "completed" && ride.status !== "cancelled" && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Driver Controls</h3>
          <div className="flex flex-wrap gap-3">
            {ride.status === "accepted" && (
              <button onClick={() => updateStatus("en_route")} className="btn-primary flex-1">
                Start Driving
              </button>
            )}
            {ride.status === "en_route" && (
              <button onClick={() => updateStatus("arrived")} className="btn-primary flex-1">
                I've Arrived
              </button>
            )}
            {ride.status === "arrived" && (
              <button onClick={() => updateStatus("in_progress")} className="btn-primary flex-1">
                Begin Ride
              </button>
            )}
            {ride.status === "in_progress" && (
              <button onClick={() => updateStatus("completed")} className="btn-primary flex-1 bg-green-500 hover:bg-green-600">
                <CheckCircle size={16} className="inline mr-2" />
                Complete Ride
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cancel button */}
      {!isDriver && ["pending", "accepted"].includes(ride.status) && (
        <button onClick={cancelRide} className="btn-secondary w-full mb-4 flex items-center justify-center gap-2 text-red-500">
          <XCircle size={16} />
          Cancel Ride
        </button>
      )}

      {/* Rating */}
      {ride.status === "completed" && !rated && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Rate your {isDriver ? "rider" : "driver"}</h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)}>
                <Star size={32} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              </button>
            ))}
          </div>
          <button onClick={submitRating} disabled={rating === 0} className="btn-primary">
            Submit Rating
          </button>
        </div>
      )}
      {rated && (
        <div className="card mb-4 text-center text-green-600 font-medium">
          <CheckCircle className="mx-auto mb-2" />
          Thanks for your rating!
        </div>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div className="card">
          <h3 className="font-semibold mb-3">Chat</h3>
          <div className="h-48 overflow-y-auto space-y-2 mb-3 bg-gray-50 rounded-xl p-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender?._id === user?._id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                    m.sender?._id === user?._id ? "bg-black text-white" : "bg-white border text-gray-800"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="input-field flex-1 py-2"
            />
            <button onClick={sendMessage} className="btn-primary py-2">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
