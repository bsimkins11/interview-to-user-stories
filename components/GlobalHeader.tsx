"use client";

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface GlobalHeaderProps {
  onHomeClick: () => void;
}

export function GlobalHeader({ onHomeClick }: GlobalHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Actual Transparent Partners logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/Transparent-Partners-RGB-Logos_Primary (3).png"
              alt="Transparent Partners"
              className="h-8 w-auto"
            />
          </button>
          
          {/* Home Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onHomeClick}
            className="border-gray-300 text-gray-700 hover:bg-blue-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </header>
  );
}
