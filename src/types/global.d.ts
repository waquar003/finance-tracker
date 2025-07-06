import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

export interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  totalExpenses: number;
  totalTransactions: number;
  averageTransaction: number;
  categorySummary: CategorySummary[];
  recentTransactions: Transaction[];
}

export interface Budget {
  _id: string;
  category: string;
  monthlyLimit: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetComparison {
  category: string;
  budget: number;
  actual: number;
  difference: number;
  percentageUsed: number;
  status: 'over' | 'under' | 'exact';
}