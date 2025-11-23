import { useQuery } from '@tanstack/react-query';
import { getSavingsProducts } from 'api/product';
import { Assets, colors, ListRow, Spacing } from 'tosslib';
import type { SavingsProduct } from 'types';
import { formatToKRW } from 'utils/format';

interface ProductListProps {
  selectedProduct: SavingsProduct | null;
  onSelectProduct?: (product: SavingsProduct) => void;
}
export function ProductList({ selectedProduct, onSelectProduct }: ProductListProps) {
  const { data: savingsProducts } = useQuery(getSavingsProducts.queryOptions);

  return (
    <>
      <Spacing size={8} />

      {savingsProducts?.map(product => {
        const isSelected = selectedProduct?.id === product.id;

        return (
          <ListRow
            key={product.id}
            contents={
              <ListRow.Texts
                type="3RowTypeA"
                top={product.name}
                topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
                middle={`연 이자율: ${product.annualRate}%`}
                middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
                bottom={`${formatToKRW(product.minMonthlyAmount)} ~ ${formatToKRW(product.maxMonthlyAmount)} | ${product.availableTerms}개월`}
                bottomProps={{ fontSize: 13, color: colors.grey600 }}
              />
            }
            right={isSelected && <Assets.Icon name="icon-check-circle-green" />}
            onClick={() => onSelectProduct?.(product)}
          />
        );
      })}
    </>
  );
}
