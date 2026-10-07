# UX 개선 제안 사항

이 문서는 토스 적금 계산기 프로젝트의 사용자 경험을 개선하기 위한 제안 사항을 정리한 문서입니다.

## 🎯 현재 구현된 UX 기능

### ✅ 구현 완료
- 숫자 입력 시 천 단위 콤마 자동 포맷팅
- 잘못된 입력값 방지 (NaN 시 이전 값 유지)
- 상품 미선택 시 안내 메시지 표시
- 월 납입액 미입력 시 저축 기간만으로 필터링 (기본 필터)
- 선택한 상품 시각적 표시 (체크 아이콘)
- 금리 높은 순으로 추천 상품 정렬
- **Suspense 기반 로딩 상태 표시** ✨ NEW

---

## 🚀 우선순위별 개선 제안

### Priority 1: Critical (사용성에 직접적 영향)

#### 1.1 로딩 상태 표시 ✅ 완료

**구현 완료:** `useSuspenseQuery` + `Suspense`로 선언적 로딩 처리

**현재 구현:**
```tsx
// SavingsCalculatorPage.tsx
<Suspense fallback={<ListRow.Texts type="1RowTypeA" top="로딩중입니다..." />}>
  <TabContent
    tab={tab}
    content={{
      products: <ProductList {...props} />,
      results: <CalculationResult {...props} />
    }}
  />
</Suspense>
```

**추가 개선 제안:**
```tsx
// tosslib 컴포넌트로 더 나은 로딩 UI
import { Spinner, Flex, Text } from 'tosslib';

<Suspense fallback={
  <Flex direction="column" align="center" css={{ padding: '60px 20px' }}>
    <Spinner size="medium" />
    <Spacing size={16} />
    <Text variant="body2" color="grey600">
      상품을 불러오는 중...
    </Text>
  </Flex>
}>
  {/* ... */}
</Suspense>
```

**향후 검토 사항:**
- 탭 전환 시 로딩 상태를 보여줄지, 이전 탭 유지할지 결정
- `startTransition` API를 활용한 부드러운 탭 전환 검토
- 스켈레톤 UI 적용 검토

---

#### 1.2 에러 상태 처리

**현재 문제:**
- API 실패 시 console.error만 출력
- 사용자는 빈 화면만 보게 됨
- **Suspense는 구현했지만 ErrorBoundary는 미구현**

**개선 방안:**
```tsx
// SavingsCalculatorPage.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Flex
      direction="column"
      align="center"
      css={{ padding: '60px 20px', textAlign: 'center' }}
    >
      <Assets.Icon name="icon-exclamation-circle" size={64} />
      <Spacing size={24} />
      <Text variant="h3" weight="bold">상품을 불러오는데 실패했어요</Text>
      <Spacing size={8} />
      <Text variant="body2" color="grey600">
        네트워크 연결을 확인하고 다시 시도해주세요
      </Text>
      <Spacing size={24} />
      <Button onClick={resetErrorBoundary} variant="primary">
        다시 시도
      </Button>
    </Flex>
  );
}

// Suspense와 ErrorBoundary를 함께 사용
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<LoadingFallback />}>
    <TabContent {...props} />
  </Suspense>
</ErrorBoundary>
```

**useSuspenseQuery와 ErrorBoundary의 시너지:**
- `useSuspenseQuery`는 에러를 throw하여 ErrorBoundary로 전파
- 로딩과 에러 처리를 컴포넌트 외부에서 선언적으로 관리
- 컴포넌트는 성공 케이스에만 집중 가능

**추가 고려사항:**
- 특정 에러 타입별 다른 메시지 표시
- 재시도 횟수 제한
- 에러 로깅 (Sentry 등)
- React Query의 `retry` 옵션과 연계

---

#### 1.3 빈 결과 상태 안내

**현재 문제:**
- 필터 조건에 맞는 상품이 0개일 때 빈 화면만 표시

