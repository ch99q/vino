import { NextRequest, NextResponse } from 'next/server';
import { todos } from '../../../../lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todoId = parseInt(id);
  const todo = todos.find(t => t.id === todoId);
  
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  
  return NextResponse.json(todo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todoId = parseInt(id);
  const updates = await request.json();
  
  const todoIndex = todos.findIndex(t => t.id === todoId);
  if (todoIndex === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  
  const todo = todos[todoIndex];
  const updatedTodo = {
    ...todo,
    ...updates,
    id: todoId, // Prevent ID from being changed
    updatedAt: new Date().toISOString()
  };
  
  if (updatedTodo.title) {
    updatedTodo.title = updatedTodo.title.trim();
  }
  
  if (updatedTodo.description) {
    updatedTodo.description = updatedTodo.description.trim();
  }
  
  todos[todoIndex] = updatedTodo;
  return NextResponse.json(updatedTodo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todoId = parseInt(id);
  const todoIndex = todos.findIndex(t => t.id === todoId);
  
  if (todoIndex === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  
  todos.splice(todoIndex, 1);
  return NextResponse.json({ success: true });
}