"use client";

import { Transaction, Budget } from '@/types/global';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const generateInsights = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
    // Current month spending by category
    const currentSpending: Record<string, number> = {};
    transactions
      .filter(t => t.date.startsWith(currentMonth))
      .forEach(transaction => {
        currentSpending[transaction.category] = (currentSpending[transaction.category] || 0) + transaction.amount;
      });

    // Last month spending by category
    const lastMonthSpending: Record<string, number> = {};
    transactions
      .filter(t => t.date.startsWith(lastMonth))
      .forEach(transaction => {
        lastMonthSpending[transaction.category] = (lastMonthSpending[transaction.category] || 0) + transaction.amount;
      });

    // Get current month budgets
    const currentBudgets = budgets.filter(b => b.month === currentMonth);
    
    const insights = [];

    // 1. Categories over budget
    const overBudgetCategories = currentBudgets.filter(budget => {
      const actual = currentSpending[budget.category] || 0;
      return actual > budget.monthlyLimit;
    });

    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Over Budget Alert',
        description: `You're over budget in ${overBudgetCategories.length} categories`,
        details: overBudgetCategories.map(b => b.category).join(', '),
        icon: AlertCircle,
      });
    }

    // 2. Biggest spending increase
    let biggestIncrease = { category: '', increase: 0, percentage: 0 };
    Object.keys(currentSpending).forEach(category => {
      const current = currentSpending[category];
      const last = lastMonthSpending[category] || 0;
      const increase = current - last;
      const percentage = last > 0 ? (increase / last) * 100 : 0;
      
      if (increase > biggestIncrease.increase && percentage > 20) {
        biggestIncrease = { category, increase, percentage };
      }
    });

    if (biggestIncrease.category) {
      insights.push({
        type: 'info',
        title: 'Spending Increase',
        description: `${biggestIncrease.category} spending increased by ${biggestIncrease.percentage.toFixed(0)}%`,
        details: `+$${biggestIncrease.increase.toFixed(2)} from last month`,
        icon: TrendingUp,
      });
    }

    // 3. Best performing category (most under budget)
    let bestPerforming = { category: '', saved: 0, percentage: 0 };
    currentBudgets.forEach(budget => {
      const actual = currentSpending[budget.category] || 0;
      const saved = budget.monthlyLimit - actual;
      const percentage = (saved / budget.monthlyLimit) * 100;
      
      if (saved > bestPerforming.saved && percentage > 20) {
        bestPerforming = { category: budget.category, saved, percentage };
      }
    });

    if (bestPerforming.category) {
      insights.push({
        type: 'success',
        title: 'Great Job!',
        description: `${bestPerforming.category} is ${bestPerforming.percentage.toFixed(0)}% under budget`,
        details: `Saved $${bestPerforming.saved.toFixed(2)} this month`,
        icon: Target,
      });
    }

    // 4. Total spending trend
    const totalCurrent = Object.values(currentSpending).reduce((sum, val) => sum + val, 0);
    const totalLast = Object.values(lastMonthSpending).reduce((sum, val) => sum + val, 0);
    const totalChange = totalCurrent - totalLast;
    const totalChangePercentage = totalLast > 0 ? (totalChange / totalLast) * 100 : 0;

    if (Math.abs(totalChangePercentage) > 10) {
      insights.push({
        type: totalChange > 0 ? 'warning' : 'success',
        title: 'Monthly Spending Trend',
        description: `Total spending ${totalChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(totalChangePercentage).toFixed(0)}%`,
        details: `${totalChange > 0 ? '+' : ''}$${totalChange.toFixed(2)} from last month`,
        icon: totalChange > 0 ? TrendingUp : TrendingDown,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-red-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No insights available yet. Add more transactions and budgets to see personalized insights.
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`h-6 w-6 ${getIconColor(insight.type)} mt-1`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      {insight.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {insight.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}