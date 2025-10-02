import { NextRequest, NextResponse } from 'next/server';
import { todos } from '../../../../../lib/data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todoId = parseInt(id);
  const todoIndex = todos.findIndex(t => t.id === todoId);
  
  if (todoIndex === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  
  todos[todoIndex].completed = !todos[todoIndex].completed;
  todos[todoIndex].updatedAt = new Date().toISOString();
  
  return NextResponse.json(todos[todoIndex]);
}