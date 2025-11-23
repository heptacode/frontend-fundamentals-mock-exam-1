import { useSuspenseQuery } from '@tanstack/react-query';
import { getSavingsProducts } from 'api/product';
import { Assets, Spacing, Border, colors, ListHeader, ListRow } from 'tosslib';
import type { SavingsProduct } from 'types';
import { formatToKRW } from 'utils/format';

function CalculationResultDisplay({ selectedProduct, targetAmount, monthlyAmount, term }: CalculationResultProps) {
  if (!selectedProduct) {
    return <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품을 선택해주세요." />} />;
  }

  const estimatedProfit = monthlyAmount * term * (1 + selectedProduct.annualRate * 0.5);
  const difference = targetAmount - estimatedProfit;
  const recommendedMonthlyAmount =
    Math.round(targetAmount / (term * (1 + selectedProduct.annualRate * 0.5)) / 1000) * 1000;

  return (
    <>
      <ListRow
        contents={
          <ListRow.Texts
            type="2RowTypeA"
            top="예상 수익 금액"
            topProps={{ color: colors.grey600 }}
            bottom={formatToKRW(estimatedProfit)}
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
            bottom={formatToKRW(difference)}
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
            bottom={formatToKRW(recommendedMonthlyAmount)}
            bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
          />
        }
      />
    </>
  );
}

interface CalculationResultProps {
  selectedProduct: SavingsProduct | null;
  targetAmount: number;
  monthlyAmount: number;
  term: number;
}
export function CalculationResult({ selectedProduct, targetAmount, monthlyAmount, term }: CalculationResultProps) {
  const { data: recommendedProducts } = useSuspenseQuery(
    getSavingsProducts.queryOptions({
      select: data =>
        data
          ?.filter(product =>
            monthlyAmount > 0
              ? product.minMonthlyAmount < monthlyAmount &&
                product.maxMonthlyAmount > monthlyAmount &&
                product.availableTerms === term
              : product.availableTerms === term
          )
          .sort((a, b) => b.annualRate - a.annualRate)
          .slice(0, 2),
    })
  );

  return (
    <>
      <Spacing size={8} />

      <CalculationResultDisplay
        selectedProduct={selectedProduct}
        targetAmount={targetAmount}
        monthlyAmount={monthlyAmount}
        term={term}
      />

      <Spacing size={8} />
      <Border height={16} />
      <Spacing size={8} />

      <ListHeader title={<ListHeader.TitleParagraph fontWeight="bold">추천 상품 목록</ListHeader.TitleParagraph>} />
      <Spacing size={12} />

      {recommendedProducts?.map(product => {
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
          />
        );
      })}

      <Spacing size={40} />
    </>
  );
}
