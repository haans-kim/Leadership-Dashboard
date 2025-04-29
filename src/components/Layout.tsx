import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 text-xl font-bold">Leadership Dashboard</div>
        <nav className="p-4">
          <Link to="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-200">Dashboard</Link>
          <Link to="/admin-dashboard" className="block py-2 px-3 rounded hover:bg-gray-200">Admin Dashboard</Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-semibold">대시보드</h1>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 