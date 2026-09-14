import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  Tag,
  Coffee,
  Plane,
  BookOpen,
  Laptop,
  Home,
  Gift,
  Dumbbell,
  Briefcase,
  Sparkles,
  Music,
  Camera,
  Folder,
  CircleDollarSign,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  Tag,
  Coffee,
  Plane,
  BookOpen,
  Laptop,
  Home,
  Gift,
  Dumbbell,
  Briefcase,
  Sparkles,
  Music,
  Camera,
  Folder,
  CircleDollarSign,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent {...props} />;
};
