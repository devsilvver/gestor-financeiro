
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface ExpensePieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const expenseData = new Map<string, number>();
    transactions
      .filter(t => t.type === TransactionType.DESPESA)
      .forEach(t => {
        const currentAmount = expenseData.get(t.category) || 0;
        expenseData.set(t.category, currentAmount + t.amount);
      });
    
    return Array.from(expenseData.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Nenhuma despesa registrada.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 'Valor']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
