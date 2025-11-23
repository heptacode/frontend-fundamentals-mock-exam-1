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
getSavingsProducts.queryOptions = {
  queryKey: [getSavingsProducts.apiPath],
  queryFn: getSavingsProducts,
};