**개선 방안:**
```tsx
// ProductList.tsx
if (filteredProducts.length === 0) {
  return (
    <div css={emptyStateStyle}>
      <Icon name="search" size={64} color="gray400" />
      <Text variant="h3">조건에 맞는 상품이 없어요</Text>
      <Text variant="body2" color="gray600">
        월 납입액: {commaizeNumber(monthlyAmount)}원<br />
        저축 기간: {term}개월
      </Text>
      <Button
        onClick={() => {
          setMonthlyAmount(0);
          setTerm(12);
        }}
        variant="secondary"
      >
        조건 초기화
      </Button>
    </div>
  );
}
```

**예상 효과:**
- 사용자가 왜 결과가 없는지 이해 가능
- 즉시 조건 수정 가능

---

### Priority 2: High (사용 편의성 개선)

#### 2.1 입력 필드 검증 및 제약

**현재 문제:**
- 음수 입력 가능
- 비현실적인 큰 숫자 입력 가능
- 소수점 입력 시 의도치 않은 동작 가능

**개선 방안:**
```tsx
// Input validation utility
function validateAmount(value: number, min = 0, max = 1_000_000_000): number {
  if (value < min) return min;
  if (value > max) return max;
  return Math.floor(value); // 정수로 변환
}

// SavingsCalculatorPage.tsx
onChange={e => {
  const value = decommaizeNumber(e.target.value);
  setTargetAmount(prev => validateAmount(value) || prev);
}}
```

**추가 개선:**
```tsx
<TextField
  label="목표 금액"
  type="text"
  inputMode="numeric" // 모바일에서 숫자 키패드 표시
  placeholder="10,000,000"
  helperText="최소 10만원부터 입력 가능해요"
  error={targetAmount > 0 && targetAmount < 100_000}
/>
```

---

#### 2.2 저축 기간 선택 UI 개선

**현재 구현:**
- TextField로 직접 입력

**개선 제안:**
```tsx
// 자주 사용하는 기간은 버튼으로 빠른 선택
const COMMON_TERMS = [6, 12, 24, 36];

<div css={termSelectorStyle}>
  <Text variant="label">저축 기간</Text>
  <div css={buttonGroupStyle}>
    {COMMON_TERMS.map(months => (
      <Button
        key={months}
        variant={term === months ? 'primary' : 'secondary'}
        size="small"
        onClick={() => setTerm(months)}
      >
        {months}개월
      </Button>
    ))}
  </div>
  <TextField
    type="number"
    value={term}
    onChange={e => setTerm(Number(e.target.value))}
    placeholder="직접 입력"
    css={customInputStyle}
  />
</div>
```

**예상 효과:**
- 일반적인 케이스는 1클릭으로 선택
- 특수한 기간도 직접 입력 가능

---

#### 2.3 계산 결과 시각화

**현재 구현:**
- 텍스트로만 결과 표시

**개선 제안:**
```tsx
// Progress bar로 목표 달성도 표시
const achievementRate = (estimatedProfit / targetAmount) * 100;

<div css={progressContainerStyle}>
  <Text variant="caption" color="gray600">
    목표 달성률
  </Text>
  <ProgressBar
    value={achievementRate}
    max={100}
    color={achievementRate >= 100 ? 'success' : 'primary'}
  />
  <Text variant="body2" weight="bold">
    {achievementRate.toFixed(1)}%
  </Text>
</div>

// 차액을 시각적으로 강조
<div css={differenceCardStyle(difference >= 0)}>
  <Icon
    name={difference >= 0 ? 'trending-up' : 'trending-down'}
    color={difference >= 0 ? 'success' : 'warning'}
  />
  <Text variant="h2" color={difference >= 0 ? 'success' : 'warning'}>
    {difference >= 0 ? '+' : ''}{formatToKRW(Math.abs(difference))}
  </Text>
  <Text variant="caption">
    {difference >= 0 ? '목표 초과' : '목표 부족'}
  </Text>
</div>
```

