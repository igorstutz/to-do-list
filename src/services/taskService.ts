// src/services/taskService.ts

import { db } from './firebaseConnection';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export const loadUserTasks = async (userId: string) => {
  const tasksCollection = collection(db, 'tasks');
  const q = query(tasksCollection, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return tasks;
};

export const addTask = async (userId: string, title: string) => {
  await addDoc(collection(db, 'tasks'), {
    userId,
    title
  });
};

// Você pode adicionar aqui outras funções para editar e excluir tarefas
