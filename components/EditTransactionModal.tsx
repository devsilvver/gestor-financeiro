import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionCategory, TransactionStatus } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction;
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onSave, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.DESPESA);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.OUTROS);
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.DESPESA);


  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setDueDate(transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '');
      setStatus(transaction.status);
    }
  }, [transaction]);

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
    
    const hasDueDate = (type === TransactionType.DESPESA && dueDate);

    onSave({
      ...transaction,
      description,
      amount: numericAmount,
      type,
      category,
      date: new Date(date + 'T00:00:00'),
      dueDate: hasDueDate ? new Date(dueDate + 'T00:00:00') : undefined,
      status,
    });
  };
  
  const availableStatuses = () => {
    if(type === TransactionType.RECEITA) {
        return [TransactionStatus.RECEITA];
    }
    if (dueDate) {
        return [TransactionStatus.PAGO, TransactionStatus.PENDENTE, TransactionStatus.VENCIDO];
    }
    return [TransactionStatus.DESPESA];
  }

  useEffect(() => {
    // Reset status if it becomes invalid for the current type/dueDate combination
    const validStatuses = availableStatuses();
    if (!validStatuses.includes(status)) {
        setStatus(validStatuses[0]);
    }
  }, [type, dueDate]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Transação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Descrição</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Valor</label>
              <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={amount} onChange={handleAmountChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary">
                {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value as TransactionCategory)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary">
                {Object.values(TransactionCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Data da Transação</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
            </div>
            {type === TransactionType.DESPESA && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Data de Vencimento</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary">
                        {availableStatuses().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;