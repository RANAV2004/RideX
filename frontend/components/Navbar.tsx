"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Car, User, History, MessageCircle, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Car size={24} />
          RideX
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
            Dashboard
          </Link>
          <Link href="/ride/history" className="text-gray-300 hover:text-white transition-colors text-sm">
            History
          </Link>
          <Link href="/chat" className="text-gray-300 hover:text-white transition-colors text-sm">
            Support
          </Link>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <User size={16} className="text-black" />
            </div>
            <span className="text-sm font-medium">{user?.name}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors ml-2">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 flex flex-col gap-4">
          <Link href="/dashboard" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/ride/history" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>History</Link>
          <Link href="/chat" className="text-gray-300 hover:text-white" onClick={() => setOpen(false)}>Support</Link>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left">Logout</button>
        </div>
      )}
    </nav>
  );
}
