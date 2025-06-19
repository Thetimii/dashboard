'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/users', label: 'Users' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Theme Toggle at Bottom */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
