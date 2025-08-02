"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Activity,
  ClipboardPlus,
  LogOut,
  MenuIcon,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/lib/utils";

// Type utilisateur
type User = {
  id: number;
  email: string;
  username: string;
};

export default function NavBar() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [user, setUser] = useState<User | null>(null);

  // Récupération du user connecté via /me
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("Not authenticated");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {isDesktop ? (
        <div
          className="flex justify-between items-center"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "0px 40px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            <Link
              className="nav-link"
              href="/"
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              ECG ANALYZER
            </Link>
          </div>

          <div className="flex justify-center gap-4 p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              <Link
                className="hover:text-gray-700"
                href="/admin/doctors"
                style={{ fontSize: "20px" }}
              >
                Doctors
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <Link
                className="hover:text-gray-700"
                href="/admin/patients"
                style={{ fontSize: "20px" }}
              >
                Patients
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardPlus className="w-5 h-5" />
              <Link
                className="hover:text-gray-700"
                href="/admin/ecg_records"
                style={{ fontSize: "20px" }}
              >
                ECG Records
              </Link>
            </div>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/images/icon.jpg" />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-md font-medium">{user.username}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Drawer direction="right">
            <DrawerTrigger>
              <div className="p-5">
                <MenuIcon />
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle
                  className="flex flex-row font-bold gap-2"
                  style={{ fontSize: "23px" }}
                >
                  <Activity className="w-8 h-8" /> ECG ANALYZER
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 flex flex-col gap-6 mt-8">
                <div className="flex flex-row gap-2">
                  <Stethoscope className="w-5 h-5 mt-1" />
                  <Link
                    className="nav-link"
                    href="/admin/doctors"
                    style={{ fontSize: "20px" }}
                  >
                    Doctors
                  </Link>
                </div>
                <div className="flex flex-row gap-2">
                  <Users className="w-5 h-5 mt-1" />
                  <Link
                    className="nav-link"
                    href="/admin/patients"
                    style={{ fontSize: "20px" }}
                  >
                    Patients
                  </Link>
                </div>
                <div className="flex flex-row gap-2">
                  <ClipboardPlus className="w-5 h-5 mt-1" />
                  <Link
                    className="nav-link"
                    href="/admin/ecg_records"
                    style={{ fontSize: "20px" }}
                  >
                    ECG Records
                  </Link>
                </div>
              </div>
              <div className="flex items-center ml-4 mt-65 gap-2">
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/images/icon.jpg" />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-md font-medium">{user.username}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </div>
  );
}
