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

// Function to fetch weather data from a public API
const getWeather = async (
  latitude: number,
  longitude: number
): Promise<{ temperature: number | null; precipitation: number | null }> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation`
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching weather data: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    const temperature = data.current_weather?.temperature ?? null;
    let precipitation: number | null = null;
    if (
      data.hourly &&
      data.hourly.precipitation &&
      data.hourly.time &&
      data.current_weather?.time
    ) {
      const timeIndex = data.hourly.time.indexOf(data.current_weather.time);
      if (timeIndex !== -1) {
        precipitation = data.hourly.precipitation[timeIndex];
      } else if (Array.isArray(data.hourly.precipitation)) {
        precipitation =
          data.hourly.precipitation[data.hourly.precipitation.length - 1];
      }
    }
    return { temperature, precipitation };
  } catch (error) {
    console.error(error);
    console.dir(error, { depth: null });
    return { temperature: null, precipitation: null };
  }
};

// Function to fetch current hacker news from a public API
const getNews = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    if (!response.ok)
      throw new Error(
        `Error fetching news data: ${response.status} ${response.statusText}`
      );
    const storyIds: number[] = await response.json();
    const topStoryIds = storyIds.slice(0, 3).map(async (id) => {
      const storyResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return await storyResponse.json();
    });
    return topStoryIds;
  } catch (error) {
    console.error(error);
    console.dir(error, { depth: null });
    return [];
  }
};

// Function to suggest tasks based on weather conditions
function suggestTasks(weather: {
  temperature: number | null;
  precipitation: number | null;
}): string[] {
  if (weather.temperature === null || weather.precipitation === null)
    return ["No weather data available"];

  const suggestions: string[] = [];
  const celsius = weather.temperature;
  const mm = weather.precipitation;

  if (celsius > 20 && mm < 1) {
    suggestions.push("Go for a walk");
    suggestions.push("Have a picnic");
  } else if (celsius <= 20 && mm < 1) {
    suggestions.push("Visit a museum");
    suggestions.push("Go to a cafe");
  } else if (mm >= 1) {
    suggestions.push("Stay indoors and read a book");
    suggestions.push("Watch a movie");
  } else {
    suggestions.push("Check your other tasks and pick one!");
  }
  return suggestions;
}

// Dashboard to display weather, news, and task suggestions
const displayDashboard = async () => {
  console.log("============= Task Manager Dashboard =============");
  console.log("Tasks:");
  console.dir(listTasks(), { depth: null });

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

  const weather = await getWeather(59.3294, 18.0687); // Stockholm coordinates
  console.log("\nCurrent Weather in Stockholm:");
  if (weather.temperature !== null && weather.precipitation !== null) {
    console.log(
      `Temperature: ${weather.temperature}°C, Precipitation: ${weather.precipitation} mm`
    );
  } else {
    console.log("Weather data not available.");
  }
  // Suggest tasks based on weather
  const suggestions = suggestTasks(weather);
  console.log("\nTask Suggestions based on Weather:");
  suggestions.forEach((suggestion) => console.log(`- ${suggestion}`));
  // Fetch and display news
  const news = await getNews();
  console.log("\nTop Hacker News Stories:");
  news.forEach((storyPromise) => {
    storyPromise.then((story: any) => {
      if (story) {
        console.log(`- ${story.title} (URL: ${story.url})`);
      } else {
        console.log("Story data not available.");
      }
    });
  });
  console.log("==================================================");
};

addTask({ id: 1, task: "Learn TypeScript", completed: false });
addTask({ id: 2, task: "Build a project", completed: false });
addTask({ id: 3, task: "Review code", completed: true });

displayDashboard();
