'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function NavLink({ href, children, className = '' }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  const baseClasses = 'text-gray-600 hover:text-gray-900 transition-colors';
  const activeClasses = isActive ? 'text-blue-600 font-medium' : '';
  const combinedClasses = `${baseClasses} ${activeClasses} ${className}`.trim();

  if (href.startsWith('http')) {
    return (
      <a 
        href={href}
        className={combinedClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={combinedClasses}>
      {children}
    </Link>
  );
} 