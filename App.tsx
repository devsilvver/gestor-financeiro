import React, { useState, useMemo } from 'react';
import { Transaction, Investment, TransactionType, TransactionCategory, TransactionStatus, InvestmentType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import EditTransactionModal from './components/EditTransactionModal';
import MenuIcon from './components/icons/MenuIcon';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'transactions' | 'investments'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const viewTitles = {
    dashboard: 'Dashboard',
    transactions: 'Transações',
    investments: 'Investimentos'
  };

  const updatedTransactions = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    return transactions.map(t => {
      if (t.status === TransactionStatus.PENDENTE && t.dueDate && new Date(t.dueDate) < now) {
        return { ...t, status: TransactionStatus.VENCIDO };
      }
      return t;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'status'>) => {
    let status: TransactionStatus;

    if (transaction.type === TransactionType.RECEITA) {
        status = TransactionStatus.RECEITA;
    } else { // DESPESA
        if (transaction.category === TransactionCategory.DIVIDAS && transaction.dueDate) {
            status = TransactionStatus.PENDENTE;
        } else {
            status = TransactionStatus.DESPESA;
        }
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
      status: status,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addInvestment = (investment: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: new Date().toISOString(),
    };
    setInvestments(prev => [newInvestment, ...prev]);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsEditModalOpen(false);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    let status: TransactionStatus;
    if (updatedTransaction.type === TransactionType.RECEITA) {
        status = TransactionStatus.RECEITA;
    } else {
        if (updatedTransaction.category === TransactionCategory.DIVIDAS && updatedTransaction.dueDate) {
             const now = new Date();
             now.setHours(0, 0, 0, 0);
             status = new Date(updatedTransaction.dueDate) < now ? TransactionStatus.VENCIDO : TransactionStatus.PENDENTE;
        } else {
            status = TransactionStatus.DESPESA;
        }
    }

    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? { ...updatedTransaction, status } : t));
    handleCloseModal();
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const handleSetView = (newView: 'dashboard' | 'transactions' | 'investments') => {
    setView(newView);
    setIsSidebarOpen(false); // Fecha a sidebar ao selecionar uma view no mobile
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={updatedTransactions} investments={investments} />;
      case 'transactions':
        return <Transactions transactions={updatedTransactions} addTransaction={addTransaction} onEdit={handleEditClick} onDelete={deleteTransaction} />;
      case 'investments':
        return <Investments investments={investments} addInvestment={addInvestment} />;
      default:
        return <Dashboard transactions={updatedTransactions} investments={investments} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar setView={handleSetView} activeView={view} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden">
         <header className="md:hidden flex items-center justify-between bg-brand-dark text-white p-4 shadow-md">
            <button onClick={() => setIsSidebarOpen(true)}>
                <MenuIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-lg font-bold">{viewTitles[view]}</h1>
            <div className="w-6"></div> {/* Espaçador */}
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
            {renderView()}
        </div>
      </main>
      {isEditModalOpen && editingTransaction && (
        <EditTransactionModal 
            transaction={editingTransaction}
            onSave={updateTransaction}
            onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;