import React, { useState } from 'react';
import { Container } from '../../components/container';

interface Task {
  id: number;
  title: string;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>("");

  const addTask = (): void => {
    if (newTask) {
      setTasks([...tasks, { id: Date.now(), title: newTask }]);
      setNewTask("");
    }
  };

  const startEditing = (task: Task): void => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditing = (): void => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const editTask = (taskId: number): void => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, title: editingTaskTitle } : task));
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const deleteTask = (taskId: number): void => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <Container>
      <div className="p-6">
      <h1 className="text-2xl font-bold">My To-Do List</h1>
      <div className="mt-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="border p-2 rounded mr-2"
        />
        <button onClick={addTask} className="bg-blue-500 text-white p-2 rounded">
          Add Task
        </button>
      </div>
      <ul className="mt-4">
        {tasks.map(task => (
          <li key={task.id} className="flex justify-between items-center mt-2">
            {editingTaskId === task.id ? (
              <input 
                type="text" 
                value={editingTaskTitle} 
                onChange={(e) => setEditingTaskTitle(e.target.value)}
                className="border p-2 rounded mr-2"
              />
            ) : (
              <span>{task.title}</span>
            )}
            <div>
              {editingTaskId === task.id ? (
                <>
                  <button onClick={() => editTask(task.id)} className="bg-green-500 text-white p-1 rounded mr-2">
                    Save
                  </button>
                  <button onClick={cancelEditing} className="bg-gray-500 text-white p-1 rounded">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditing(task)} className="bg-yellow-500 text-white p-1 rounded mr-2">
                    Edit
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">
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
