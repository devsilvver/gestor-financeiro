
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance' | 'investment';
  profit?: number;
}

const typeStyles = {
    income: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        profit: 'text-green-500',
    },
    expense: {
        bg: 'bg-red-50',
        text: 'text-red-600',
    },
    balance: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
    },
    investment: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
    }
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, type, profit }) => {
    const styles = typeStyles[type];
    const isProfitPositive = profit !== undefined && profit >= 0;

  return (
    <div className={`${styles.bg} p-6 rounded-xl shadow-md`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${styles.text}`}>
        {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
      {profit !== undefined && (
        <p className={`mt-1 text-sm font-semibold ${isProfitPositive ? 'text-green-600' : 'text-red-600'}`}>
           {isProfitPositive ? '+' : ''}
           {profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de lucro
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
