import type { Category } from '../types/expense';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#C4664B', // Terracotta / Clay
    bgColor: '#FAECE8',
    budgetInCents: 1500000, // ₹15,000 / $150.00
    isDefault: true,
  },
  {
    id: 'cat_transport',
    name: 'Transport',
    icon: 'Car',
    color: '#4B6B94', // Dusty Slate Blue
    bgColor: '#EBF0F7',
    budgetInCents: 600000, // ₹6,000 / $60.00
    isDefault: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#C98A2C', // Ochre
    bgColor: '#FAF3E6',
    budgetInCents: 1000000, // ₹10,000
    isDefault: true,
  },
  {
    id: 'cat_bills',
    name: 'Bills & Utilities',
    icon: 'Receipt',
    color: '#2D5A4A', // Forest Green
    bgColor: '#EBF3F0',
    budgetInCents: 800000, // ₹8,000
    isDefault: true,
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#7E527F', // Dusty Plum
    bgColor: '#F6EEF6',
    budgetInCents: 500000, // ₹5,000
    isDefault: true,
  },
  {
    id: 'cat_health',
    name: 'Health & Fitness',
    icon: 'HeartPulse',
    color: '#5A7D69', // Sage Green
    bgColor: '#EEF5F1',
    budgetInCents: 400000, // ₹4,000
    isDefault: true,
  },
  {
    id: 'cat_other',
    name: 'Other',
    icon: 'Tag',
    color: '#6E6A66', // Warm Stone / Taupe
    bgColor: '#F3F1EE',
    budgetInCents: 300000, // ₹3,000
    isDefault: true,
  },
];

export const PALETTE_COLORS = [
  { hex: '#C4664B', bg: '#FAECE8', name: 'Terracotta' },
  { hex: '#4B6B94', bg: '#EBF0F7', name: 'Slate Blue' },
  { hex: '#C98A2C', bg: '#FAF3E6', name: 'Ochre' },
  { hex: '#2D5A4A', bg: '#EBF3F0', name: 'Forest' },
  { hex: '#7E527F', bg: '#F6EEF6', name: 'Plum' },
  { hex: '#5A7D69', bg: '#EEF5F1', name: 'Sage' },
  { hex: '#6E6A66', bg: '#F3F1EE', name: 'Taupe' },
  { hex: '#B06528', bg: '#FAF0E6', name: 'Amber' },
  { hex: '#387B80', bg: '#EAF4F5', name: 'Teal' },
  { hex: '#B56172', bg: '#FAEDF0', name: 'Dusty Rose' },
  { hex: '#4E598C', bg: '#ECEEF7', name: 'Indigo' },
  { hex: '#6B7A38', bg: '#F2F5E8', name: 'Olive' },
];

export const AVAILABLE_ICONS = [
  'Utensils', 'Car', 'ShoppingBag', 'Receipt', 'Film', 'HeartPulse', 
  'Tag', 'Coffee', 'Plane', 'BookOpen', 'Laptop', 'Home', 
  'Gift', 'Dumbbell', 'Briefcase', 'Sparkles', 'Music', 'Camera'
];
