import { createContext } from 'react';
import type { Poll } from './polls-api';

interface WidgetContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  clientKey: string;
  className: string;
  externalId?: string | null;
  contributorEmail?: string | null;
  contributorName?: string | null;
  poll: Poll | null;
  setPoll: (poll: Poll | null) => void;
}

export const WidgetContext = createContext<WidgetContextType>({
  isOpen: false,
  setIsOpen: () => undefined,
  clientKey: '',
  className: '',
  externalId: null,
  contributorEmail: null,
  contributorName: null,
  poll: null,
  setPoll: () => undefined,
});
