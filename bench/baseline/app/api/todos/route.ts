import { NextRequest, NextResponse } from 'next/server';
import { todos } from '../../../lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  
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
  
  return NextResponse.json(filteredTodos);
}

export async function POST(request: NextRequest) {
  const { title, description, priority = 'medium', category = 'General', dueDate } = await request.json();
  
  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  
  const { nextTodoId, setTodos, setNextTodoId } = await import('../../../lib/data');
  
  const todo = {
    id: nextTodoId,
    title: title.trim(),
    description: description?.trim() || undefined,
    completed: false,
    priority,
    category,
    dueDate: dueDate || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  todos.push(todo);
  setNextTodoId(nextTodoId + 1);
  
  return NextResponse.json(todo, { status: 201 });
}