'use client';

import { useState } from 'react';

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

interface TodoAppProps {
  initialTodos: Todo[];
  initialStats: Stats;
  initialCategories: string[];
}

export default function TodoApp({ initialTodos, initialStats, initialCategories }: TodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [categories] = useState<string[]>(initialCategories);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'General',
    dueDate: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB'); // Force consistent DD/MM/YYYY format
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

  const refreshData = async () => {
    const [todosResponse, statsResponse] = await Promise.all([
      fetch('/api/todos'),
      fetch('/api/todos/stats/summary')
    ]);
    
    const [updatedTodos, updatedStats] = await Promise.all([
      todosResponse.json(),
      statsResponse.json()
    ]);
    
    setTodos(updatedTodos);
    setStats(updatedStats);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    
    setLoading(true);
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo)
      });
      
      setNewTodo({ title: '', description: '', priority: 'medium', category: 'General', dueDate: '' });
      setShowAddForm(false);
      setMessage('Task created successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      await refreshData();
    } catch (error) {
      setMessage('Failed to create task');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}/toggle`, {
        method: 'PATCH'
      });
      
      setMessage('Task updated!');
      setTimeout(() => setMessage(''), 3000);
      
      await refreshData();
    } catch (error) {
      setMessage('Failed to update task');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });
      
      setMessage('Task deleted!');
      setTimeout(() => setMessage(''), 3000);
      
      await refreshData();
    } catch (error) {
      setMessage('Failed to delete task');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <>
      {/* Compact Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item stat-overdue">
          <span className="stat-number">{stats.overdue}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Add Task Form */}
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
              <div className="todo-card-header">
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
            <p>No tasks found. {showAddForm ? '' : 'Click "Add Task" to get started!'}</p>
          </div>
        )}
      </div>
    </>
  );
}