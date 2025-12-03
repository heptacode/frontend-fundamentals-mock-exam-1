import { css } from '@emotion/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { commaizeNumber } from '@toss/utils';
import { getSavingsProducts } from 'api/product';
import { FilterSavingsProduct, OrderBySavingsProduct } from 'domain/savings-product';
import { useSelectedProductId } from 'hooks/useSelectedProductId';
import { Assets, colors, ListRow } from 'tosslib';
import { SavingsProduct } from 'types';

interface ProductListProps {
  filters?: FilterSavingsProduct[];
  orderBy?: OrderBySavingsProduct;
  limit?: number;
}
export function ProductList({ filters, orderBy, limit }: ProductListProps) {
  const { data } = useSuspenseQuery(getSavingsProducts.queryOptions({ filters, orderBy, limit }));

  if (data.length === 0) {
    return <ListRow contents={<ListRow.Texts type="1RowTypeA" top="조건에 맞는 상품이 없어요." />} />;
  }

  return (
    <>
      {data.map(product => {
        return (
          <ProductList.Item
            key={product.id}
            id={product.id}
            top={product.name}
            middle={`연 이자율: ${product.annualRate}%`}
            bottom={`${commaizeNumber(product.minMonthlyAmount)}원 ~ ${commaizeNumber(product.maxMonthlyAmount)}원 | ${product.availableTerms}개월`}
          />
        );
      })}
    </>
  );
}

ProductList.Item = function Item({
  id,
  top,
  middle,
  bottom,
}: {
  id: SavingsProduct['id'];
  top: string;
  middle: string;
  bottom: string;
}) {
  const [selectedProductId, setSelectedProductId] = useSelectedProductId();

  return (
    <button css={resetButtonStyle} key={id} onClick={() => setSelectedProductId(id)}>
      <ListRow
        contents={
          <ListRow.Texts
            type="3RowTypeA"
            top={top}
            topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
            middle={middle}
            middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
            bottom={bottom}
            bottomProps={{ fontSize: 13, color: colors.grey600 }}
          />
        }
        right={selectedProductId === id && <Assets.Icon name="icon-check-circle-green" />}
      />
    </button>
  );
};

const resetButtonStyle = css`
  padding: 0;
  display: flex;
  width: 100%;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
`;
