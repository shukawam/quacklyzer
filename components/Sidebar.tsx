'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AnalyzerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const ComparerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-4h.01M12 12h.01M16 16h.01M21 21l-6-6" />
    </svg>
);

const navItems = [
  { name: 'Analyzer', href: '/analyzer', icon: <AnalyzerIcon /> },
  { name: 'Comparer', href: '/comparer', icon: <ComparerIcon /> },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white p-5 flex flex-col">
      <div className="text-2xl font-bold mb-10 text-gray-100">Quacklyzer 🦆</div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname.startsWith(item.href) ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                  {item.icon}
                  <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-xs text-gray-500">v1.0.0</div>
    </aside>
  );
};

export default Sidebar;
