/**
 * 적금 상품 정보
 * @property id - 상품 ID
 * @property name - 상품명
 * @property annualRate - 연 이자율
 * @property minMonthlyAmount - 최소 월 납입액
 * @property maxMonthlyAmount - 최대 월 납입액
 * @property availableTerms - 저축 기간
 */
export interface SavingsProduct {
  id: string;
  name: string;
  annualRate: number;
  minMonthlyAmount: number;
  maxMonthlyAmount: number;
  availableTerms: number;
}
