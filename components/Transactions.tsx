

import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, TransactionCategory, TransactionStatus } from '../types';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import PlusIcon from './icons/PlusIcon';
import CheckIcon from './icons/CheckIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';


interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  deleteRecurringTransaction: (recurringId: string) => void;
  addAmountToDebt: (transactionId: string, amountToAdd: number) => void;
  markAsPaid: (id: string) => void;
}

const statusStyles: { [key in TransactionStatus]: string } = {
    [TransactionStatus.PAGO]: 'bg-green-100 text-green-800',
    [TransactionStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800',
    [TransactionStatus.VENCIDO]: 'bg-red-100 text-red-800',
    [TransactionStatus.RECEITA]: 'bg-green-100 text-green-800',
    [TransactionStatus.DESPESA]: 'bg-gray-100 text-gray-800',
};

const CategorySelector: React.FC<{ selected: TransactionCategory, onChange: (category: TransactionCategory) => void }> = ({ selected, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Categoria</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {Object.values(TransactionCategory).map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onChange(cat)}
                        className={`text-center p-2 rounded-lg border text-sm transition-all duration-200 ${selected === cat ? 'bg-brand-primary text-white border-brand-primary font-semibold' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};


const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, onEdit, onDelete, deleteRecurringTransaction, addAmountToDebt, markAsPaid }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.DESPESA);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.ALIMENTACAO);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [installments, setInstallments] = useState('2');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (digitsOnly === '') {
      setAmount('');
      return;
    }

    const numberValue = parseInt(digitsOnly, 10) / 100;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
    
    setAmount(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = amount ? parseFloat(amount.replace(/\D/g, '')) / 100 : 0;

    if (!description || numericAmount <= 0 || !category || !date) return;

    const isExpense = type === TransactionType.DESPESA;

    if (isExpense && isRecurring) {
        const numInstallments = parseInt(installments, 10);
        if (numInstallments < 2 || !dueDate) return;

        const firstDueDate = new Date(dueDate + 'T00:00:00');
        const recurringId = `recur_${new Date().toISOString()}_${Math.random()}`;
        
        for (let i = 0; i < numInstallments; i++) {
            const installmentDueDate = new Date(firstDueDate);
            installmentDueDate.setMonth(firstDueDate.getMonth() + i);

            addTransaction({
                description: `${description} (${i + 1}/${numInstallments})`,
                amount: numericAmount,
                type,
                category,
                date: new Date(date + 'T00:00:00'),
                dueDate: installmentDueDate,
                recurringId: recurringId,
            });
        }
    } else {
        addTransaction({
          description,
          amount: numericAmount,
          type,
          category,
          date: new Date(date + 'T00:00:00'),
          dueDate: isExpense && dueDate ? new Date(dueDate + 'T00:00:00') : undefined,
        });
    }

    setShowConfirmation(true);
    setTimeout(() => {
        setShowConfirmation(false);
    }, 3000);

    // Reset form for a better user experience
    setDescription('');
    setAmount('');
    setType(TransactionType.DESPESA);
    setCategory(TransactionCategory.ALIMENTACAO);
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setIsRecurring(false);
    setInstallments('2');
  };

  const handleDeleteClick = (id: string) => {
    if(window.confirm('Tem certeza que deseja excluir esta transação?')) {
        onDelete(id);
    }
  }

  const handleDeleteRecurringClick = (recurringId: string) => {
    if(window.confirm('Tem certeza que deseja excluir TODAS as parcelas desta transação? Esta ação não pode ser desfeita.')) {
        deleteRecurringTransaction(recurringId);
    }
  }

  const handleAddAmountClick = (transactionId: string) => {
    const amountString = window.prompt("Qual valor deseja adicionar à dívida? (Use ponto ou vírgula para centavos, ex: 30.50)");
    if (amountString) {
        const normalizedAmountString = amountString.replace(',', '.');
        const amountToAdd = parseFloat(normalizedAmountString);

        if (!isNaN(amountToAdd) && amountToAdd > 0) {
            addAmountToDebt(transactionId, amountToAdd);
        } else {
            alert("Por favor, insira um valor numérico válido.");
        }
    }
  };
  
  const displayTransactions = useMemo(() => {
    const grouped: { [key: string]: Transaction[] } = {};
    const singles: Transaction[] = [];

    transactions.forEach(t => {
      if (t.recurringId) {
        if (!grouped[t.recurringId]) grouped[t.recurringId] = [];
        grouped[t.recurringId].push(t);
      } else {
        singles.push(t);
      }
    });

    const combinedList: (Transaction | Transaction[])[] = [...singles];
    Object.values(grouped).forEach(group => {
        // Sort by due date to easily find the next pending one
        group.sort((a, b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0);
        combinedList.push(group);
    });

    // Sort the final list by date
    combinedList.sort((a, b) => {
        const dateA = new Date(Array.isArray(a) ? a[0].date : a.date);
        const dateB = new Date(Array.isArray(b) ? b[0].date : b.date);
        return dateB.getTime() - dateA.getTime();
    });

    return combinedList;

  }, [transactions]);

  const TransactionRow: React.FC<{ t: Transaction, isSubRow?: boolean }> = ({ t, isSubRow = false }) => {
    const descriptionMatch = t.description.match(/\s\((\d+\/\d+)\)$/);
    const mainDescription = descriptionMatch ? t.description.replace(descriptionMatch[0], '') : t.description;
    const installmentBadge = descriptionMatch ? descriptionMatch[1] : null;

    return (
      <tr className={`${isSubRow ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
        <td className={`p-3 ${isSubRow ? 'pl-8' : ''}`}>
          {mainDescription}
          {installmentBadge && (
            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
              {installmentBadge}
            </span>
          )}
        </td>
        <td className={`p-3 font-semibold ${t.type === TransactionType.RECEITA ? 'text-green-600' : 'text-red-600'}`}>
            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </td>
        <td className="p-3 text-sm text-gray-600">{t.category}</td>
        <td className="p-3 text-sm text-gray-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
         <td className="p-3 text-sm text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
        <td className="p-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusStyles[t.status]}`}>
                {t.status}
            </span>
        </td>
        <td className="p-3">
            <div className="flex items-center space-x-2">
                {(t.status === TransactionStatus.PENDENTE || t.status === TransactionStatus.VENCIDO) && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); markAsPaid(t.id); }}
                        className="text-gray-500 hover:text-green-600 transition-colors"
                        title="Marcar como Pago"
                    >
                        <CheckIcon className="w-5 h-5" />
                    </button>
                )}
                {t.type === TransactionType.DESPESA && t.category === TransactionCategory.DIVIDAS && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleAddAmountClick(t.id); }}
                        className="text-gray-500 hover:text-green-600 transition-colors"
                        title="Adicionar valor à dívida"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="text-gray-500 hover:text-brand-primary transition-colors" title="Editar">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(t.id); }} className="text-gray-500 hover:text-red-600 transition-colors" title="Excluir">
                    <DeleteIcon className="w-5 h-5" />
                </button>
            </div>
        </td>
      </tr>
    );
  };


  return (
    <div className="space-y-6">
      {showConfirmation && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center bg-brand-secondary text-white py-3 px-5 rounded-lg shadow-lg animate-fade-in-out">
          <CheckIcon className="w-6 h-6 mr-3" />
          <span className="font-semibold">Transação adicionada!</span>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-800">Gerenciar Transações</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Nova Transação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-600">Tipo</label>
                       <div className="mt-1 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setType(TransactionType.DESPESA)} className={`p-3 rounded-md text-center font-semibold transition-colors ${type === TransactionType.DESPESA ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Despesa</button>
                          <button type="button" onClick={() => setType(TransactionType.RECEITA)} className={`p-3 rounded-md text-center font-semibold transition-colors ${type === TransactionType.RECEITA ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Receita</button>
                      </div>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-600">Descrição</label>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
                  </div>
              </div>

              <CategorySelector selected={category} onChange={setCategory} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                      <label className="block text-sm font-medium text-gray-600">Valor</label>
                      <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={amount} onChange={handleAmountChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-600">Data da Transação</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
                  </div>
                   {type === TransactionType.DESPESA && (
                      <>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Data de Vencimento</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required={isRecurring} />
                        </div>
                        <div>
                           <div className="flex items-center space-x-2 mb-1 h-6">
                              <input id="isRecurring" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                              <label htmlFor="isRecurring" className="block text-sm font-medium text-gray-600">Repetir?</label>
                           </div>
                           <input type="text" inputMode="numeric" min="2" value={installments} onChange={e => setInstallments(e.target.value.replace(/\D/g, ''))} className={`block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary ${!isRecurring && 'invisible'}`} required={isRecurring} placeholder="Nº de Parcelas" aria-label="Número de parcelas" />
                        </div>
                      </>
                   )}
                  <div className="lg:col-span-full flex justify-end">
                      <button type="submit" className="w-full sm:w-auto bg-brand-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors">Adicionar</button>
                  </div>
              </div>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Histórico de Transações</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
                <thead className="text-sm text-gray-500 bg-gray-50">
                    <tr>
                        <th className="p-3 font-semibold">Descrição</th>
                        <th className="p-3 font-semibold">Valor</th>
                        <th className="p-3 font-semibold">Categoria</th>
                        <th className="p-3 font-semibold">Data</th>
                        <th className="p-3 font-semibold">Vencimento</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {displayTransactions.map((item, index) => {
                       if(Array.isArray(item)) {
                          const group = item;
                          const recurringId = group[0].recurringId!;
                          const isExpanded = expandedGroupId === recurringId;

                          const now = new Date();
                          now.setHours(0,0,0,0);

                          const mainTransaction = group.find(t => t.status === TransactionStatus.PENDENTE && t.dueDate && new Date(t.dueDate) >= now) ||
                                                 group.find(t => t.status === TransactionStatus.VENCIDO) ||
                                                 [...group].reverse().find(t => t.status === TransactionStatus.PAGO) ||
                                                 group[0];
                          
                          const descriptionMatch = mainTransaction.description.match(/\s\((\d+\/\d+)\)$/);
                          const mainDescription = descriptionMatch ? mainTransaction.description.replace(descriptionMatch[0], '') : mainTransaction.description;
                          const installmentBadge = descriptionMatch ? descriptionMatch[1] : null;

                          return (
                            <React.Fragment key={recurringId}>
                                <tr onClick={() => setExpandedGroupId(isExpanded ? null : recurringId)} className="cursor-pointer hover:bg-gray-100">
                                    <td className="p-3 flex items-center">
                                      <ChevronDownIcon className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      <span>{mainDescription}</span>
                                      {installmentBadge && (
                                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                                          {group.length}x
                                        </span>
                                      )}
                                    </td>
                                    <td className={`p-3 font-semibold ${mainTransaction.type === TransactionType.RECEITA ? 'text-green-600' : 'text-red-600'}`}>{mainTransaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="p-3 text-sm text-gray-600">{mainTransaction.category}</td>
                                    <td className="p-3 text-sm text-gray-600">{new Date(mainTransaction.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-3 text-sm text-gray-600">{mainTransaction.dueDate ? new Date(mainTransaction.dueDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusStyles[mainTransaction.status]}`}>{mainTransaction.status}</span></td>
                                    <td className="p-3">
                                      <div className="flex items-center space-x-2">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRecurringClick(recurringId); }} 
                                            className="text-gray-500 hover:text-red-600 transition-colors" 
                                            title="Excluir todas as parcelas">
                                            <DeleteIcon className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </td>
                                </tr>
                                {isExpanded && group.map(t => <TransactionRow t={t} key={t.id} isSubRow />)}
                            </React.Fragment>
                          )
                       } else {
                         return <TransactionRow t={item} key={item.id} />;
                       }
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
