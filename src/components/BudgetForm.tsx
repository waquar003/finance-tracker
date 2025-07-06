"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Budget } from '@/types/global';
import { CATEGORIES } from '@/types/constants';

interface BudgetFormProps {
  onSubmit: (budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => void;
  editingBudget?: Budget | null;
  onCancel?: () => void;
  usedCategories?: string[];
}

export default function BudgetForm({ onSubmit, editingBudget, onCancel, usedCategories = [] }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: editingBudget?.category || '',
    monthlyLimit: editingBudget?.monthlyLimit || 0,
    month: editingBudget?.month || new Date().toISOString().slice(0, 7),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = CATEGORIES.filter(cat => 
    !usedCategories.includes(cat) || cat === editingBudget?.category
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.monthlyLimit || formData.monthlyLimit <= 0) {
      newErrors.monthlyLimit = 'Monthly limit must be greater than 0';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!editingBudget) {
        setFormData({
          category: '',
          monthlyLimit: 0,
          month: new Date().toISOString().slice(0, 7),
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{editingBudget ? 'Edit Budget' : 'Set Budget'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleChange('category', value)}
              disabled={!!editingBudget}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Limit ($)</Label>
            <Input
              id="monthlyLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyLimit}
              onChange={(e) => handleChange('monthlyLimit', parseFloat(e.target.value) || 0)}
              className={errors.monthlyLimit ? 'border-red-500' : ''}
            />
            {errors.monthlyLimit && <p className="text-sm text-red-500">{errors.monthlyLimit}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => handleChange('month', e.target.value)}
              className={errors.month ? 'border-red-500' : ''}
            />
            {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : editingBudget ? 'Update' : 'Set Budget'}
            </Button>
            {editingBudget && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}