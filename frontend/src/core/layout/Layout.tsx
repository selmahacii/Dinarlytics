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
      <div className="flex min-h-screen bg-slate-50 relative">
        <Sidebar />

        {/* Main Content Area */}
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 w-full ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <Header />
          <div className="px-4 sm:px-6 pt-4 pb-2 bg-white border-b border-slate-200">
            <Breadcrumb />
          </div>
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>

        <QuickNavigation />

      </div>
    </LIAHistoryProvider>
  );
};

export default Layout;
