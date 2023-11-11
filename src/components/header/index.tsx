import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import logoImg from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

export function Header() {
  const { signed, loadingAuth } = useContext(AuthContext);

  return (
    // O cabeçalho é fixado no topo da página e tem uma sombra aplicada para se destacar do conteúdo.
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-16 bg-white shadow-md">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to="/">
          <img
            src={logoImg} 
            alt="Logo do site" 
          />
        </Link>

        {!loadingAuth && signed && (
          <Link to="/login" className="flex items-center space-x-2">
            <div className="border-2 rounded-full p-1 border-gray-900 flex justify-center items-center">
              <FiLogIn size={24} color="#000"/>
            </div>
            <span className="text-sm font-bold">Logout</span>
          </Link>
        )}

        {/* Descomente e ajuste este bloco se você quiser mostrar um link de login/logout dependendo do estado de autenticação
        {!loadingAuth && !signed && (
          <Link to="/login" className="flex items-center space-x-2">
            <div className="border-2 rounded-full p-1 border-gray-900 flex justify-center items-center">
              <FiLogIn size={24} color="#000"/>              
            </div>
            <span className="text-sm font-bold">Login</span>
          </Link>
        )}
        */}
      </header>
    </div>
  )
}
