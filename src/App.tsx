
import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/home';
import { Login } from './pages/login'
import { Register } from './pages/register'
import { RecoveryPassword } from './pages/recovery-password'

import { Layout } from './components/layout'
import { Private } from './routes/Private';

const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      {
        path: "/",
        element: <Private><Home/></Private>
      },
    ]
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/register",
    element: <Register/>
  },
  {
    path: "/recovery-password",
    element: <RecoveryPassword/>
  }
])

export { router };