import type { SavingsProduct } from 'types';

export type FilterSavingsProduct = (product: SavingsProduct) => boolean;

export type OrderBySavingsProduct = (a: SavingsProduct, b: SavingsProduct) => number;

export function filterByMonthlyAmount(product: SavingsProduct, monthlyAmount: number) {
  return product.minMonthlyAmount <= monthlyAmount && product.maxMonthlyAmount >= monthlyAmount;
}

export function filterByTerm(product: SavingsProduct, term: number) {
  return product.availableTerms === term;
}

export function orderByAnnualRate(a: SavingsProduct, b: SavingsProduct) {
  return b.annualRate - a.annualRate;
}

export function getEstimatedProfit(product: SavingsProduct, monthlyAmount: number, term: number) {
  return Math.round(monthlyAmount * term * (1 + product.annualRate * 0.5));
}

export function getRecommendedMonthlyAmount(product: SavingsProduct, targetAmount: number, term: number) {
  return Math.round(targetAmount / (term * (1 + product.annualRate * 0.5)) / 1000) * 1000;
}
