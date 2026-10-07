# 적금 계산기

## 기술적 구현 사항

### TabContent

TabContent라는 이름의 UI 컴포넌트를 만들어 JSX에서 이루어지는 탭이름 검사를 제거하고 내부 로직을 추상화하였습니다.
```tsx
interface TabContentProps<T extends string | number> {
  tab: T;
  content: Record<T, React.ReactNode>;
}

export function TabContent<T extends string | number>({ tab, content }: TabContentProps<T>) {
  return content[tab];
}
```
<details>
  <summary>&lt;TabContent /&gt; 사용 방법:</summary>

  ```tsx
  <TabContent
    tab={tab}
    content={{
      products: <ProductList />,
      results: <CalculationResult />,
    }}
  />
  ```
</details>

### React Suspense 기반 데이터 로딩

**선택한 방식:** useSuspenseQuery + Suspense

```tsx
// API Layer - useSuspenseQuery용 타입 지원 (src/api/product.ts)
getSavingsProducts.queryOptions = (
  options?: Partial<UseSuspenseQueryOptions<SavingsProduct[] | undefined>>
) => ({
  queryKey: [getSavingsProducts.apiPath],
  queryFn: getSavingsProducts,
  ...options,
}) satisfies UseSuspenseQueryOptions<SavingsProduct[] | undefined>;

// Component - useSuspenseQuery 사용 (src/components/ProductList.tsx)
const { data: savingsProducts } = useSuspenseQuery(getSavingsProducts.queryOptions());

// Page - Suspense로 로딩 상태 선언적 처리 (src/pages/SavingsCalculatorPage.tsx)
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

**선택 이유:**

1. **타입 안전성**
   - `useQuery`는 `data`가 nullable 할 수 있어 optional chaining 필요
   - `useSuspenseQuery`는 `data`가 항상 정의됨을 보장
   - TypeScript에서 불필요한 null check 최소화

2. **선언적 로딩 처리**
   - 부모 컴포넌트에서 Suspense fallback으로 로딩 UI 관리
   - 여러 컴포넌트의 로딩 상태를 하나의 Suspense로 통합 가능

3. **에러 바운더리 연계 용이**
   - ErrorBoundary + Suspense 조합으로 에러/로딩 처리 분리
   - 향후 에러 처리 개선 시 확장 용이

### 상태 관리 전략

**선택한 방식:** Props Drilling

```tsx
const [selectedProduct, setSelectedProduct] = useState<SavingsProduct | null>(null);
const [targetAmount, setTargetAmount] = useState(0);
const [monthlyAmount, setMonthlyAmount] = useState(0);
const [term, setTerm] = useState(12);

<ProductList
  selectedProduct={selectedProduct}
  monthlyAmount={monthlyAmount}
  term={term}
  onSelectProduct={setSelectedProduct}
/>
```

**선택 이유:**
- 컴포넌트 트리가 얕음 (최대 2단계)
- 명시적인 데이터 흐름을 보기 위해

**고려했지만 선택하지 않은 방식:**
- Context API: 현재 규모에서는 불필요한 복잡도 증가
- Zustand/Recoil: 간단한 로컬 상태에는 과도한 의존성 추가가 될 수 있다고 판단

### Event Handler 구현 패턴

구현 과정에서 변화한 패턴 (1 -> 2 -> 3단계)

```tsx
// 1단계: 기본 inline handler
onChange={e => setTargetAmount(decommaizeNumber(e.target.value))}

// 2단계: 검증 로직 추가를 위해 함수 분리 (commit 51e6b51)
function handleTargetAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value = decommaizeNumber(e.target.value);
  if (!isNaN(value)) {
    setTargetAmount(value);
  }
}

