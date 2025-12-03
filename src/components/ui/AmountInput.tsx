import { commaizeNumber, decommaizeNumber } from '@toss/utils';
import type { ComponentProps } from 'react';
import { TextField } from 'tosslib';

export interface AmountInputProps extends Omit<ComponentProps<typeof TextField>, 'value' | 'onChange'> {
  value: number | null;
  onChange: (value: number) => void;
}

export function AmountInput({ value, onChange, ...props }: AmountInputProps) {
  return (
    <TextField
      suffix="원"
      value={commaizeNumber(value ?? 0)}
      onChange={e => onChange(decommaizeNumber(e.target.value))}
      {...props}
    />
  );
}
