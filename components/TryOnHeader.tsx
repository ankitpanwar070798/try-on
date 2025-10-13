"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/client";
import { signOut } from "@/lib/auth";
import { User, LogOut, Crown, DoorOpen } from "lucide-react";
import Link from "next/link";

interface UserData {
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
}

export default function TryOnHeader() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as UserData);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  return (
    <header className="bg-white backdrop-blur-lg shadow-lg px-6 py-2">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Link href="/"  >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TryOn AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Virtual Try-On Studio</p>
            </div>
          </div>
          </Link>
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 cursor-pointer  rounded-lg p-2 transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
              {getUserAvatar() ? (
                <Image
                  src={getUserAvatar()!}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>

              {/* <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Add settings navigation if needed
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button> */}

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                disabled={loading}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}