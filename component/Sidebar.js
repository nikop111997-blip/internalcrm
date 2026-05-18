"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowRightLeft,
  PlusCircle,
  Settings,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  LogOutIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on login page
  if (pathname === "/login") {
    return null;
  }

  // Added href properties for Next.js routing
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { type: "divider" },
    { name: "Students", icon: ArrowRightLeft, href: "/students" },
    { name: "Add Students", icon: PlusCircle, href: "/add-student" },
    { name: "Trainers", icon: Settings, href: "/trainers" },
  ];

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? "80px" : "280px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-[90vh] flex flex-col justify-between py-6 rounded-2xl mx-4 my-8 shadow-2xl relative"
      style={{ backgroundColor: "#002C54", color: "#FDF6F6" }}
    >
      {/* Top Section: Logo */}
      <div className="flex items-center justify-between px-4 py-4 mb-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="min-w-[42px] h-[42px] rounded-2xl bg-gradient-to-br from-[#001D3D] to-[#003566] shadow-md flex items-center justify-center"
          >
            <Zap size={20} className="text-[#FFD60A]" fill="#FFD60A" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="text-[17px] font-semibold tracking-tight text-white whitespace-nowrap">
                  Internal CRM
                </span>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  Management Panel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-10 w-10 rounded-xl border border-white/5 bg-white/5 hover:bg-[#001D3D] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </motion.button>
      </div>

      {/* Middle Section: Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-1 custom-scrollbar">
        {navItems.map((item, index) => {
          if (item.type === "divider") {
            return <div key={`div-${index}`} className="h-4" />;
          }

          // Active state is now based on the current URL
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors duration-200 group ${
                isActive ? "bg-[#C5001A]" : "hover:bg-[#001D3D]"
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-[#FDF6F6]"
                      : "text-gray-400 group-hover:text-[#FDF6F6]"
                  }
                />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section: Socials / Actions */}
      <div
        className={`px-4 mt-6 flex ${
          isCollapsed ? "justify-center flex-col space-y-3" : "justify-around"
        } items-center`}
      >
        <button
          onClick={() => signOut()}
          className="border border-gray-200 bg-[#FDF6F6] text-black text-sm w-full flex items-center gap-2 justify-center rounded-xl py-3 cursor-pointer"
        >
          {!isCollapsed && <span>Log Out</span>}
          <LogOutIcon size={15} />
        </button>
      </div>
    </motion.div>
  );
}