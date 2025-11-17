
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
  const { 
    totalReceitas, 
    totalDespesas, 
    saldo, 
    totalInvestido, 
    lucroInvestimentos,
    monthlyExpenseTransactions
  } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalReceitas = transactions
      .filter(t => {
        if (t.type !== TransactionType.RECEITA) return false;
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenseTransactions = transactions
      .filter(t => {
        if (t.type !== TransactionType.DESPESA) return false;
        
        // Use due date for expenses if available, otherwise transaction date
        const referenceDate = t.dueDate ? new Date(t.dueDate) : new Date(t.date);
        
        return referenceDate.getMonth() === currentMonth &&
               referenceDate.getFullYear() === currentYear;
      });
      
    const totalDespesas = monthlyExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const saldo = totalReceitas - totalDespesas;

    const totalInvestido = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const initialInvestido = investments.reduce((sum, i) => sum + i.initialValue, 0);
    const lucroInvestimentos = totalInvestido - initialInvestido;

    return { totalReceitas, totalDespesas, saldo, totalInvestido, lucroInvestimentos, monthlyExpenseTransactions };
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

  const latestTransactionsForDisplay = useMemo(() => {
    const recurringGroupsInfo = new Map<string, { count: number }>();
    transactions.forEach(t => {
        if (t.recurringId) {
            if (!recurringGroupsInfo.has(t.recurringId)) {
                recurringGroupsInfo.set(t.recurringId, { count: 0 });
            }
            recurringGroupsInfo.get(t.recurringId)!.count++;
        }
    });

    const displayList: Transaction[] = [];
    const processedRecurringIds = new Set<string>();

    for (const transaction of transactions) {
        if (transaction.recurringId) {
            if (!processedRecurringIds.has(transaction.recurringId)) {
                processedRecurringIds.add(transaction.recurringId);
                const mainDescription = transaction.description.replace(/\s\(\d+\/\d+\)$/, '');
                const totalInstallments = recurringGroupsInfo.get(transaction.recurringId)?.count || 0;
                
                displayList.push({
                    ...transaction,
                    description: totalInstallments > 1 ? `${mainDescription} (${totalInstallments}x)` : mainDescription
                });
            }
        } else {
            displayList.push(transaction);
        }
    }
    return displayList.slice(0, 5);
  }, [transactions]);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Financeiro</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Receita do Mês" value={totalReceitas} type="income" />
        <SummaryCard title="Despesa do Mês" value={totalDespesas} type="expense" />
        <SummaryCard title="Saldo do Mês" value={saldo} type="balance" />
        <SummaryCard title="Total Investido" value={totalInvestido} type="investment" profit={lucroInvestimentos}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Despesas do Mês por Categoria</h2>
            <ExpensePieChart transactions={monthlyExpenseTransactions} />
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
                        {latestTransactionsForDisplay.map(t => (
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
