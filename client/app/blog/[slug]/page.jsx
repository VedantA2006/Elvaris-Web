import React from 'react';
import Blog from '../../../src/views/Blog.jsx';

export async function generateMetadata({ params }) {
  const { slug } = params;
  return {
    title: `${slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Research Article'} — Elvaris Insights`,
    description: 'Algorithmic research publication and quantitative market strategy analysis.',
  };
}

export default function BlogDetailPage() {
  return <Blog />;
}
