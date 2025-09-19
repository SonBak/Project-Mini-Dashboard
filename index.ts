// TS interface for tasks
interface Task {
  id: number;
  task: string;
  completed: boolean;
}

// Interface for the weather API
interface WeatherResponse {
  temperature: number | null;
  precipitation: number | null;
}

// Interface for the news API
interface HackerNewsStory {
  id: number;
  title?: string;
  url?: string;
}

// Array to hold tasks
const tasks: Task[] = [];

// Function to add a new task
const addTask = (task: Task): void => {
  if (tasks.some((t) => t.id === task.id)) {
    console.error(`Task with ID ${task.id} already exists.`);
    return;
  }
  tasks.push(task);
};

// Function to list all tasks
const listTasks = (): void => {
  // If array is empty there are no tasks to list
  if (tasks.length === 0) {
    console.error("No tasks available.");
    return;
  }
  tasks.forEach((task) => {
    console.log(
      `ID: ${task.id}, Task: ${task.task}, Completed: ${task.completed}`
    );
  });
};

// Function to update a task by ID
const updateTask = (id: number, updatedTask: Partial<Task>): Task | null => {
  const task = tasks.find((task) => task.id === id);
  if (!task) {
    console.error(`Task with ID ${id} not found.`);
    return null;
  }
  Object.assign(task, updatedTask);
  return task;
};

// Function to delete a task by ID
const deleteTask = (id: number): boolean => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    console.error(`Task with ID ${id} not found.`);
    return false;
  }
  tasks.splice(index, 1);
  return true;
};

// Function to fetch weather data from a public API
const getWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherResponse> => {
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
    console.error("Error fetching weather data:");
    console.dir(error, { depth: null });
    return { temperature: null, precipitation: null };
  }
};

// Function to fetch current hacker news from a public API
const getNews = async (): Promise<HackerNewsStory[]> => {
  try {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    if (!response.ok)
      throw new Error(
        `Error fetching news data: ${response.status} ${response.statusText}`
      );
    const storyIds: number[] = await response.json();
    // Fetch details for the top 3 stories
    const topStoryPromises = storyIds.slice(0, 3).map(async (id) => {
      const storyResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return (await storyResponse.json()) as HackerNewsStory;
    });
    return await Promise.all(topStoryPromises);
  } catch (error) {
    console.error("Error fetching Hacker News:");
    console.dir(error, { depth: null });
    return [];
  }
};

// Function to suggest tasks based on weather conditions
function suggestTasks(weather: WeatherResponse): string[] {
  if (weather.temperature === null || weather.precipitation === null)
    return ["No weather data available"];

  const suggestions: string[] = [];
  const celsius = weather.temperature;
  const mm = weather.precipitation;

  // Simple logic for suggestions based on temperature and precipitation
  if (celsius > 15 && mm < 1) {
    suggestions.push("Go for a walk");
    suggestions.push("Have a picnic");
  } else if (celsius <= 15 && mm < 1) {
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

// Utility function to create a delay in logging
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Dashboard to display tasks, weather, news, and task suggestions
const displayDashboard = async () => {
  console.log("==================================================");
  console.log("============= Task Manager Dashboard =============");
  console.log("==================================================");
  console.log("Tasks:");
  listTasks();

  await delay(5000);
  console.log("\nUpdating Task with ID 2:");
  const updated = updateTask(2, { completed: true });
  await delay(1000);
  if (updated) {
    console.log("Updated Task:", updated);
  } else {
    console.error();
  }

  await delay(5000);
  console.log("\nDeleting Task with ID 1:");
  const deleted = deleteTask(1);
  await delay(1000);
  if (deleted) {
    console.log("Task deleted.");
  } else {
    console.error();
  }

  await delay(5000);
  console.log("\nAn updated task list:");
  listTasks();
  console.log("==================================================");

  await delay(10000);
  const weather: WeatherResponse = await getWeather(59.3294, 18.0687); // Stockholm coordinates
  console.log("\nCurrent Weather in Stockholm:");
  if (weather.temperature !== null && weather.precipitation !== null) {
    console.log(
      `Temperature: ${weather.temperature}°C, Precipitation: ${weather.precipitation} mm`
    );
  } else {
    console.error("Weather data not available.");
    console.log("==================================================");
  }
  // Suggest tasks based on weather
  await delay(2000);
  const suggestions = suggestTasks(weather);
  console.log("\nTask Suggestions based on the current weather:");
  suggestions.forEach((suggestion) => console.log(`- ${suggestion}`));
  console.log("==================================================");
  // Fetch and display news
  await delay(10000);
  const news: HackerNewsStory[] = await getNews();
  console.log("\nTop Hacker News stories for you to read:");
  news.forEach((story) => {
    if (story) {
      console.log(`- ${story.title} (URL: ${story.url})`);
    } else {
      console.error("News stories data not available.");
    }
  });
  console.log("==================================================");
};

// Tasks for demonstration
addTask({ id: 1, task: "Learn more about GitHub", completed: true });
addTask({ id: 2, task: "Build the project", completed: false });
addTask({ id: 3, task: "Presentation of project", completed: false });

// Display the dashboard with all the information
displayDashboard();
