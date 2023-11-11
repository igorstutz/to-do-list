// src/pages/home/index.tsx
import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Container } from "../../components/container";
import toast from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext';
import { addTask, updateTask, deleteTask, loadUserTasks } from '../../services/taskService';

interface Task {
  id: string;
  title: string;
}

interface FormInputs {
  taskTitle: string;
}

export default function Home() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormInputs>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const unsubscribe = loadUserTasks(user.uid, setTasks);
      return () => unsubscribe && unsubscribe();
    } else {
      setTasks([]);
    }
  }, [user]);

  const onSubmit = async (data: FormInputs) => {
    if (data.taskTitle.trim() && user) {
      try {
        await addTask(data.taskTitle, user.uid);
        toast.success('Tarefa adicionada com sucesso!');
        reset();
      } catch (error) {
        toast.error('Erro ao adicionar tarefa.');
      }
    }
  };

  const onEditSubmit = async (data: FormInputs) => {
    if (data.taskTitle.trim() && user && editingTaskId) {
      try {
        await updateTask(editingTaskId, data.taskTitle);
        setEditingTaskId(null);
        reset();
        toast.success('Tarefa atualizada com sucesso!');
      } catch (error) {
        toast.error('Erro ao atualizar tarefa.');
      }
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setValue('taskTitle', task.title);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (user) {
      try {
        await deleteTask(taskId);
        setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
        toast.success('Tarefa excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir tarefa.');
      }
    }
  };

  return (
    <Container>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex gap-2">
          <input
            {...register('taskTitle', { required: "Insira o nome da tarefa" })}
            placeholder="Digite um nome para sua tarefa..."
            className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {editingTaskId ? "Atualizar tarefa" : "Adicionar tarefa"}
          </button>
        </form>
        {errors.taskTitle && <p className="text-red-500">{errors.taskTitle.message}</p>}

        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex justify-between items-center bg-gray-100 p-4 rounded shadow">
              <div className="flex-1 min-w-0 mr-4">
                {editingTaskId === task.id ? (
                  <form onSubmit={handleSubmit(onEditSubmit)} className="flex gap-2 w-full">
                    <input
                      {...register('taskTitle', { required: "Task title is required" })}
                      className="flex-1 px-4 py-2 border rounded"
                    />
                    <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded shadow hover:bg-green-600">
                      Update
                    </button>
                  </form>
                ) : (
                  <span className="font-medium break-all overflow-wrap">{task.title}</span>
                )}
              </div>
              {editingTaskId !== task.id && (
                <div className="flex gap-2">
                  <button onClick={() => startEditing(task)} className="px-3 py-1 bg-green-500 text-white rounded shadow hover:bg-green-600">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="px-3 py-1 bg-red-500 text-white rounded shadow hover:bg-red-600">
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
