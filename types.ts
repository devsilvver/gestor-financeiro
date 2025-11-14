export enum TransactionType {
  RECEITA = 'Receita',
  DESPESA = 'Despesa',
}

export enum TransactionCategory {
  MORADIA = 'Moradia',
  TRANSPORTE = 'Transporte',
  ALIMENTACAO = 'Alimentação',
  SAUDE = 'Saúde',
  LAZER = 'Lazer',
  EDUCACAO = 'Educação',
  INVESTIMENTOS = 'Investimentos',
  SALARIO = 'Salário',
  DIVIDAS = 'Dívidas',
  OUTROS = 'Outros',
}

export enum TransactionStatus {
  PAGO = 'Pago',
  PENDENTE = 'Pendente',
  VENCIDO = 'Vencido',
  RECEITA = 'Receita',
  DESPESA = 'Despesa',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: Date;
  dueDate?: Date;
  status: TransactionStatus;
}

export enum InvestmentType {
    ACOES = 'Ações',
    RENDA_FIXA = 'Renda Fixa',
    FUNDOS_IMOBILIARIOS = 'Fundos Imobiliários',
    CRIPTOMOEDAS = 'Criptomoedas',
    OUTROS = 'Outros',
}

export interface Investment {
    id: string;
    name: string;
    type: InvestmentType;
    initialValue: number;
    currentValue: number;
    purchaseDate: Date;
}