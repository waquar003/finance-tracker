import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';

export async function GET() {
  try {
    await connectDB();
    const budgets = await Budget.find({}).sort({ category: 1 });
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.category || !body.monthlyLimit || body.monthlyLimit <= 0) {
      return NextResponse.json(
        { error: 'Category and valid monthly limit are required' },
        { status: 400 }
      );
    }

    const budget = new Budget(body);
    await budget.save();
    
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Budget already exists for this category' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}