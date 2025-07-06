import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Missing budget ID' }, { status: 400 });
    }

    if (!body.category) {
      const existingBudget = await Budget.findById(id);
      if (!existingBudget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
      body.category = existingBudget.category;
    }

    const budget = await Budget.findByIdAndUpdate(id, body, { new: true });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    const err = error as Error;
    console.error('PUT /api/budgets/[id] error:', err.message);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Missing budget ID' }, { status: 400 });
    }

    const budget = await Budget.findByIdAndDelete(id);

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    const err = error as Error;
    console.error('DELETE /api/budgets/[id] error:', err.message);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
