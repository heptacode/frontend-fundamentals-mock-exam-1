import { useSuspenseQuery } from '@tanstack/react-query';
import { commaizeNumber } from '@toss/utils';
import { getSavingsProducts } from 'api/product';
import { getEstimatedProfit, getRecommendedMonthlyAmount } from 'domain/savings-product';
import { useSavingsParams } from 'hooks/useSavingsParams';
import { useSelectedProductId } from 'hooks/useSelectedProductId';
import { colors, ListRow } from 'tosslib';

export function CalculationResult() {
  const [{ targetAmount, monthlyAmount, term }] = useSavingsParams();
  const [selectedProductId] = useSelectedProductId();
  const { data } = useSuspenseQuery(getSavingsProducts.queryOptions({ filters: [x => x.id === selectedProductId] }));
  const selectedProduct = data[0];

  if (!selectedProduct) {
    return <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품을 선택해주세요." />} />;
  }

  const estimatedProfit = getEstimatedProfit(selectedProduct, monthlyAmount, term);
  const recommendedMonthlyAmount = getRecommendedMonthlyAmount(selectedProduct, targetAmount, term);

  return (
    <>
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="예상 수익 금액"
            topProps={{ color: colors.grey600 }}
            bottom={`${commaizeNumber(estimatedProfit)}원`}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="목표 금액과의 차이"
            topProps={{ color: colors.grey600 }}
            bottom={`${commaizeNumber(targetAmount - estimatedProfit)}원`}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="추천 월 납입 금액"
            topProps={{ color: colors.grey600 }}
            bottom={`${commaizeNumber(recommendedMonthlyAmount)}원`}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
    </>
  );
}
