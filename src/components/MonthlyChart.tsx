"use client";

import { Transaction } from '@/types/global';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyChartProps {
  transactions: Transaction[];
}

export default function MonthlyChart({ transactions }: MonthlyChartProps) {
  const prepareChartData = () => {
    const monthlyData: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + transaction.amount;
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month + ' 1');
        const dateB = new Date(b.month + ' 1');
        return dateA.getTime() - dateB.getTime();
      });
  };

  const chartData = prepareChartData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data available for chart. Add some transactions to see monthly expenses.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
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
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Expenses']}
                  labelStyle={{ color: '#000' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#ef4444" 
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