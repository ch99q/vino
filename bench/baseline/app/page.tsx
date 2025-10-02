import TodoApp from './components/TodoApp';

interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  categories: string[];
}

async function loadInitialData(): Promise<{ todos: Todo[], stats: Stats, categories: string[] }> {
  // Make the same 3 API calls as Vino react-ssr for fair comparison
  const baseUrl = process.env.NODE_ENV === 'production' ? 'http://localhost:8000' : 'http://localhost:8000';
  
  const [todosResponse, statsResponse, categoriesResponse] = await Promise.all([
    fetch(`${baseUrl}/api/todos`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/todos/stats/summary`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/categories`, { cache: 'no-store' })
  ]);
  
  const [todos, stats, categories] = await Promise.all([
    todosResponse.json(),
    statsResponse.json(),
    categoriesResponse.json()
  ]);
  
  return { todos, stats, categories };
}

export default async function Home() {
  const { todos, stats, categories } = await loadInitialData();

  return (
    <div>
      <div className="logo-header">
        <h1>Vino Todo</h1>
        <p className="tagline">Task Management Made Simple</p>
      </div>
      
      <div className="container">
        <TodoApp initialTodos={todos} initialStats={stats} initialCategories={categories} />
      </div>
    </div>
  );
}
