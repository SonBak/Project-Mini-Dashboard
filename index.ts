// TS interface for tasks
interface Task {
  id: number;
  task: string;
  completed: boolean;
}

// Array to hold tasks
const tasks: Task[] = [];

// Function to add a new task
function addTask(task: Task): void {
  tasks.push(task);
}

// Function to list all tasks
function listTasks(): void {
  if (tasks.length === 0) {
    console.log("No tasks available.");
    return;
  }
  tasks.forEach((task) => {
    console.log(
      `ID: ${task.id}, Task: ${task.task}, Completed: ${task.completed}`
    );
  });
}

// Function to update a task by ID
function updateTask(id: number, updatedTask: Partial<Task>): Task | null {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    Object.assign(task, updatedTask);
    return task;
  }
  return null;
}

// Function to delete a task by ID
function deleteTask(id: number): boolean {
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
    return true;
  }
  return false;
}

addTask({ id: 1, task: "Learn TypeScript", completed: false });
addTask({ id: 2, task: "Build a project", completed: false });
addTask({ id: 3, task: "Review code", completed: true });

console.log("All Tasks:");
listTasks();

console.log("\nUpdating Task with ID 2:");
const updated = updateTask(2, { completed: true });
if (updated) {
  console.log("Updated Task:", updated);
} else {
  console.log("Task not found.");
}

console.log("\nDeleting Task with ID 1:");
const deleted = deleteTask(1);
console.log(deleted ? "Task deleted." : "Task not found.");

console.log("\nAll Tasks after update and delete:");
listTasks();
