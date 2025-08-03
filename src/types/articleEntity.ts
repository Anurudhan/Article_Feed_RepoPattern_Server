import mongoose, { Schema, Document } from 'mongoose';

export interface Author {
  name: string;
  avatar: string;
}
export interface createArticleEntity{
  title: string;
  content: string;
  authorId: string;
  publishedAt: string;
  category: string;
  image: string;
  tags: string[];
  readTime: number;
  isPublished?:boolean;
}
export interface Article {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  author?: Author;
  publishedAt: string;
  category: string;
  image: string;
  likes: string[];  
  dislikes: string[];
  blockedBy: string[];  
  readTime: number;
  views: string[];
  tags: string[];
  isPublished?:boolean;
  isDeleted?: boolean;
}
export interface Category {
  id: string;
  name: string;
  description: string;
}
export const ArticleCategory: Category[] = [
  {
    id: 'tech',
    name: 'Technology',
    description: 'Latest in gadgets, apps, and digital trends'
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Tips for healthy living and wellbeing'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Market updates, entrepreneurship, and career advice'
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discoveries, research, and innovation'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Movies, music, celebrities, and culture'
  },
  {
    id: 'travel',
    name: 'Travel',
    description: 'Destinations, travel tips, and experiences'
  },
  {
    id: 'food',
    name: 'Food & Cooking',
    description: 'Recipes, restaurant reviews, and culinary trends'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Games, athletes, and sporting events'
  },
  {
    id: 'politics',
    name: 'Politics',
    description: 'Policy updates, elections, and global affairs'
  }
];
