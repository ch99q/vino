
import { useState, useEffect } from "react";
import { Head, useLoaderData } from "../jsx/context";
import { Layout } from "./components/layout";

import { api } from "../api";

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

export async function loader({ request }: { request?: Request } = {}) {
  // Default filters for initial load
  let category = 'all';
  let status = 'all';
  let priority = 'all';
  
  // Parse URL parameters if request is available
  if (request) {
    const url = new URL(request.url);
    category = url.searchParams.get('category') || 'all';
    status = url.searchParams.get('status') || 'all';
    priority = url.searchParams.get('priority') || 'all';
  }
  
  const [todos, stats, categories] = await Promise.all([
    api.todos.$get({ 
      query: { 
        category: category === 'all' ? undefined : category,
        status: status === 'all' ? undefined : status,
        priority: priority === 'all' ? undefined : priority
      } 
    }).then(res => res.json()),
    api.todos.stats.summary.$get().then(res => res.json()),
    api.categories.$get().then(res => res.json())
  ]);
  
  return { todos, stats, categories, filters: { category, status, priority } };
}

export default function TodoApp() {
  const initialData = useLoaderData<typeof loader>();
  const [todos, setTodos] = useState<Todo[]>(initialData?.todos || []);
  const [stats, setStats] = useState<Stats>(initialData?.stats);
  const [categories, setCategories] = useState<string[]>(initialData?.categories || []);
  const [filters, setFilters] = useState(initialData?.filters || { category: 'all', status: 'all', priority: 'all' });
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 'medium', category: 'General', dueDate: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate?: string, completed?: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    
    setLoading(true);
    try {
      await api.todos.$post({ json: newTodo });
      setNewTodo({ title: '', description: '', priority: 'medium', category: 'General', dueDate: '' });
      setShowAddForm(false);
      setMessage('Task created successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh todos
      const [updatedTodos, updatedStats] = await Promise.all([
        api.todos.$get().then(res => res.json()),
        api.todos.stats.summary.$get().then(res => res.json())
      ]);
      setTodos(updatedTodos);
      setStats(updatedStats);
    } catch (error) {
      setMessage('Failed to create task');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      await api.todos[':id'].toggle.$patch({ param: { id: id.toString() } });
      setMessage('Task updated!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh todos
      const [updatedTodos, updatedStats] = await Promise.all([
        api.todos.$get().then(res => res.json()),
        api.todos.stats.summary.$get().then(res => res.json())
      ]);
      setTodos(updatedTodos);
      setStats(updatedStats);
    } catch (error) {
      setMessage('Failed to update task');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.todos[':id'].$delete({ param: { id: id.toString() } });
      setMessage('Task deleted!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh todos
      const [updatedTodos, updatedStats] = await Promise.all([
        api.todos.$get().then(res => res.json()),
        api.todos.stats.summary.$get().then(res => res.json())
      ]);
      setTodos(updatedTodos);
      setStats(updatedStats);
    } catch (error) {
      setMessage('Failed to delete task');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    // If no initial data (client-side navigation), fetch todos
    if (!initialData?.todos?.length) {
      setLoading(true);
      Promise.all([
        api.todos.$get().then(res => res.json()),
        api.todos.stats.summary.$get().then(res => res.json()),
        api.categories.$get().then(res => res.json())
      ]).then(([todos, stats, categories]) => {
        setTodos(todos);
        setStats(stats);
        setCategories(categories);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>Vino Todo - Task Management Made Simple</title>
      </Head>

      {/* Compact Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stats?.total || 0}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats?.pending || 0}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats?.completed || 0}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item stat-overdue">
          <span className="stat-number">{stats?.overdue || 0}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Add Task Form (shown when toggled) */}
      {showAddForm && (
        <div className="add-todo-section">
          <form className="add-todo-form" onSubmit={handleAddTodo}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Task title..."
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                required
              />
              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Category"
                value={newTodo.category}
                onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
              />
              <input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
              />
            </div>
            
            <textarea
              placeholder="Description (optional)..."
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              rows={2}
            />
            
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* Todo List */}
      <div className="todo-section">
        <div className="todo-header">
          <h2>Tasks ({todos.length})</h2>
          <button 
            className="add-task-inline-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '× Cancel' : '+ Add Task'}
          </button>
        </div>
        <div className="todo-list">
          {todos.map(todo => (
            <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''} ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}>
              <div className="todo-header">
                <button
                  className="toggle-btn"
                  onClick={() => handleToggleTodo(todo.id)}
                >
                  {todo.completed ? '✓' : '○'}
                </button>
                
                <div className="todo-content">
                  <h3 className="todo-title">{todo.title}</h3>
                  {todo.description && <p className="todo-description">{todo.description}</p>}
                  
                  <div className="todo-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(todo.priority) }}
                    >
                      {todo.priority}
                    </span>
                    <span className="category-badge">{todo.category}</span>
                    {todo.dueDate && (
                      <span className={`due-date ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}>
                        Due: {formatDate(todo.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {todos.length === 0 && (
          <div className="empty-state">
            <p>No tasks found. {showAddForm ? '' : 'Click "Add New Task" to get started!'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
