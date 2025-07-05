import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

export interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}