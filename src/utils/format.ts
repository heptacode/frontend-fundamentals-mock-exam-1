import { commaizeNumber } from '@toss/utils';

export function formatToKRW(amount: number): string {
  return `${commaizeNumber(amount)}원`;
}
