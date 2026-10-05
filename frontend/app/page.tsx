"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="text-white text-4xl font-bold mb-4">RideX</div>
        <div className="text-gray-400">Loading...</div>
      </div>
    </div>
  );
}
