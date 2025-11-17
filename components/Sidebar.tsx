
import React, { useRef } from 'react';
import LogoIcon from './icons/LogoIcon';
import DashboardIcon from './icons/DashboardIcon';
import TransactionIcon from './icons/TransactionIcon';
import InvestmentIcon from './icons/InvestmentIcon';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';

type View = 'dashboard' | 'transactions' | 'investments';

interface SidebarProps {
  setView: (view: View) => void;
  activeView: View;
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setView, activeView, isOpen, onClose, onExport, onImport }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'transactions', label: 'Transações', icon: TransactionIcon },
    { id: 'investments', label: 'Investimentos', icon: InvestmentIcon },
  ];

  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    if (importInputRef.current) {
        importInputRef.current.value = '';
    }
  };

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
            <div className="mt-8 pt-4 border-t border-gray-700">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados</h3>
              <ul className="space-y-2 mt-2">
                  <li>
                      <a onClick={handleImportClick} className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 cursor-pointer">
                          <UploadIcon className="w-6 h-6 mr-3"/>
                          <span>Importar Dados</span>
                      </a>
                      <input
                          type="file"
                          ref={importInputRef}
                          onChange={handleFileChange}
                          accept=".json"
                          className="hidden"
                      />
                  </li>
                  <li>
                      <a onClick={onExport} className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 cursor-pointer">
                          <DownloadIcon className="w-6 h-6 mr-3"/>
                          <span>Exportar Dados</span>
                      </a>
                  </li>
              </ul>
            </div>
          </nav>
          <div className="px-4 py-4 border-t border-gray-700 text-center text-xs text-gray-500 flex-shrink-0">
            <p>&copy; {new Date().getFullYear()} Guilherme Silvestrini</p>
          </div>
        </aside>
    </>
  );
};

export default Sidebar;
