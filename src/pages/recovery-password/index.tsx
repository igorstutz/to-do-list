import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.svg';
import { Container } from '../../components/container';
import { Input } from '../../components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Insira um email válido').nonempty('O campo email é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export function RecoveryPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  useEffect(() => {
    // Deslogar o usuário ao acessar a página
    const auth = getAuth();
    signOut(auth);
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, data.email);
      toast.success('Email de recuperação de senha enviado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      toast.error(`Erro ao enviar o email de recuperação de senha: ${error.message}`);
    }
  };

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-sm w-full">
          <img
            src={logoImg}
            alt="Logo do site"
            className="w-full"
          />
        </Link>

        <form
          className="bg-white max-w-xl w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <label htmlFor="email">Email</label>
            <Input
              type="email"
              placeholder="Digite seu email..."
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <button type="submit" className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium">
            Enviar Email de Recuperação
          </button>
        </form>

        <Link to="/login">
            <span className="bg-red-500 text-white px-2 py-1 rounded-lg">Voltar para Login</span>
        </Link>
      </div>
    </Container>
  );
}
