import { CalculationResult } from 'components/CalculationResult';
import { ProductList } from 'components/ProductList';
import { SuspenseBoundary } from 'components/SuspenseBoundary';
import { AmountInput } from 'components/ui/AmountInput';
import { SavingsTermSelect } from 'components/ui/SavingsTermSelect';
import { TabContent } from 'components/ui/TabContent';
import { filterByMonthlyAmount, filterByTerm, orderByAnnualRate } from 'domain/savings-product';
import { useSavingsParams } from 'hooks/useSavingsParams';
import { useState } from 'react';
import { Border, ListHeader, ListRow, NavigationBar, Spacing, Tab } from 'tosslib';

type TabType = 'products' | 'results';

export function SavingsCalculatorPage() {
  const [tab, setTab] = useState<TabType>('products');

  const [{ targetAmount, monthlyAmount, term }, setSavingsParams] = useSavingsParams();

  return (
    <>
      <NavigationBar title="적금 계산기" />

      <Spacing size={16} />

      <AmountInput
        label="목표 금액"
        placeholder="목표 금액을 입력하세요"
        value={targetAmount}
        onChange={value => setSavingsParams({ targetAmount: value })}
      />
      <Spacing size={16} />
      <AmountInput
        label="월 납입액"
        placeholder="희망 월 납입액을 입력하세요"
        value={monthlyAmount}
        onChange={value => setSavingsParams({ monthlyAmount: value })}
      />
      <Spacing size={16} />
      <SavingsTermSelect
        label="저축 기간"
        title="저축 기간을 선택해주세요"
        terms={[6, 12, 24]}
        value={term}
        onChange={value => setSavingsParams({ term: value })}
      />

      <Spacing size={24} />
      <Border height={16} />
      <Spacing size={8} />

      <Tab onChange={value => setTab(value as TabType)}>
        <Tab.Item value="products" selected={tab === 'products'}>
          적금 상품
        </Tab.Item>
        <Tab.Item value="results" selected={tab === 'results'}>
          계산 결과
        </Tab.Item>
      </Tab>

      <Spacing size={8} />

      <TabContent
        tab={tab}
        content={{
          products: (
            <SuspenseBoundary fallback={<ListRow.Texts type="1RowTypeA" top="상품을 불러오는 중..." />}>
              <ProductList filters={[x => filterByMonthlyAmount(x, monthlyAmount), x => filterByTerm(x, term)]} />
            </SuspenseBoundary>
          ),
          results: (
            <>
              <CalculationResult />
              <Spacing size={8} />
              <Border height={16} />
              <Spacing size={8} />
              <ListHeader
                title={<ListHeader.TitleParagraph fontWeight="bold">추천 상품 목록</ListHeader.TitleParagraph>}
              />
              <SuspenseBoundary fallback={<ListRow.Texts type="1RowTypeA" top="상품을 불러오는 중..." />}>
                <ProductList
                  filters={[x => filterByMonthlyAmount(x, monthlyAmount), x => filterByTerm(x, term)]}
                  orderBy={orderByAnnualRate}
                  limit={2}
                />
              </SuspenseBoundary>
            </>
          ),
        }}
      />

      <Spacing size={40} />
    </>
  );
}
