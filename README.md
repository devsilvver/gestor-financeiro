# 💰 Gestor Financeiro Pessoal

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> Um aplicativo completo de gerenciamento financeiro pessoal desenvolvido para rastrear receitas, despesas e investimentos em tempo real.

### 📸 Demonstração

<div align="center">
  <img src="https://imgur.com/8Qif10n" width="100%" alt="Dashboard Screenshot" />
</div>

---

### ✨ Funcionalidades

O projeto conta com um conjunto robusto de ferramentas para controle financeiro:

* **📊 Dashboard Interativo:** Visualização rápida de saldo, receitas, despesas e lucro de investimentos com gráficos dinâmicos.
* **💳 Gestão de Transações:**
    * Cadastro de receitas e despesas com categorização.
    * **Sistema de Recorrência:** Suporte para parcelamento de compras, gerando lançamentos futuros automaticamente.
    * Status de pagamento (Pendente, Pago, Vencido) com indicadores visuais.
* **📈 Carteira de Investimentos:**
    * Acompanhamento de Ações, FIIs, Criptomoedas e Renda Fixa.
    * Cálculo automático de rentabilidade (Valor Inicial vs. Valor Atual).
* **🔐 Autenticação Segura:** Login social integrado com **Google** via Firebase Auth.
* **📱 Design Responsivo:** Interface adaptada para Desktop e Mobile com menu lateral retrátil.
* **🔔 Sistema de Notificações:** Alertas para contas vencidas ou próximas do vencimento.

---

### 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as tecnologias mais modernas do ecossistema React:

* **[React 19](https://react.dev/)** - Biblioteca principal para construção da UI.
* **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript para tipagem estática e segurança.
* **[Vite](https://vitejs.dev/)** - Build tool de alta performance.
* **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service (Auth e Firestore Database).
* **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilização utility-first.
* **[Recharts](https://recharts.org/)** - Biblioteca para composição de gráficos de dados.

---

### 🚀 Como rodar o projeto

#### Pré-requisitos
* Node.js (versão 18 ou superior)
* Conta no Firebase configurada

#### 1. Clone o repositório

git clone [https://github.com/devsilvver/gestor-financeiro.git]([https://github.com/devsilvver/gestor-financeiro.git])
cd gestor-financeiro

#### 2. Instale as depenências

npm install

#### 3. Configure o Firebase: Crie um arquivo .env na raiz e adicione suas chaves:

VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-project-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"

#### 4. Rode o projeto:

npm run dev

O projeto estará rodando em http://localhost:3000.

📂 Estrutura do Projeto
src/
├── components/        # Componentes reutilizáveis (Sidebar, Modais, Cards)
├── icons/            # Ícones SVG customizados
├── types.ts          # Definições de Tipos TypeScript (Interfaces)
├── firebase.ts       # Configuração e inicialização do Firebase
├── App.tsx           # Componente principal e lógica de rotas/estado
└── main.tsx          # Ponto de entrada da aplicação

👤 Autor

Feito por Guilherme Silvestrini.

<a href="https://www.linkedin.com/in/guilherme-silvestrini-782226233/" target="_blank"> <img src="https://www.google.com/search?q=https://img.shields.io/badge/-LinkedIn-%25230077B5%3Fstyle%3Dfor-the-badge%26logo%3Dlinkedin%26logoColor%3Dwhite" target="_blank"> </a> <a href="mailto:contatosilvestrini@gmail.com"> <img src="https://www.google.com/search?q=https://img.shields.io/badge/-Gmail-%2523D14836%3Fstyle%3Dfor-the-badge%26logo%3Dgmail%26logoColor%3Dwhite" target="_blank"> </a>
