import { useEffect, useState } from 'react';
import { WidgetContext } from '../lib/context';
import type { Poll } from '../lib/polls-api';
import { Widget } from './widget';

interface WidgetContainerProps {
  clientKey: string;
  className: string;
  externalId?: string;
  contributorEmail?: string;
  contributorName?: string;
}

export function WidgetContainer({
  clientKey,
  className,
  externalId,
  contributorEmail,
  contributorName,
}: WidgetContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WidgetContext.Provider value={{
      isOpen,
      setIsOpen,
      clientKey,
      className,
      externalId,
      contributorEmail: contributorEmail ?? null,
      contributorName: contributorName ?? null,
      poll,
      setPoll,
    }}>
      <Widget />
    </WidgetContext.Provider>
  );
}
