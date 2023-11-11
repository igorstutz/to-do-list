import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import logoImg from '../../assets/logo.svg'
import { Link } from 'react-router-dom'
import { FiLogIn } from 'react-icons/fi'

export function Header() {
  const { signed, loadingAuth } = useContext(AuthContext);

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
         <Link to="/">
            <img
              src={logoImg} 
              alt="Logo do site" 
            />
         </Link>

         {!loadingAuth && signed && (
          <Link to="/">
            <div className="border-2 rounded-full p-1 border-gray-900 flex justify-center">
              <FiLogIn size={24} color="#000"/>
            </div>
            <span className="text-sm font-bold">Logout</span>
          </Link>
         )}

        {/* {!loadingAuth && !signed && (
          <Link to="/">
            <div className="border-2 rounded-full p-1 border-gray-900 flex justify-center">
              <FiLogIn size={16} color="#000"/>              
            </div>
            <span className="text-sm font-bold">login</span>
          </Link>
         )} */}
      </header>
    </div>
  )
}