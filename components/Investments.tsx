import React, { useState } from 'react';
import { Investment, InvestmentType } from '../types';

interface InvestmentsProps {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
}

const investmentExamples = [
    { name: 'Apple (AAPL)', type: InvestmentType.ACOES },
    { name: 'Google (GOOGL)', type: InvestmentType.ACOES },
    { name: 'Tesouro Selic', type: InvestmentType.RENDA_FIXA },
    { name: 'Bitcoin (BTC)', type: InvestmentType.CRIPTOMOEDAS },
    { name: 'FII MXRF11', type: InvestmentType.FUNDOS_IMOBILIARIOS },
];

const Investments: React.FC<InvestmentsProps> = ({ investments, addInvestment }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<InvestmentType>(InvestmentType.ACOES);
    const [initialValue, setInitialValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    const handleCurrencyChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const digitsOnly = rawValue.replace(/\D/g, '');

        if (digitsOnly === '') {
            setter('');
            return;
        }

        const numberValue = parseInt(digitsOnly, 10) / 100;
        const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numberValue);
        
        setter(formattedValue);
    };

    const handleExampleClick = (example: { name: string, type: InvestmentType }) => {
        setName(example.name);
        setType(example.type);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericInitialValue = initialValue ? parseFloat(initialValue.replace(/\D/g, '')) / 100 : 0;
        const numericCurrentValue = currentValue ? parseFloat(currentValue.replace(/\D/g, '')) / 100 : 0;

        if(!name || numericInitialValue <= 0 || numericCurrentValue <= 0 || !purchaseDate) return;

        addInvestment({
            name,
            type,
            initialValue: numericInitialValue,
            currentValue: numericCurrentValue,
            purchaseDate: new Date(purchaseDate + 'T00:00:00'),
        });
        setName('');
        setType(InvestmentType.ACOES)
        setInitialValue('');
        setCurrentValue('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
    };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Meus Investimentos</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Comece com um Exemplo</h2>
        <div className="flex flex-wrap gap-2">
            {investmentExamples.map(ex => (
                <button 
                    key={ex.name}
                    onClick={() => handleExampleClick(ex)}
                    className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
                >
                    {ex.name}
                </button>
            ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Novo Investimento</h2>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                  <label className="block text-sm font-medium text-gray-600">Nome/Ativo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-600">Tipo</label>
                  <select value={type} onChange={e => setType(e.target.value as InvestmentType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary">
                      {Object.values(InvestmentType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-600">Data da Compra</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-600">Valor Inicial</label>
                  <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={initialValue} onChange={handleCurrencyChange(setInitialValue)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-600">Valor Atual</label>
                  <input type="text" inputMode="numeric" placeholder="R$ 0,00" value={currentValue} onChange={handleCurrencyChange(setCurrentValue)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-primary focus:border-brand-primary" required />
              </div>
              <div>
                  <button type="submit" className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">Adicionar</button>
              </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map(inv => {
            const profit = inv.currentValue - inv.initialValue;
            const profitPercentage = inv.initialValue > 0 ? (profit / inv.initialValue) * 100 : 0;
            const isProfit = profit >= 0;

            return (
                <div key={inv.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                             <h3 className="font-bold text-lg text-gray-800">{inv.name}</h3>
                             <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{inv.type}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Comprado em: {new Date(inv.purchaseDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valor Inicial</span>
                            <span>{inv.initialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                             <span className="text-gray-600">Valor Atual</span>
                            <span>{inv.currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                         <hr className="my-2"/>
                         <div className={`flex justify-between text-sm font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Resultado</span>
                            <span>{profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({profitPercentage.toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default Investments;