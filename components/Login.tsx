import React from 'react';
import GoogleIcon from './icons/GoogleIcon';
import LogoIcon from './icons/LogoIcon';

interface LoginProps {
  onLogin: () => void;
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="flex justify-center">
            <LogoIcon className="w-16 h-16 text-brand-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">
          Bem-vindo!
        </h1>

        <p className="text-gray-600">
          Acesse sua conta para sincronizar seus dados financeiros em todos os seus dispositivos.
        </p>
        
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          <span className="font-semibold text-gray-700">Entrar com Google</span>
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        <p className="text-xs text-gray-400 pt-4">
          Ao continuar, você concorda em usar o Firebase para armazenar seus dados de forma segura.
        </p>
      </div>
    </div>
  );
};

export default Login;
