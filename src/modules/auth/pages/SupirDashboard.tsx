"use client";

import React from "react";


import { Button } from "@/components/ui/Button";
import { useAuth } from "@/modules/auth";

const SupirDashboard: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-sand">
        <span className="font-serif text-xl text-forest">MySawit</span>
        <Button
          variant="ghost"
          onClick={logout}
          className="hover:bg-error/10 hover:text-error active:bg-error/20 transition-colors"
        >
          Logout
        </Button>
      </nav>
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="font-serif text-3xl text-forest mb-4">Supir Dashboard</h1>
        <p className="text-text-mid">Stat cards and delivery info go here.</p>
      </main>
    </div>
  );
};

export default SupirDashboard;
