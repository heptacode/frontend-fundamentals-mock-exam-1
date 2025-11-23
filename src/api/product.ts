import type { UseSuspenseQueryOptions } from '@tanstack/react-query';
import { http, isHttpError } from 'tosslib';
import type { SavingsProduct } from 'types';

export async function getSavingsProducts(): Promise<SavingsProduct[]> {
  try {
    return await http.get<SavingsProduct[]>(getSavingsProducts.apiPath);
  } catch (e) {
    if (isHttpError(e)) {
      console.error(e.message);
      // useSuspenseQuery가 ErrorBoundary로 에러를 전파할 수 있도록 throw
      throw e;
    }
    // HTTP 에러가 아닌 경우에도 throw하여 ErrorBoundary가 처리하도록
    throw new Error('상품을 불러오는데 실패했습니다');
  }
}
getSavingsProducts.apiPath = '/api/savings-products';
getSavingsProducts.queryOptions = (options?: Partial<UseSuspenseQueryOptions<SavingsProduct[]>>) =>
  ({
    queryKey: [getSavingsProducts.apiPath],
    queryFn: getSavingsProducts,
    ...options,
  }) satisfies UseSuspenseQueryOptions<SavingsProduct[]>;
