import { db } from './firebaseConnection';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
}

// Adiciona uma nova tarefa no Firestore
export const addTask = async (taskTitle: string, userId: string) => {
  try {
    await addDoc(collection(db, "tasks"), {
      title: taskTitle,
      userId: userId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Error adding task: ", error);
    throw error;
  }
};

// Atualiza uma tarefa existente
export const updateTask = async (taskId: string, newTitle: string) => {
  try {
    const taskDoc = doc(db, "tasks", taskId);
    await updateDoc(taskDoc, {
      title: newTitle
    });
  } catch (error) {
    console.error("Error updating task: ", error);
    throw error;
  }
};

// Deleta uma tarefa
export const deleteTask = async (taskId: string) => {
  try {
    const taskDoc = doc(db, "tasks", taskId);
    await deleteDoc(taskDoc);
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw error;
  }
};

// Carrega as tarefas do usuário
export const loadUserTasks = (userId: string, setTasks: (tasks: Task[]) => void): (() => void) => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const taskData = doc.data() as Omit<Task, 'id'>; // Assume que taskData não inclui 'id'
        tasks.push({ id: doc.id, ...taskData });
      });
      setTasks(tasks);
    });
  
    return unsubscribe;
  };
  
  