---

### Priority 3: Medium (편의성 향상)

#### 3.1 입력값 저장 (Local Storage)

**제안:**
```tsx
// useLocalStorage hook 활용
const [targetAmount, setTargetAmount] = useLocalStorage('targetAmount', 0);
const [monthlyAmount, setMonthlyAmount] = useLocalStorage('monthlyAmount', 0);
const [term, setTerm] = useLocalStorage('term', 12);
```

**효과:**
- 새로고침 시에도 입력값 유지
- 반복 사용자 편의성 증대

---

#### 3.2 상품 비교 기능

**제안:**
```tsx
// 여러 상품을 선택하여 비교
const [comparedProducts, setComparedProducts] = useState<SavingsProduct[]>([]);

<ComparisonTable products={comparedProducts}>
  {/* 금리, 최소/최대 납입액, 예상 수익 등을 테이블로 비교 */}
</ComparisonTable>
```

---

#### 3.3 공유 기능

**제안:**
```tsx
// 계산 결과를 URL로 공유
function shareResult() {
  const params = new URLSearchParams({
    target: targetAmount.toString(),
    monthly: monthlyAmount.toString(),
    term: term.toString(),
    productId: selectedProduct?.id || '',
  });

  const shareUrl = `${window.location.origin}?${params}`;
  navigator.clipboard.writeText(shareUrl);

  toast.success('링크가 복사되었어요');
}
```

---

### Priority 4: Low (접근성 및 세부 개선)

#### 4.1 키보드 내비게이션

**현재 문제:**
- 키보드만으로 모든 기능 사용 불가능

**개선 방안:**
```tsx
// 상품 목록에서 화살표 키로 이동
function ProductList() {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        setFocusedIndex(prev => Math.min(prev + 1, products.length - 1));
      } else if (e.key === 'ArrowUp') {
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        onSelectProduct(products[focusedIndex]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, products]);

  // ...
}
```

---

#### 4.2 ARIA 레이블 추가

**개선 방안:**
```tsx
<div role="tablist" aria-label="적금 계산기 탭">
  <button
    role="tab"
    aria-selected={tab === 'products'}
    aria-controls="products-panel"
    id="products-tab"
  >
    적금 상품
  </button>
</div>

<div
  role="tabpanel"
  id="products-panel"
  aria-labelledby="products-tab"
  hidden={tab !== 'products'}
>
  {/* ... */}
</div>
```

---

#### 4.3 다크 모드 지원

**제안:**
```tsx
// Emotion theme 활용
const theme = {
  colors: {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#e0e0e0' : '#333333',
    // ...
  }
};

<ThemeProvider theme={theme}>
  <SavingsCalculatorPage />
</ThemeProvider>
```

---

#### 4.4 반응형 디자인

**현재 상태:**
- 데스크톱 위주 레이아웃

**모바일 개선:**
```tsx
const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 24px;
  }
`;
```

---

## 📊 개선 효과 측정 방법

### 정량적 지표
1. **로딩 시간**: Time to Interactive (TTI)
2. **에러율**: API 실패 시 복구율
3. **사용성**: 목표 달성까지 클릭 수
4. **접근성**: Lighthouse 접근성 점수

### 정성적 지표
1. 사용자 피드백 수집
2. A/B 테스트 (기존 UI vs 개선 UI)
3. 히트맵 분석 (사용자 클릭 패턴)

---

## 🎨 디자인 시스템 고려사항

### 컬러 팔레트
```tsx
const colors = {
  success: '#00C73C',    // 목표 달성
  warning: '#FF9500',    // 목표 부족
  error: '#FF3B30',      // 에러 상태
  info: '#007AFF',       // 정보
  gray600: '#8E8E93',    // 보조 텍스트
};
```

### 스페이싱 시스템
```tsx
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

---

