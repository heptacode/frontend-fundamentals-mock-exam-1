import type { UseQueryOptions } from '@tanstack/react-query';
import { http, isHttpError } from 'tosslib';
import type { SavingsProduct } from 'types';

export async function getSavingsProducts(): Promise<SavingsProduct[] | undefined> {
  try {
    return await http.get<SavingsProduct[]>(getSavingsProducts.apiPath);
  } catch (e) {
    if (isHttpError(e)) {
      console.error(e.message);
    }
  }
}
getSavingsProducts.apiPath = '/api/savings-products';
getSavingsProducts.queryOptions = (options?: Partial<UseQueryOptions<SavingsProduct[] | undefined>>) =>
  ({
    queryKey: [getSavingsProducts.apiPath],
    queryFn: getSavingsProducts,
    ...options,
  }) satisfies UseQueryOptions<SavingsProduct[] | undefined>;
