import React, { useEffect, useState, useContext } from 'react';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { z } from 'zod';
import { db } from '../../services/firebaseConnection';
import { AuthContext } from '../../contexts/AuthContext';
import { Container } from '../../components/container';

const taskSchema = z.object({
  title: z.string().nonempty('Digite um nome para sua tarefa.'),
});

interface Task {
  id: string;
  title: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  lastEditedAt: Date | null;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("todos");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          createdAt: doc.data().createdAt.toDate(),
          completed: doc.data().completed || false,
          completedAt: doc.data().completedAt ? doc.data().completedAt.toDate() : null,
          completedBy: doc.data().completedBy || null,
          lastEditedAt: null,
        }));
        setTasks(tasksArray);
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask(e.target.value);
    setErrorMessage(null);
  };

  const handleEditingTaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTaskTitle(e.target.value);
    setErrorMessage(null);
  };

  const addTask = async (): Promise<void> => {
    setErrorMessage(null);
    const result = taskSchema.safeParse({ title: newTask });
    if (!result.success) {
      setErrorMessage(result.error.errors[0].message);
      return;
    }

    try {
      const timestamp = new Date();
      await addDoc(collection(db, 'tasks'), {
        title: newTask,
        userId: user?.uid,
        createdAt: timestamp,
        completed: false,
      });
      setNewTask('');
    } catch (e) {
      console.error('Erro ao adicionar o documento: ', e);
      setErrorMessage('Um erro ocorreu enquanto tentava adicionar a tarefa.');
    }
  };

  const editTask = async (taskId: string): Promise<void> => {
    setErrorMessage(null);
    const result = taskSchema.safeParse({ title: editingTaskTitle });
    if (!result.success) {
      setErrorMessage(result.error.errors[0].message);
      return;
    }

    try {
      const taskDocRef = doc(db, 'tasks', taskId);
      const timestamp = new Date();

      await updateDoc(taskDocRef, {
        title: editingTaskTitle,
        lastEditedAt: timestamp,
      });

      setTasks(tasks.map((task) =>
        task.id === taskId ? { ...task, title: editingTaskTitle, lastEditedAt: timestamp } : task
      ));

      setEditingTaskId(null);
      setEditingTaskTitle('');
    } catch (e) {
      console.error('Erro ao atualizar o documento ', e);
      setErrorMessage('Um erro ocorreu enquanto tentava atualizar a tarefa.');
    }
  };

  const startEditing = (task: Task): void => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditing = (): void => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setErrorMessage(null);
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter((task) => task.id !== taskId));
      setTaskToDelete(null);
    } catch (e) {
      console.error('Erro ao deletar o documento ', e);
      setErrorMessage('Um erro ocorreu enquanto tentava deletar a tarefa.');
    }
  };

  const toggleTaskCompletion = async (taskId: string): Promise<void> => {
    try {
      const taskDocRef = doc(db, 'tasks', taskId);
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex !== -1) {
        const updatedTasks = [...tasks];
        const completed = !updatedTasks[taskIndex].completed;
        const completedAt = completed ? new Date() : null;

        await updateDoc(taskDocRef, {
          completed: completed,
          completedAt: completedAt,
        });

        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          completed: completed,
          completedAt: completedAt,
        };

        setTasks(updatedTasks);
      }
    } catch (e) {
      console.error('Erro ao atualizar o documento ', e);
      setErrorMessage('Um erro ocorreu enquanto tentava atualizar a tarefa.');
    }
  };

  const FilterButtons = () => (
    <div className="flex justify-center gap-2 mb-4">
      <button 
        onClick={() => setFilter("todos")}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          filter === "todos" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        Todos
      </button>
      <button 
        onClick={() => setFilter("concluídos")}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          filter === "concluídos" ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        Concluídos
      </button>
      <button 
        onClick={() => setFilter("abertos")}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          filter === "abertos" ? "bg-yellow-500 hover:bg-yellow-700' text-white" : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        Abertos
      </button>
    </div>
  );

  const openTaskModal = (task: Task): void => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeTaskModal = (): void => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const renderTaskModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50" onClick={closeTaskModal}></div>
        <div className="bg-white rounded-lg p-4 w-80 relative z-10">
          <h2 className="text-lg font-semibold mb-4">Informações da Tarefa</h2>
          <p><strong>Data e Hora da Criação:</strong> {selectedTask.createdAt.toLocaleString()}</p>
          {selectedTask.completed && (
            <>
              <p><strong>Data e Hora da Conclusão:</strong> {selectedTask.completedAt?.toLocaleString()}</p>
              <p><strong>Data e Hora da Última Edição:</strong> {selectedTask.lastEditedAt ? selectedTask.lastEditedAt.toLocaleString() : 'Nenhuma edição foi identificada'}</p>
            </>
          )}
          {!selectedTask.completed && <p><strong>Esta tarefa ainda não foi concluída.</strong></p>}
          <button
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            onClick={closeTaskModal}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!isDeleteModalOpen || !taskToDelete) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsDeleteModalOpen(false)}></div>
        <div className="bg-white rounded-lg p-4 w-80 relative z-10">
          <h2 className="text-lg font-semibold mb-4">Confirmar Exclusão</h2>
          <p>Tem certeza de que deseja excluir esta tarefa?</p>
          <div className="flex justify-end gap-4 mt-4">
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
              onClick={() => {
                if (taskToDelete) deleteTask(taskToDelete.id);
                setIsDeleteModalOpen(false);
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container>
      <div className="p-6 bg-white shadow-md rounded-lg mt-20">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Minha lista de tarefas</h1>
        
        <FilterButtons />

        <div className="flex flex-col sm:flex-row">
          <input
            type="text"
            value={newTask}
            onChange={handleNewTaskChange}
            placeholder="Digite o nome da sua tarefa"
            className="border p-2 rounded flex-grow"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded mt-2 sm:mt-0 sm:ml-2"
          >
            Adicionar tarefa
          </button>
        </div>

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        <ul className="mt-4">
          {tasks.filter((task) => {
              if (filter === "todos") return true;
              if (filter === "concluídos") return task.completed;
              if (filter === "abertos") return !task.completed;
              return true;
            }).map((task, index) => (
              <li key={task.id} className={`flex flex-col sm:flex-row bg-gray-100 p-3 rounded-lg mb-2 ${task.completed ? 'bg-green-100 cursor-pointer' : ''}`} onClick={() => task.completed && openTaskModal(task)}>
                <span className={`font-bold mr-2 ${task.completed ? 'line-through text-green-500' : ''}`}>{index + 1}.</span>
                <div className="flex-1 min-w-0 w-full">
                  {editingTaskId === task.id ? (
                    <div className="flex flex-col sm:flex-row w-full">
                      <input
                        type="text"
                        value={editingTaskTitle}
                        onChange={handleEditingTaskTitleChange}
                        className="border p-2 rounded mb-2 sm:mb-0 w-full sm:mr-2"
                      />
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => editTask(task.id)}
                          className="bg-green-500 hover:bg-green-700 text-white p-1 rounded flex-grow sm:flex-grow-0"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 hover:bg-gray-700 text-white p-1 rounded flex-grow sm:flex-grow-0"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-700 break-all overflow-wrap break-word">
                      {task.title}
                    </span>
                  )}
                  {errorMessage && editingTaskId === task.id && (
                    <p className="text-red-500 mt-2">{errorMessage}</p>
                  )}
                </div>
                {editingTaskId !== task.id && (
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => startEditing(task)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white p-1 rounded flex-grow"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteModalOpen(true);
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white p-1 rounded flex-grow"
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white p-1 rounded flex-grow"
                    >
                      {task.completed ? 'Desfazer' : 'Concluir'}
                    </button>
                  </div>
                )}
              </li>
            ))}
        </ul>
        {isModalOpen && renderTaskModal()}
      </div>
      {renderDeleteModal()}
    </Container>
  );
};

export default App;

