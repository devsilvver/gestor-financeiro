import React from 'react';
import LogoIcon from './icons/LogoIcon';
import DashboardIcon from './icons/DashboardIcon';
import TransactionIcon from './icons/TransactionIcon';
import InvestmentIcon from './icons/InvestmentIcon';

type View = 'dashboard' | 'transactions' | 'investments';

interface SidebarProps {
  setView: (view: View) => void;
  activeView: View;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setView, activeView, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'transactions', label: 'Transações', icon: TransactionIcon },
    { id: 'investments', label: 'Investimentos', icon: InvestmentIcon },
  ];

  const getNavItemClasses = (id: View) => {
    const baseClasses = 'flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 cursor-pointer';
    return activeView === id ? `${baseClasses} bg-gray-900 text-white` : baseClasses;
  };
  
  const sidebarClasses = `
    flex flex-col w-64 bg-brand-dark text-white transition-transform duration-300 ease-in-out
    fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
        {/* Overlay for mobile */}
        {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={onClose}></div>}
        
        <aside className={sidebarClasses}>
          <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0">
            <LogoIcon className="w-8 h-8 text-brand-primary" />
            <span className="ml-3 text-xl font-bold">Financeiro</span>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map(item => (
                <li key={item.id}>
                  <a onClick={() => setView(item.id as View)} className={getNavItemClasses(item.id as View)}>
                    <item.icon className="w-6 h-6 mr-3" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="px-4 py-4 border-t border-gray-700 text-center text-xs text-gray-500 flex-shrink-0">
            <p>&copy; {new Date().getFullYear()} Guilherme Silvestrini</p>
          </div>
        </aside>
    </>
  );
};

export default Sidebar;