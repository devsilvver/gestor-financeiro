import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionCategory, TransactionStatus } from '../types';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';


interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
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


const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, onEdit, onDelete }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.DESPESA);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.ALIMENTACAO);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

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

    const isDebt = type === TransactionType.DESPESA && category === TransactionCategory.DIVIDAS;

    addTransaction({
      description,
      amount: numericAmount,
      type,
      category,
      date: new Date(date + 'T00:00:00'),
      dueDate: isDebt && dueDate ? new Date(dueDate + 'T00:00:00') : undefined,
    });
    // Reset form for a better user experience
    setDescription('');
    setAmount('');
    setType(TransactionType.DESPESA);
    setCategory(TransactionCategory.ALIMENTACAO);
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
  };

  const handleDeleteClick = (id: string) => {
    if(window.confirm('Tem certeza que deseja excluir esta transação?')) {
        onDelete(id);
    }
  }

  return (
    <div className="space-y-6">
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
                   {type === TransactionType.DESPESA && category === TransactionCategory.DIVIDAS && (
                      <div>
                          <label className="block text-sm font-medium text-gray-600">Data de Vencimento</label>
                          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
                      </div>
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
                    {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                            <td className="p-3">{t.description}</td>
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
                                    <button onClick={() => onEdit(t)} className="text-gray-500 hover:text-brand-primary transition-colors">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(t.id)} className="text-gray-500 hover:text-red-600 transition-colors">
                                        <DeleteIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;