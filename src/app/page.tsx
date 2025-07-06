"use client";

import { useState, useEffect } from 'react';
import { Transaction } from '@/types/global';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyChart from '@/components/MonthlyChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import Dashboard from '@/components/Dashboard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast, Toaster } from 'sonner'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
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

  const handleSubmit = editingTransaction ? handleEditTransaction : handleAddTransaction;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Personal Finance Tracker
            </h1>
            <p className="text-gray-600">
              Track your expenses, categorize spending, and visualize your financial patterns
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="add">Add Transaction</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard transactions={transactions} />
            </TabsContent>

            <TabsContent value="add" className="space-y-6">
              <div className="max-w-md mx-auto">
                <TransactionForm
                  onSubmit={handleSubmit}
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
