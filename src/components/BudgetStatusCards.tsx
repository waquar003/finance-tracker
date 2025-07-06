"use client";

import { Transaction, Budget } from '@/types/global';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface BudgetStatusCardsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function BudgetStatusCards({ transactions, budgets }: BudgetStatusCardsProps) {
  const calculateBudgetStatus = () => {
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
    
    let overBudget = 0;
    let underBudget = 0;
    let onTrack = 0;
    
    currentBudgets.forEach(budget => {
      const actual = actualSpending[budget.category] || 0;
      const percentage = (actual / budget.monthlyLimit) * 100;
      
      if (percentage > 100) {
        overBudget++;
      } else if (percentage < 80) {
        underBudget++;
      } else {
        onTrack++;
      }
    });

    return { overBudget, underBudget, onTrack };
  };

  const { overBudget, underBudget, onTrack } = calculateBudgetStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Over Budget</p>
              <p className="text-2xl font-bold text-red-600">{overBudget}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-yellow-600">{onTrack}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Under Budget</p>
              <p className="text-2xl font-bold text-green-600">{underBudget}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}