## 🔄 단계별 적용 로드맵

### Phase 1 (1주차): Critical 개선
- [x] ~~로딩 상태 UI~~ (Suspense로 구현 완료 ✨)
- [ ] 에러 바운더리 (Suspense와 함께 사용)
- [ ] 빈 결과 안내

### Phase 2 (2주차): High 개선
- [ ] 입력 검증
- [ ] 저축 기간 빠른 선택
- [ ] 계산 결과 시각화

### Phase 3 (3주차): Medium 개선
- [ ] Local Storage 저장
- [ ] 상품 비교 기능
- [ ] 공유 기능

### Phase 4 (4주차): Low 개선
- [ ] 키보드 내비게이션
- [ ] ARIA 레이블
- [ ] 다크 모드
- [ ] 반응형 디자인

---

## 💡 추가 아이디어

### 고급 기능
1. **금리 추이 그래프**: Chart.js로 시간별 금리 변화 시각화
2. **알림 설정**: 원하는 조건의 상품 출시 시 알림
3. **목표 시뮬레이션**: "1년 후 목표 달성하려면?" 역계산
4. **세금 계산**: 이자소득세 자동 계산 (15.4%)
5. **만기 캘린더**: 적금 만기일 달력에 표시

### 성능 최적화

**Suspense 관련 추가 최적화:**
1. **React Query devtools**: 개발 모드에서 쿼리 상태 확인
   ```tsx
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

   <QueryClientProvider client={queryClient}>
     <App />
     <ReactQueryDevtools initialIsOpen={false} />
   </QueryClientProvider>
   ```

2. **Code splitting**: React.lazy + Suspense로 탭별 컴포넌트 분리
   ```tsx
   const ProductList = lazy(() => import('components/ProductList'));
   const CalculationResult = lazy(() => import('components/CalculationResult'));

   <Suspense fallback={<LoadingFallback />}>
     <TabContent
       content={{
         products: <ProductList />,  // 필요할 때만 로드
         results: <CalculationResult />
       }}
     />
   </Suspense>
   ```

3. **startTransition을 활용한 부드러운 탭 전환**
   ```tsx
   import { startTransition } from 'react';

   function handleTabChange(newTab: TabType) {
     startTransition(() => {
       setTab(newTab);  // 낮은 우선순위로 처리
     });
   }
   ```
   - 탭 전환 시 이전 UI를 유지하면서 새 데이터 로드
   - 사용자 경험 향상 (깜빡임 없음)

4. **Suspense 경계 세분화**
   ```tsx
   // 각 섹션별로 Suspense 경계 분리
   <Suspense fallback={<HeaderSkeleton />}>
     <CalculationResultDisplay />
   </Suspense>
   <Suspense fallback={<ProductListSkeleton />}>
     <RecommendedProducts />
   </Suspense>
   ```
   - 더 빠른 초기 렌더링
   - 부분적 로딩 상태 표시

5. **Image optimization**: 상품 로고 WebP 변환
6. **Bundle size 분석**: webpack-bundle-analyzer

---

## 📝 피드백 수집 방법

### 사용자 피드백
```tsx
// 간단한 만족도 조사
<FeedbackWidget>
  <Text>이 계산기가 도움이 되었나요?</Text>
  <ButtonGroup>
    <Button onClick={() => submitFeedback('positive')}>👍</Button>
    <Button onClick={() => submitFeedback('negative')}>👎</Button>
  </ButtonGroup>
</FeedbackWidget>
```

### Analytics 추적
```tsx
// Google Analytics 이벤트
function trackCalculation(targetAmount: number, monthlyAmount: number) {
  gtag('event', 'calculate', {
    target_amount: targetAmount,
    monthly_amount: monthlyAmount,
    term: term,
  });
}
```

---

이 문서는 지속적으로 업데이트될 예정입니다. 추가 제안사항이 있으시면 이슈나 PR로 알려주세요!
