import { NextRequest, NextResponse } from 'next/server';
import { todos } from '../../../lib/data';

export async function GET() {
  const categories = [...new Set(todos.map(t => t.category))];
  return NextResponse.json(categories);
}