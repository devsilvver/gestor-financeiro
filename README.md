# 💰 Gestor Financeiro Pessoal

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> Um aplicativo completo de gerenciamento financeiro pessoal desenvolvido para rastrear receitas, despesas e investimentos em tempo real.

### 📸 Demonstração

<div align="center">
  <img src="https://i.imgur.com/8Qif10n.png" width="100%" alt="Dashboard Screenshot" />
</div>

---

### ✨ Funcionalidades

* **📊 Dashboard Interativo:** Visualização de saldo, receitas, despesas e lucro de investimentos.
* **💳 Gestão de Transações:**
    * Cadastro de receitas e despesas.
    * **Sistema de Recorrência:** Suporte para parcelamento de compras.
    * Status de pagamento (Pendente, Pago, Vencido).
* **📈 Carteira de Investimentos:** Acompanhamento de Ações, FIIs, Criptomoedas e Renda Fixa.
* **🔐 Autenticação:** Login integrado com Google via Firebase.
* **🔔 Notificações:** Alertas visuais para contas vencidas ou próximas do vencimento.

---

### 🛠️ Tecnologias Utilizadas

* **[React](https://react.dev/)**
* **[TypeScript](https://www.typescriptlang.org/)**
* **[Vite](https://vitejs.dev/)**
* **[Firebase](https://firebase.google.com/)** (Auth & Firestore)
* **[Tailwind CSS](https://tailwindcss.com/)**
* **[Recharts](https://recharts.org/)**

---

### 🚀 Como rodar o projeto

#### 1. Clone o repositório
```bash
git clone [https://github.com/devsilvver/gestor-financeiro.git](https://github.com/devsilvver/gestor-financeiro.git)
cd gestor-financeiro
```

#### 2. Instale as dependências
```bash
npm install
```

#### 3. Configure o Firebase
Crie um arquivo `.env` na raiz e adicione suas chaves:
```env
VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-project-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
```

#### 4. Rode o projeto
```bash
npm run dev
```
O projeto estará rodando em http://localhost:3000.

---

### 📂 Estrutura do Projeto

```text
src/
├── components/        # Componentes reutilizáveis (Sidebar, Modais, Cards)
├── icons/            # Ícones SVG customizados
├── types.ts          # Definições de Tipos TypeScript (Interfaces)
├── firebase.ts       # Configuração e inicialização do Firebase
├── App.tsx           # Componente principal e lógica de rotas/estado
└── main.tsx          # Ponto de entrada da aplicação
```

---

### 👤 Autor

Feito por **Guilherme Silvestrini**.

<a href="https://www.linkedin.com/in/guilherme-silvestrini-782226233/" target="_blank">
 <img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white" target="_blank">
</a>
<a href="mailto:contatosilvestrini@gmail.com">
 <img src="https://img.shields.io/badge/-Gmail-%23D14836?style=for-the-badge&logo=gmail&logoColor=white" target="_blank">
</a>
