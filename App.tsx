import React, { useState, useMemo, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, writeBatch, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

import { Transaction, Investment, TransactionType, TransactionStatus } from './types';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import EditTransactionModal from './components/EditTransactionModal';
import MenuIcon from './components/icons/MenuIcon';
import Login from './components/Login';


const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'transactions' | 'investments'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setInvestments([]);
      return;
    }

    // Transactions listener
    const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
    const qTransactions = query(transCollectionRef, orderBy('date', 'desc'));
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
          dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
        } as Transaction;
      });
      setTransactions(transactionsData);
    });

    // Investments listener
    const invCollectionRef = collection(db, 'users', user.uid, 'investments');
    const qInvestments = query(invCollectionRef, orderBy('purchaseDate', 'desc'));
    const unsubscribeInvestments = onSnapshot(qInvestments, (snapshot) => {
      const investmentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          purchaseDate: (data.purchaseDate as Timestamp).toDate(),
        } as Investment;
      });
      setInvestments(investmentsData);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeInvestments();
    };
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoginError(null);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Authentication error:", error);
      setLoginError("Falha ao fazer login. Tente novamente.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
    }); // Firestore query already sorts by date
  }, [transactions]);
  
  // --- Data Mutation Functions ---

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'status'>) => {
    if (!user) return;
    
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

    const newTransaction = {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      dueDate: transaction.dueDate ? Timestamp.fromDate(transaction.dueDate) : null,
      status,
    };
    
    await addDoc(collection(db, 'users', user.uid, 'transactions'), newTransaction);
  };

  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    if (!user) return;
    const newInvestment = {
      ...investment,
      purchaseDate: Timestamp.fromDate(investment.purchaseDate)
    };
    await addDoc(collection(db, 'users', user.uid, 'investments'), newInvestment);
  };

  const deleteInvestment = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'investments', id));
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsEditModalOpen(false);
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;
    const { id, ...dataToUpdate } = updatedTransaction;
    const docRef = doc(db, 'users', user.uid, 'transactions', id);
    await updateDoc(docRef, {
      ...dataToUpdate,
      date: Timestamp.fromDate(dataToUpdate.date),
      dueDate: dataToUpdate.dueDate ? Timestamp.fromDate(dataToUpdate.dueDate) : null,
    });
    handleCloseModal();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  const deleteRecurringTransaction = async (recurringId: string) => {
    if (!user) return;
    const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(transCollectionRef, where("recurringId", "==", recurringId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  };
  
  const addAmountToDebt = async (transactionId: string, amountToAdd: number) => {
    if (!user) return;
    const transaction = transactions.find(t => t.id === transactionId);
    if(transaction) {
      const docRef = doc(db, 'users', user.uid, 'transactions', transactionId);
      await updateDoc(docRef, {
        amount: transaction.amount + amountToAdd
      });
    }
  };

  const markAsPaid = async (transactionId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'transactions', transactionId);
    await updateDoc(docRef, {
      status: TransactionStatus.PAGO
    });
  };

  const handleSetView = (newView: 'dashboard' | 'transactions' | 'investments') => {
    setView(newView);
    setIsSidebarOpen(false);
  }

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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar 
        user={user}
        setView={handleSetView} 
        activeView={view} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
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
