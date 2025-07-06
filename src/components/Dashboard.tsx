"use client";

import { Transaction, CategorySummary, Budget } from '@/types/global';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Activity, Target, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budgets?: Budget[];
}

export default function Dashboard({ transactions, budgets = [] }: DashboardProps) {
  const calculateStats = () => {
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

    // Category summary
    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { amount: 0, count: 0 };
      }
      categoryTotals[transaction.category].amount += transaction.amount;
      categoryTotals[transaction.category].count += 1;
    });

    const categorySummary: CategorySummary[] = Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5);

    return {
      totalExpenses,
      totalTransactions,
      averageTransaction,
      categorySummary,
      recentTransactions,
    };
  };

  const calculateBudgetPerformance = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth)
    );
    
    // Calculate current month spending by category
    const currentMonthSpending: Record<string, number> = {};
    currentMonthTransactions.forEach(transaction => {
      currentMonthSpending[transaction.category] = 
        (currentMonthSpending[transaction.category] || 0) + transaction.amount;
    });

    // Filter budgets for current month
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    
    // Calculate total budget
    const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    
    // Calculate total spent (current month only)
    const totalSpent = Object.values(currentMonthSpending).reduce((sum, val) => sum + val, 0);
    
    // Calculate budget utilization percentage
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Count categories over budget
    const categoriesOverBudget = currentMonthBudgets.filter(budget => {
      const spent = currentMonthSpending[budget.category] || 0;
      return spent > budget.monthlyLimit;
    }).length;

    // Count categories with budgets
    const categoriesWithBudgets = currentMonthBudgets.length;

    // Calculate remaining budget
    const remainingBudget = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      budgetUtilization,
      categoriesOverBudget,
      categoriesWithBudgets,
      remainingBudget,
      currentMonth,
    };
  };

  const stats = calculateStats();
  const budgetPerformance = calculateBudgetPerformance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (monthString: string) => {
    return new Date(monthString + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Personal Care': 'bg-teal-100 text-teal-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getBudgetUtilizationColor = (percentage: number) => {
    if (percentage <= 80) return 'text-green-600';
    if (percentage <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Transaction</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.averageTransaction)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{stats.categorySummary.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Performance Cards (only show if budgets exist) */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Budget</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(budgetPerformance.totalBudget)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Spent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(budgetPerformance.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatMonth(budgetPerformance.currentMonth)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Used</p>
                  <p className={`text-2xl font-bold ${getBudgetUtilizationColor(budgetPerformance.budgetUtilization)}`}>
                    {budgetPerformance.budgetUtilization.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${getBudgetUtilizationColor(budgetPerformance.budgetUtilization)}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Over Budget</p>
                  <p className="text-2xl font-bold text-red-600">
                    {budgetPerformance.categoriesOverBudget}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {budgetPerformance.categoriesWithBudgets} categories
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Summary (only show if budgets exist) */}
      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary - {formatMonth(budgetPerformance.currentMonth)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(budgetPerformance.totalBudget)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(budgetPerformance.totalSpent)}
                </p>
              </div>
              <div className={`text-center p-4 rounded-lg ${
                budgetPerformance.remainingBudget >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-sm font-medium ${
                  budgetPerformance.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {budgetPerformance.remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                </p>
                <p className={`text-2xl font-bold ${
                  budgetPerformance.remainingBudget >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatCurrency(Math.abs(budgetPerformance.remainingBudget))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categorySummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories to display
              </div>
            ) : (
              <div className="space-y-4">
                {stats.categorySummary.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(category.category)}>
                        {category.category}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        ({category.count} transactions)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(category.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent transactions
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{transaction.description}</span>
                        <Badge className={getCategoryColor(transaction.category)} variant="outline">
                          {transaction.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}