'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Budget, EXPENSE_CATEGORIES } from '@/types/transaction';
import { Save, X, Target, Calendar, DollarSign } from 'lucide-react';

interface BudgetFormProps {
  budget?: Budget | null;
  onSubmit: (budget: Omit<Budget, 'id'>) => void;
  onCancel: () => void;
  existingBudgets: Budget[];
}

export function BudgetForm({ budget, onSubmit, onCancel, existingBudgets }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount.toString() || '',
    month: budget?.month || new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    // Check for duplicate budget (same category and month)
    const isDuplicate = existingBudgets.some(b => 
      b.category === formData.category && 
      b.month === formData.month && 
      b.id !== budget?.id
    );

    if (isDuplicate) {
      newErrors.category = 'Budget already exists for this category and month';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      category: formData.category,
      amount: parseFloat(formData.amount),
      month: formData.month,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(category => {
    // If editing, allow the current category
    if (budget && budget.category === category) return true;
    
    // Otherwise, filter out categories that already have budgets for this month
    return !existingBudgets.some(b => 
      b.category === category && b.month === formData.month
    );
  });

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {budget ? 'Edit Budget' : 'Set Budget'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Month
              </Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => handleChange('month', e.target.value)}
                className={`transition-all duration-200 ${
                  errors.month ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.month && (
                <p className="text-sm text-red-500 mt-1">{errors.month}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Budget Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`transition-all duration-200 ${
                  errors.amount ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-slate-700">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger className={`transition-all duration-200 ${
                errors.category ? 'border-red-500' : 'border-slate-200'
              }`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category}</p>
            )}
            {availableCategories.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                All categories already have budgets for this month
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors duration-200"
              disabled={availableCategories.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {budget ? 'Update Budget' : 'Set Budget'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}