// 3단계: 함수형 업데이트 + fallback 패턴으로 개선 (commit 947049f)
onChange={e => setTargetAmount(prev => decommaizeNumber(e.target.value) || prev)}
```

**최종 선택:** Inline with Fallback Pattern

**선택 이유:**
- `|| prev` 패턴으로 간결한 isNaN 처리를 하고 싶었음 (isNaN 체크 제거로 코드 16줄 감소)
- 각 handler마다 함수 선언은 불필요한 보일러플레이트

**함수 분리를 선택하지 않은 이유:**
- 재사용되지 않는 1회성 로직인 점
- 복잡한 비즈니스 로직이 아님 (단순 파싱 + 검증)
- 테스트가 필요한 수준의 복잡도가 아님

### Component Memoization 전략

**현재 상태:** Memoization 미적용

```tsx
// React.memo, useMemo, useCallback 미적용
```

**의도적 선택 이유:**

- React Query가 데이터 레벨에서 캐싱 담당
- `monthlyAmount`, `term` 변경 시 prop이 바뀌므로 어차피 컴포넌트는 재렌더링됨
  - 렌더링 시 1회성으로 연산만 하면 됨 (`estimatedProfit`, `difference`, 등)
- 현재 단계에서의 map 연산은 무겁지 않음
- Suspense 사용으로 데이터가 준비된 후에만 렌더링되므로 최적화 필요성 감소

**Trade-off 판단:**
- 현재 규모: 가독성 > 성능 최적화
- Premature optimization 지양
- Suspense로 인한 렌더링 타이밍 최적화가 이미 적용됨
- 성능 문제 발생 시 프로파일링 후 선택적 적용 예정

**Memoization 필요하다고 생각하는 시점:**
- 상품 목록이 100개 이상으로 증가
- 복잡한 정렬/필터링 로직 추가
- 부모 컴포넌트가 빈번하게 재렌더링

## 리뷰 요청 사항

### 1. useSuspenseQuery vs useQuery 선택 기준

**현재 선택:** useSuspenseQuery

**선택 근거:**
- 로딩 상태를 컴포넌트 외부에서 선언적으로 관리하기 위해
- 타입 안전성 향상 (`data`가 nullable하지 않음)
- Suspense와 ErrorBoundary로 관심사 분리

**질문:**
- 언제 useQuery를 사용하고 언제 useSuspenseQuery를 사용해야 할지
- Suspense fallback이 중첩될 때의 UX는? (여러 탭에서 각각 다른 로딩 상태)
- 토스에서는 어떤 방식으로 React Query를 CSR+SSR 하이브리드하게 작성하는지

### 2. Suspense Boundary의 위치

**현재 구현:** TabContent 전체를 하나의 Suspense로 감쌈

```tsx
<Suspense fallback={<ListRow.Texts type="1RowTypeA" top="로딩중입니다..." />}>
  <TabContent
    tab={tab}
    content={{
      products: <ProductList />,
      results: <CalculationResult />
    }}
  />
</Suspense>
```

<details>
  <summary><b>대안 A:</b> 각 탭마다 개별 Suspense</summary>

  ```tsx
  <TabContent
    content={{
      products: (
        <Suspense fallback={...}>
          <ProductList />
        </Suspense>
      ),
      results: (
        <Suspense fallback={...}>
          <CalculationResult />
        </Suspense>
      )
    }}
  />
  ```
</details>


**질문:**
- Suspense를 어느 수준에서 설정하는게 좋을지

### 3. Component Memoization 적용 여부

**현재 상태:**
- 모든 컴포넌트에 memoization 미적용
- 가독성 우선, premature optimization 지양

**질문:**
- 현재 규모나 과제라는 특수한 상황에서 memoization이 필요할지

### 4. Props Drilling vs Context API

**현재 선택:** Props Drilling
- 컴포넌트 깊이: 2단계
- 전달되는 props: 5~6개

**질문:**
- 몇 단계부터 Context API나 다른 상태 관리 방식을 고려해야 할지
- 어떤 것을 기준으로 잡는게 좋을지: Props 개수, 깊이, ...

### 5. Event Handler Pattern 선택

**최종 선택:**
```tsx
onChange={e => setTargetAmount(prev => decommaizeNumber(e.target.value) || prev)}
```

<details>
  <summary><b>대안 A:</b> 별도의 함수로 분리하기 + 필요에 따라 useCallback 적용</summary>

  ```tsx
  const handleTargetAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = decommaizeNumber(e.target.value);
    if (!isNaN(value)) setTargetAmount(value);
  }, []);
  ```
</details>

**질문:**
- Inline vs 분리된 함수로 작성하는걸 결정하는 기준이 있는지
- useCallback을 언제 사용하는 게 좋을지
- 가독성과 성능의 밸런스를 어떻게 찾는게 좋다고 생각하시는지

---

감사합니다 😊