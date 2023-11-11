import { ReactNode, createContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebaseConnection'

interface AuthProviderProps {
  children: ReactNode
}

type AuthContextData = {
  signed: boolean;
  loadingAuth: boolean;
  handleInfoUser: ({ name, email, uid }: UserProps) => void;
  user: UserProps | null;
  userName: string | null; // Adicione userName
}

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext({} as AuthContextData)

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // Estado para o nome do usuário
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email
        });

        setUserName(user?.displayName); // Defina o nome do usuário no estado userName

        setLoadingAuth(false);
      } else {
        setUser(null);
        setUserName(null); // Limpe o nome do usuário no estado userName
        setLoadingAuth(false);
      }
    });

    return () => {
      unsub();
    }
  }, []);

  function handleInfoUser({ name, email, uid }: UserProps) {
    setUser({
      name,
      email,
      uid,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        loadingAuth,
        handleInfoUser,
        user,
        userName, // Adicione userName ao contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
