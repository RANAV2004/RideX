"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { authAPI, rideAPI, userAPI } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import RiderDashboard from "@/components/RiderDashboard";
import DriverDashboard from "@/components/DriverDashboard";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, token } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        router.replace("/auth/login");
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data);
        // Connect socket
        connectSocket(data._id, data.role);
      } catch {
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {user.role === "rider" ? <RiderDashboard /> : <DriverDashboard />}
    </div>
  );
}
