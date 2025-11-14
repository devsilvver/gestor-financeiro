import React, { useMemo } from 'react';
import { Transaction, Investment, TransactionType, TransactionStatus } from '../types';
import SummaryCard from './SummaryCard';
import ExpensePieChart from './ExpensePieChart';
import BellIcon from './icons/BellIcon';

interface DashboardProps {
  transactions: Transaction[];
  investments: Investment[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, investments }) => {
  const { totalReceitas, totalDespesas, saldo, totalInvestido, lucroInvestimentos } = useMemo(() => {
    const totalReceitas = transactions
      .filter(t => t.type === TransactionType.RECEITA)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDespesas = transactions
      .filter(t => t.type === TransactionType.DESPESA)
      .reduce((sum, t) => sum + t.amount, 0);

    const saldo = totalReceitas - totalDespesas;

    const totalInvestido = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const initialInvestido = investments.reduce((sum, i) => sum + i.initialValue, 0);
    const lucroInvestimentos = totalInvestido - initialInvestido;

    return { totalReceitas, totalDespesas, saldo, totalInvestido, lucroInvestimentos };
  }, [transactions, investments]);

  const notifications = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const overdue = transactions.filter(t => t.status === TransactionStatus.VENCIDO);
    const dueSoon = transactions.filter(t => 
        t.status === TransactionStatus.PENDENTE && 
        t.dueDate && 
        new Date(t.dueDate) >= now && 
        new Date(t.dueDate) <= sevenDaysFromNow
    );

    return [...overdue, ...dueSoon];
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Financeiro</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Receita Total" value={totalReceitas} type="income" />
        <SummaryCard title="Despesa Total" value={totalDespesas} type="expense" />
        <SummaryCard title="Saldo Atual" value={saldo} type="balance" />
        <SummaryCard title="Total Investido" value={totalInvestido} type="investment" profit={lucroInvestimentos}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Despesas por Categoria</h2>
            <ExpensePieChart transactions={transactions} />
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Últimas Transações</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-sm text-gray-500">
                        <tr>
                            <th className="p-2">Descrição</th>
                            <th className="p-2">Valor</th>
                            <th className="p-2">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transactions.slice(0, 5).map(t => (
                            <tr key={t.id}>
                                <td className="p-2">{t.description}</td>
                                <td className={`p-2 font-semibold ${t.type === TransactionType.RECEITA ? 'text-green-500' : 'text-red-500'}`}>
                                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="p-2 text-sm text-gray-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
       {notifications.length > 0 && (
         <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                <BellIcon className="w-6 h-6 mr-2 text-amber-500" />
                Lembretes Importantes
            </h2>
            <ul className="space-y-3">
                {notifications.map(t => (
                    <li key={t.id} className={`p-3 rounded-lg flex justify-between items-center ${t.status === TransactionStatus.VENCIDO ? 'bg-red-50' : 'bg-amber-50'}`}>
                       <div>
                            <p className="font-semibold text-gray-800">{t.description}</p>
                            <p className="text-sm text-gray-600">
                                Vence em: {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                       </div>
                       <div className="text-right">
                            <p className={`font-bold ${t.status === TransactionStatus.VENCIDO ? 'text-red-600' : 'text-amber-700'}`}>
                                {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === TransactionStatus.VENCIDO ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                                {t.status === TransactionStatus.VENCIDO ? 'Vencido' : 'Pendente'}
                            </span>
                       </div>
                    </li>
                ))}
            </ul>
        </div>
       )}
    </div>
  );
};

export default Dashboard;