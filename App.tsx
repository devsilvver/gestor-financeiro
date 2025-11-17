
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Investment, TransactionType, TransactionCategory, TransactionStatus, InvestmentType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import EditTransactionModal from './components/EditTransactionModal';
import MenuIcon from './components/icons/MenuIcon';

const TRANSACTIONS_STORAGE_KEY = 'finance_app_transactions';
const INVESTMENTS_STORAGE_KEY = 'finance_app_investments';


const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'transactions' | 'investments'>('dashboard');
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions) as any[];
        // Convert date strings back to Date objects
        return parsed.map(t => ({
          ...t,
          date: new Date(t.date),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        }));
      }
    } catch (error) {
      console.error("Failed to load transactions from local storage", error);
    }
    return [];
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
        const savedInvestments = localStorage.getItem(INVESTMENTS_STORAGE_KEY);
        if (savedInvestments) {
            const parsed = JSON.parse(savedInvestments) as any[];
            return parsed.map(i => ({
                ...i,
                purchaseDate: new Date(i.purchaseDate),
            }));
        }
    } catch (error) {
        console.error("Failed to load investments from local storage", error);
    }
    return [];
  });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to local storage", error);
    }
  }, [transactions]);

  useEffect(() => {
      try {
          localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments));
      } catch (error) {
          console.error("Failed to save investments to local storage", error);
      }
  }, [investments]);

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
        if (transaction.dueDate) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            status = new Date(transaction.dueDate) < now ? TransactionStatus.VENCIDO : TransactionStatus.PENDENTE;
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

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
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
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    handleCloseModal();
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteRecurringTransaction = (recurringId: string) => {
    setTransactions(prev => prev.filter(t => t.recurringId !== recurringId));
  };
  
  const addAmountToDebt = (transactionId: string, amountToAdd: number) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          return { ...t, amount: t.amount + amountToAdd };
        }
        return t;
      })
    );
  };

  const markAsPaid = (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          return { ...t, status: TransactionStatus.PAGO };
        }
        return t;
      })
    );
  };

  const handleSetView = (newView: 'dashboard' | 'transactions' | 'investments') => {
    setView(newView);
    setIsSidebarOpen(false); // Fecha a sidebar ao selecionar uma view no mobile
  }

  const exportData = () => {
    try {
      const dataToExport = {
        transactions,
        investments,
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `dados_financeiros_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data", error);
      alert("Ocorreu um erro ao exportar os dados.");
    }
  };

  const importData = (file: File) => {
    if (!file) return;

    if (!window.confirm("Tem certeza que deseja importar os dados? Todos os dados atuais serão substituídos. É recomendado fazer um backup antes.")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not a string");

        const parsedData = JSON.parse(text);
        
        if (!parsedData.transactions || !parsedData.investments) {
            throw new Error("Arquivo JSON inválido. Faltando 'transactions' ou 'investments'.");
        }

        const importedTransactions = (parsedData.transactions as any[]).map(t => ({
          ...t,
          date: new Date(t.date),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        }));

        const importedInvestments = (parsedData.investments as any[]).map(i => ({
          ...i,
          purchaseDate: new Date(i.purchaseDate),
        }));
        
        setTransactions(importedTransactions);
        setInvestments(importedInvestments);
        alert("Dados importados com sucesso!");

      } catch (error) {
        console.error("Failed to import data", error);
        alert(`Ocorreu um erro ao importar os dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    };
    reader.onerror = () => {
        alert("Não foi possível ler o arquivo.");
    }
    reader.readAsText(file);
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={updatedTransactions} investments={investments} />;
      case 'transactions':
        return <Transactions transactions={updatedTransactions} addTransaction={addTransaction} onEdit={handleEditClick} onDelete={deleteTransaction} deleteRecurringTransaction={deleteRecurringTransaction} addAmountToDebt={addAmountToDebt} markAsPaid={markAsPaid} />;
      case 'investments':
        return <Investments investments={investments} addInvestment={addInvestment} deleteInvestment={deleteInvestment} />;
      default:
        return <Dashboard transactions={updatedTransactions} investments={investments} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar 
        setView={handleSetView} 
        activeView={view} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onExport={exportData}
        onImport={importData}
      />
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