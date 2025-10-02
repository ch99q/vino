// In-memory data store
export interface Todo {
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

// Mock data
export let todos: Todo[] = [
  {
    id: 1,
    title: 'Set up development environment',
    description: 'Install Node.js, VS Code, and configure the workspace',
    completed: true,
    priority: 'high',
    category: 'Development',
    dueDate: '2025-09-28',
    createdAt: '2025-09-25T00:00:00.000Z',
    updatedAt: '2025-09-28T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'Design user interface mockups',
    description: 'Create wireframes and mockups for the main application screens',
    completed: false,
    priority: 'high',
    category: 'Design',
    dueDate: '2025-10-02',
    createdAt: '2025-09-26T00:00:00.000Z',
    updatedAt: '2025-09-26T00:00:00.000Z'
  },
  {
    id: 3,
    title: 'Write API documentation',
    description: 'Document all API endpoints with request/response examples',
    completed: false,
    priority: 'medium',
    category: 'Documentation',
    dueDate: '2025-10-05',
    createdAt: '2025-09-27T00:00:00.000Z',
    updatedAt: '2025-09-27T00:00:00.000Z'
  },
  {
    id: 4,
    title: 'Review code quality standards',
    description: 'Establish linting rules and code formatting guidelines',
    completed: false,
    priority: 'low',
    category: 'Development',
    createdAt: '2025-09-28T00:00:00.000Z',
    updatedAt: '2025-09-28T00:00:00.000Z'
  },
  {
    id: 5,
    title: 'Plan project timeline',
    description: 'Break down tasks and estimate completion dates',
    completed: true,
    priority: 'high',
    category: 'Planning',
    dueDate: '2025-09-30',
    createdAt: '2025-09-25T00:00:00.000Z',
    updatedAt: '2025-09-29T00:00:00.000Z'
  }
];

export let nextTodoId = 6;

export function setTodos(newTodos: Todo[]) {
  todos = newTodos;
}

export function setNextTodoId(id: number) {
  nextTodoId = id;
}