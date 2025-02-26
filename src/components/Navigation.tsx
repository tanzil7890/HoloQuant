'use client';

import { useState } from 'react';
import { Package, Github, ChevronDown } from 'lucide-react';
import { NavLink } from './NavLink';

export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <NavLink href="/">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold">GovSpend</span>
              </div>
            </NavLink>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>Datasets</span>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <NavLink 
                    href="/govt-spending" 
                    className="block px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    Government Spending Tracker
                  </NavLink>
                  <NavLink 
                    href="/monitor-companies" 
                    className="block px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    Monitor Companies
                  </NavLink>
                </div>
              )}
            </div>
            <NavLink href="https://github.com/yourusername/govspend">
              <Github className="h-5 w-5" />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
} 