import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import QuickNavigation from './QuickNavigation';
import LIAFloatingWidget from '@shared/components/AI/LIAFloatingWidget';
import { useApp } from '@core/context/AppContext';
import { LIAHistoryProvider } from '@shared/components/AI/LIAHistoryProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarCollapsed, user } = useApp();

  return (
    <LIAHistoryProvider userId={user?.id || 'default'}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
          <Header />
          <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-200">
            <Breadcrumb />
          </div>
          <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>
        <QuickNavigation />
        <LIAFloatingWidget />
      </div>
    </LIAHistoryProvider>
  );
};

export default Layout;
