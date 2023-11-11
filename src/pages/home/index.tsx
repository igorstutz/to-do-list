import React, { useEffect, useState, useContext } from 'react';
import { collection, addDoc, doc, deleteDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';
import { AuthContext } from '../../contexts/AuthContext';
import { Container } from '../../components/container';

interface Task {
  id: string;
  title: string;
  createdAt: Date; // Adicione esta linha
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.uid) {
      const q = query(collection(db, "tasks"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          createdAt: doc.data().createdAt,
        }));
        setTasks(tasksArray);
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);
  

  const addTask = async (): Promise<void> => {
    if (newTask) {
      try {
        const timestamp = new Date();
        await addDoc(collection(db, "tasks"), {
          title: newTask,
          userId: user?.uid,
          createdAt: timestamp,
        });
        setNewTask("");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };
  

  const startEditing = (task: Task): void => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setNewTask("");
  };

  const cancelEditing = (): void => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const editTask = (taskId: string): void => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, title: editingTaskTitle } : task));
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setNewTask("");
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await deleteDoc(doc(db, "tasks", taskId));
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <Container>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">My To-Do List</h1>
        <div className="mt-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="border p-2 rounded mr-2 flex-grow"
          />
          <button onClick={addTask} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
            Add Task
          </button>
        </div>
        <ul className="mt-4">
          {tasks.map((task, index) => (
            <li key={task.id} className="flex items-center bg-gray-100 p-3 rounded-lg mb-2">
              <span className="font-bold mr-2">{index + 1}.</span>
              <div className="flex-grow flex items-center">
                {editingTaskId === task.id ? (
                  <input 
                    type="text" 
                    value={editingTaskTitle} 
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="border p-2 rounded mr-2 flex-grow"
                  />
                ) : (
                  <span className="text-gray-700">{task.title}</span>
                )}
              </div>
              <div className="flex">
                {editingTaskId === task.id ? (
                  <>
                    <button onClick={() => editTask(task.id)} className="bg-green-500 hover:bg-green-600 text-white p-1 rounded mr-2">
                      Save
                    </button>
                    <button onClick={cancelEditing} className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(task)} className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded mr-2">
                      Edit
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 hover:bg-red-600 text-white p-1 rounded">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

export default App;
