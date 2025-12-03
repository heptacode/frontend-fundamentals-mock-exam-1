import { parseAsString, useQueryState } from 'nuqs';
import type { SavingsProduct } from 'types';

export function useSelectedProductId(): [SavingsProduct['id'] | null, (productId: SavingsProduct['id']) => void] {
  const [selectedProductId, setSelectedProductId] = useQueryState('selectedProductId', parseAsString);

  return [selectedProductId, setSelectedProductId];
}
