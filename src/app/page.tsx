"use client";

import { useState, useEffect } from 'react';
import { Transaction, Budget } from '@/types/global';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyChart from '@/components/MonthlyChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import Dashboard from '@/components/Dashboard';
import BudgetForm from '@/components/BudgetForm';
import BudgetList from '@/components/BudgetList';
import BudgetComparisonChart from '@/components/BudgetComparisonChart';
import BudgetStatusCards from '@/components/BudgetStatusCards';
import SpendingInsights from '@/components/SpendingInsights';
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast, Toaster } from 'sonner'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to load transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      setIsBudgetLoading(true);
      const response = await fetch('/api/budgets');
      if (!response.ok) throw new Error('Failed to fetch budgets');

      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error("Failed to load budgets. Please try again.");
    } finally {
      setIsBudgetLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add transaction');
      }

      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);

      toast.success("Transaction added successfully!");
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add transaction");
    }
  };

  const handleEditTransaction = async (transactionData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update transaction');
      }

      const updatedTransaction = await response.json();
      setTransactions(prev =>
        prev.map(t => t._id === editingTransaction._id ? updatedTransaction : t)
      );
      setEditingTransaction(null);

      toast.success("Transaction updated successfully!");
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete transaction');
      }

      setTransactions(prev => prev.filter(t => t._id !== id));

      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(error instanceof Error ? error.message : "Failed to delete transaction");
    }
  };

  const handleAddBudget = async (budgetData: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add budget');
      }

      const newBudget = await response.json();
      setBudgets(prev => [newBudget, ...prev]);

      toast.success("Budget set successfully!");
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error(error instanceof Error ? error.message : "Failed to set budget");
    }
  };

  const handleEditBudget = async (budgetData: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBudget) return;

    try {
      const response = await fetch(`/api/budgets/${editingBudget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update budget');
      }

      const updatedBudget = await response.json();
      setBudgets(prev =>
        prev.map(b => b._id === editingBudget._id ? updatedBudget : b)
      );
      setEditingBudget(null);

      toast.success("Budget updated successfully!");
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update budget");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete budget');
      }

      setBudgets(prev => prev.filter(b => b._id !== id));

      toast.success("Budget deleted successfully!");
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error(error instanceof Error ? error.message : "Failed to delete budget");
    }
  };

  const handleTransactionSubmit = editingTransaction ? handleEditTransaction : handleAddTransaction;
  const handleBudgetSubmit = editingBudget ? handleEditBudget : handleAddBudget;

  const usedBudgetCategories = budgets.map(b => b.category);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Personal Finance Tracker
            </h1>
            <p className="text-gray-600">
              Track your expenses, categorize spending, set budgets, and visualize your financial patterns
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="add">Add Transaction</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard transactions={transactions} budgets={budgets}/>
              <BudgetStatusCards transactions={transactions} budgets={budgets} />
            </TabsContent>

            <TabsContent value="add" className="space-y-6">
              <div className="max-w-md mx-auto">
                <TransactionForm
                  onSubmit={handleTransactionSubmit}
                  editingTransaction={editingTransaction}
                  onCancel={() => setEditingTransaction(null)}
                />
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionList
                transactions={transactions}
                onEdit={setEditingTransaction}
                onDelete={handleDeleteTransaction}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetForm
                  onSubmit={handleBudgetSubmit}
                  editingBudget={editingBudget}
                  onCancel={() => setEditingBudget(null)}
                  usedCategories={usedBudgetCategories}
                />
                <BudgetList
                  budgets={budgets}
                  onEdit={setEditingBudget}
                  onDelete={handleDeleteBudget}
                  isLoading={isBudgetLoading}
                />
              </div>
              <BudgetComparisonChart transactions={transactions} budgets={budgets} />
              <SpendingInsights transactions={transactions} budgets={budgets} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyChart transactions={transactions} />
                <CategoryPieChart transactions={transactions} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster richColors /> 
    </ErrorBoundary>
  );
}