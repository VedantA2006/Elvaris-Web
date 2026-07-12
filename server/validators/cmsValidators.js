import { z } from 'zod';

export const indicatorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  slug: z.string().min(2, 'Slug must be at least 2 characters long').toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  category: z.array(z.string()).min(1, 'At least one category is required'),
  tradingStyle: z.array(z.string()).min(1, 'At least one trading style is required'),
  bannerImage: z.string().optional().or(z.literal('')),
  gallery: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  price: z.number().nonnegative('Price cannot be negative').optional().default(49),
  pricing: z.array(z.object({
    planType: z.enum(['monthly', 'quarterly', 'yearly', 'lifetime']),
    price: z.number().nonnegative('Price cannot be negative'),
    currency: z.string().default('USD')
  })).optional().default([]),
  scriptFile: z.string().optional().or(z.literal('')),
  scriptType: z.string().optional().default('pine'),
  isActive: z.boolean().default(true)
});

export const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(150),
  slug: z.string().min(5, 'Slug must be at least 5 characters long').toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  content: z.string().min(50, 'Content must be at least 50 characters long'),
  summary: z.string().min(10, 'Summary must be at least 10 characters long').max(300),
  category: z.enum(['Gold Strategies', 'Forex', 'Indicator Updates', 'Market Analysis', 'Trading Psychology']),
  bannerImage: z.string().url('Banner image must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('draft')
});

export const faqSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters long'),
  answer: z.string().min(10, 'Answer must be at least 10 characters long'),
  category: z.enum(['Installation', 'Refunds', 'TradingView', 'Crypto Payments', 'Alerts', 'Compatibility', 'Updates', 'General']),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true)
});

export const docArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  slug: z.string().min(5, 'Slug must be at least 5 characters long').toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  content: z.string().min(30, 'Content must be at least 30 characters long'),
  category: z.enum(['Installation', 'Trading Guide', 'Settings', 'Alerts', 'Troubleshooting', 'FAQ']),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true)
});
