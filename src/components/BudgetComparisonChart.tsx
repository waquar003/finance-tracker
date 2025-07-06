"use client";

import { Transaction, Budget } from '@/types/global';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BudgetComparisonChartProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function BudgetComparisonChart({ transactions, budgets }: BudgetComparisonChartProps) {
  const prepareComparisonData = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Calculate actual spending by category for current month
    const actualSpending: Record<string, number> = {};
    transactions
      .filter(t => t.date.startsWith(currentMonth))
      .forEach(transaction => {
        actualSpending[transaction.category] = (actualSpending[transaction.category] || 0) + transaction.amount;
      });

    // Get budgets for current month
    const currentBudgets = budgets.filter(b => b.month === currentMonth);
    
    // Create comparison data
    const comparisonData = currentBudgets.map(budget => ({
      category: budget.category,
      budget: budget.monthlyLimit,
      actual: actualSpending[budget.category] || 0,
      difference: budget.monthlyLimit - (actualSpending[budget.category] || 0),
      percentageUsed: ((actualSpending[budget.category] || 0) / budget.monthlyLimit) * 100,
    }));

    return comparisonData.sort((a, b) => b.percentageUsed - a.percentageUsed);
  };

  const comparisonData = prepareComparisonData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budget = payload.find((p: any) => p.dataKey === 'budget')?.value || 0;
      const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const percentage = budget > 0 ? (actual / budget * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">
            Budget: {formatCurrency(budget)}
          </p>
          <p className="text-sm text-red-600">
            Actual: {formatCurrency(actual)}
          </p>
          <p className="text-sm text-gray-600">
            Used: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        {comparisonData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No budget comparison data available. Set budgets and add transactions to see the comparison.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="budget" 
                  fill="#22c55e" 
                  name="Budget"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="actual" 
                  fill="#ef4444" 
                  name="Actual"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}