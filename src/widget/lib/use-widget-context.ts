import { WidgetContext } from './context.ts';
import { useContext } from 'react';

export function useWidgetContext() {
  return useContext(WidgetContext);
}