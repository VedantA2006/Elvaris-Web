import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap text-center flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 sm:p-16 flex flex-col items-center gap-stack-md max-w-xl ambient-shadow">
        <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/30 flex items-center justify-center text-error font-black text-2xl">
          404
        </div>
        <h1 className="font-headline-lg text-headline-lg font-black text-primary tracking-tight">
          Page Not Found
        </h1>
        <p className="font-body-md text-body-md text-secondary leading-relaxed max-w-md">
          The requested quantitative endpoint or portal screen could not be located on our servers.
        </p>
        <Link
          href="/"
          className="mt-4 px-8 py-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider transition-all hover:bg-surface-container-highest hover:text-primary border border-transparent hover:border-primary"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
