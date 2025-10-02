import { NextRequest, NextResponse } from 'next/server';
import { todos } from '../../../../../lib/data';

export async function GET() {
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
  
  return NextResponse.json({
    total,
    completed,
    pending,
    overdue,
    byPriority,
    categories
  });
}