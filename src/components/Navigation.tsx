import { Package, Github } from 'lucide-react';
import { NavLink } from './NavLink';

export default function Navigation() {
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
            {/* <NavLink href="/about">About</NavLink> */}
            <NavLink href="/monitor-companies">Monitor Companies</NavLink>
           {/*  <NavLink href="/analytics">Analytics</NavLink> */}
            <NavLink href="https://github.com/yourusername/govspend">
              <Github className="h-5 w-5" />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
} 