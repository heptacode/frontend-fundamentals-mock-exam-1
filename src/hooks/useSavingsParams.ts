import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo } from 'react';

interface SavingsState {
  targetAmount: number;
  monthlyAmount: number;
  term: number;
}
export function useSavingsParams(): [SavingsState, (partial: Partial<SavingsState>) => void] {
  const [params, setParams] = useQueryStates({
    targetAmount: parseAsInteger.withDefault(0),
    monthlyAmount: parseAsInteger.withDefault(0),
    term: parseAsInteger.withDefault(12),
  });

  return useMemo(() => [params, setParams], [params, setParams]);
}
