import mongoose from 'mongoose';
import { CATEGORIES } from '@/types/constants';

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: CATEGORIES,
    unique: true, // One budget per category
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: String,
    required: true,
    default: () => new Date().toISOString().slice(0, 7), // YYYY-MM format
  },
}, {
  timestamps: true,
});

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);