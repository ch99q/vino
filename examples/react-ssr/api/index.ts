import { Hono } from "hono";
import { hc } from 'hono/client'

// In-memory data store
interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
let todos: Todo[] = [
  {
    id: 1,
    title: 'Set up development environment',
    description: 'Install Node.js, VS Code, and configure the workspace',
    completed: true,
    priority: 'high',
    category: 'Development',
    dueDate: '2025-09-28',
    createdAt: new Date('2025-09-25'),
    updatedAt: new Date('2025-09-28')
  },
  {
    id: 2,
    title: 'Design user interface mockups',
    description: 'Create wireframes and mockups for the main application screens',
    completed: false,
    priority: 'high',
    category: 'Design',
    dueDate: '2025-10-02',
    createdAt: new Date('2025-09-26'),
    updatedAt: new Date('2025-09-26')
  },
  {
    id: 3,
    title: 'Write API documentation',
    description: 'Document all API endpoints with request/response examples',
    completed: false,
    priority: 'medium',
    category: 'Documentation',
    dueDate: '2025-10-05',
    createdAt: new Date('2025-09-27'),
    updatedAt: new Date('2025-09-27')
  },
  {
    id: 4,
    title: 'Review code quality standards',
    description: 'Establish linting rules and code formatting guidelines',
    completed: false,
    priority: 'low',
    category: 'Development',
    createdAt: new Date('2025-09-28'),
    updatedAt: new Date('2025-09-28')
  },
  {
    id: 5,
    title: 'Plan project timeline',
    description: 'Break down tasks and estimate completion dates',
    completed: true,
    priority: 'high',
    category: 'Planning',
    dueDate: '2025-09-30',
    createdAt: new Date('2025-09-25'),
    updatedAt: new Date('2025-09-29')
  }
];

let nextTodoId = 6;

const app = new Hono()
  // Get all todos.
  .get('/todos', async (c) => {
    const category = c.req.query('category');
    const status = c.req.query('status');
    const priority = c.req.query('priority');

    let filteredTodos = todos;

    if (category && category !== 'all') {
      filteredTodos = filteredTodos.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }

    if (status) {
      const isCompleted = status === 'completed';
      filteredTodos = filteredTodos.filter(t => t.completed === isCompleted);
    }

    if (priority && priority !== 'all') {
      filteredTodos = filteredTodos.filter(t => t.priority === priority);
    }

    // Sort by priority (high -> medium -> low) then by due date
    filteredTodos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return c.json(filteredTodos);
  })

  // Get a single todo
  .get('/todos/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(todo);
  })

  // Create a new todo
  .post('/todos', async (c) => {
    const { title, description, priority = 'medium', category = 'General', dueDate } = await c.req.json();

    if (!title || !title.trim()) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const todo: Todo = {
      id: nextTodoId++,
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
      priority,
      category,
      dueDate: dueDate || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    todos.push(todo);
    return c.json(todo, 201);
  })

  // Update a todo
  .put('/todos/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const updates = await c.req.json();

    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    const todo = todos[todoIndex];
    const updatedTodo = {
      ...todo,
      ...updates,
      id, // Prevent ID from being changed
      updatedAt: new Date()
    };

    if (updatedTodo.title) {
      updatedTodo.title = updatedTodo.title.trim();
    }

    if (updatedTodo.description) {
      updatedTodo.description = updatedTodo.description.trim();
    }

    todos[todoIndex] = updatedTodo;
    return c.json(updatedTodo);
  })

  // Delete a todo
  .delete('/todos/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const todoIndex = todos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    todos.splice(todoIndex, 1);
    return c.json({ success: true });
  })

  // Toggle todo completion
  .patch('/todos/:id/toggle', async (c) => {
    const id = parseInt(c.req.param('id'));
    const todoIndex = todos.findIndex(t => t.id === id);

    if (todoIndex === -1) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    todos[todoIndex].completed = !todos[todoIndex].completed;
    todos[todoIndex].updatedAt = new Date();

    return c.json(todos[todoIndex]);
  })

  // Get todo statistics
  .get('/todos/stats/summary', async (c) => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const byPriority = {
      high: todos.filter(t => t.priority === 'high' && !t.completed).length,
      medium: todos.filter(t => t.priority === 'medium' && !t.completed).length,
      low: todos.filter(t => t.priority === 'low' && !t.completed).length
    };

    const categories = [...new Set(todos.map(t => t.category))];

    return c.json({
      total,
      completed,
      pending,
      overdue,
      byPriority,
      categories
    });
  })

  // Get categories
  .get('/categories', async (c) => {
    const categories = [...new Set(todos.map(t => t.category))];
    return c.json(categories);
  });

export type ApiType = typeof app;
export default app;

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

import { endTime, startTime } from "hono/timing";

// Request wrapper to measure timing of API calls during SSR. (Development only)
const requestWithTiming = (async (input: RequestInfo, init?: RequestInit) => {
  const c = globalThis.context;
  const id = Math.random().toString(16).slice(2, 10);
  const description = `${init?.method || "GET"} ${input.toString()}`;
  startTime(c, id, description);
  const res = await app.request(input, init);
  endTime(c, id);
  return res;
}) as typeof fetch;

export const api = import.meta.env.SSR ? hc<ApiType>('', { fetch: import.meta.env.PROD ? app.request : requestWithTiming }) : hc<ApiType>('/api');