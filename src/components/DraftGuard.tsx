'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface DraftGuardProps {
  underPreparationScreen: React.ReactNode;
  children: React.ReactNode;
}

function DraftGuardContent({ underPreparationScreen, children }: DraftGuardProps) {
  const searchParams = useSearchParams();

  // In local development, always show draft content without a preview query param.
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  const rawPreview = searchParams.get('preview');
  const rawDraft = searchParams.get('draft');
  const rawSecret = searchParams.get('secret');

  const isPreviewAccess =
    rawPreview === 'true' ||
    rawPreview === 'draft' ||
    rawDraft === 'true' ||
    rawSecret === 'true' ||
    rawSecret === 'draft';

  if (!isPreviewAccess) {
    return <>{underPreparationScreen}</>;
  }

  return <>{children}</>;
}

export function DraftGuard(props: DraftGuardProps) {
  return (
    <Suspense fallback={props.underPreparationScreen}>
      <DraftGuardContent {...props} />
    </Suspense>
  );
}
