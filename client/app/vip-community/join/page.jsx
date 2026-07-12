import React, { Suspense } from 'react';
import VipJoin from '../../../src/views/VipJoin';

export const metadata = {
  title: 'VIP Community Checkout | Elvaris Technologies',
  description: 'Secure cryptocurrency checkout for Elvaris Institutional Quantitative VIP Community.'
};

export default function VipJoinPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[60vh] flex items-center justify-center font-display">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VipJoin />
    </Suspense>
  );
}
