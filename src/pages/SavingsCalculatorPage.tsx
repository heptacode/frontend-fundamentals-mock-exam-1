import { commaizeNumber, decommaizeNumber } from '@toss/utils';
import { CalculationResult } from 'components/CalculationResult';
import { ProductList } from 'components/ProductList';
import { TabContent } from 'components/ui/TabContent';
import { useState } from 'react';
import { Border, NavigationBar, SelectBottomSheet, Spacing, Tab, TextField } from 'tosslib';
import type { SavingsProduct } from 'types';

type TabType = 'products' | 'results';

export function SavingsCalculatorPage() {
  const [tab, setTab] = useState<TabType>('products');
  const [selectedProduct, setSelectedProduct] = useState<SavingsProduct | null>(null);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(0);
  const [term, setTerm] = useState<number>(12);

  function handleTargetAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = decommaizeNumber(e.target.value);
    if (!isNaN(value)) {
      setTargetAmount(value);
    }
  }

  function handleMonthlyAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = decommaizeNumber(e.target.value);
    if (!isNaN(value)) {
      setMonthlyAmount(value);
    }
  }

  return (
    <>
      <NavigationBar title="적금 계산기" />

      <Spacing size={16} />

      <TextField
        label="목표 금액"
        placeholder="목표 금액을 입력하세요"
        suffix="원"
        value={commaizeNumber(targetAmount)}
        onChange={handleTargetAmountChange}
      />
      <Spacing size={16} />
      <TextField
        label="월 납입액"
        placeholder="희망 월 납입액을 입력하세요"
        suffix="원"
        value={commaizeNumber(monthlyAmount)}
        onChange={handleMonthlyAmountChange}
      />
      <Spacing size={16} />
      <SelectBottomSheet label="저축 기간" title="저축 기간을 선택해주세요" value={term} onChange={setTerm}>
        <SelectBottomSheet.Option value={6}>6개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={12}>12개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={24}>24개월</SelectBottomSheet.Option>
      </SelectBottomSheet>

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

      <TabContent
        tab={tab}
        content={{
          products: (
            <ProductList
              selectedProduct={selectedProduct}
              monthlyAmount={monthlyAmount}
              term={term}
              onSelectProduct={setSelectedProduct}
            />
          ),
          results: (
            <CalculationResult
              selectedProduct={selectedProduct}
              targetAmount={targetAmount}
              monthlyAmount={monthlyAmount}
              term={term}
            />
          ),
        }}
      />
    </>
  );
}
