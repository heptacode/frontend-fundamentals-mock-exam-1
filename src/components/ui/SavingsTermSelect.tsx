import type { ComponentProps } from 'react';
import { SelectBottomSheet } from 'tosslib';

export function SavingsTermSelect({
  terms,
  ...props
}: {
  terms: number[];
} & Omit<ComponentProps<typeof SelectBottomSheet<number>>, 'children'>) {
  return (
    <SelectBottomSheet {...props}>
      {terms.map(term => (
        <SelectBottomSheet.Option key={term} value={term}>
          {term}개월
        </SelectBottomSheet.Option>
      ))}
    </SelectBottomSheet>
  );
}
