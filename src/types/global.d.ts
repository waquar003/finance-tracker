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