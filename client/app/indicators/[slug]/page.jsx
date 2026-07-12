import React from 'react';
import IndicatorDetail from '../../../src/views/IndicatorDetail.jsx';

export async function generateMetadata({ params }) {
  const { slug } = params;
  return {
    title: `${slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Indicator Detail'} — Elvaris Technologies`,
    description: 'Detailed algorithmic specification, pine script architecture, institutional pricing tiers, and webhook alert configuration.',
  };
}

export default function IndicatorDetailPage() {
  return <IndicatorDetail />;
}
