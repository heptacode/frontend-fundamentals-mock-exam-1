import { Suspense, SuspenseProps } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import type { ErrorBoundaryPropsWithComponent, FallbackProps } from 'react-error-boundary';
import { isHttpError, Assets, Button, Spacing, Text, colors } from 'tosslib';

export function SuspenseBoundary({
  fallback,
  name,
  children,
  ...props
}: Omit<ErrorBoundaryPropsWithComponent, 'FallbackComponent' | 'fallback'> & SuspenseProps) {
  return (
    <ErrorBoundary FallbackComponent={SuspenseBoundary.ErrorFallback} {...props}>
      <Suspense fallback={fallback} name={name}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

SuspenseBoundary.ErrorFallback = function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { title, description } = (() => {
    if (isHttpError(error)) {
      if (error.status >= 500) {
        return {
          title: '서버에 문제가 발생했어요',
          description: '잠시 후 다시 시도해주세요',
        };
      } else if (error.status === 404) {
        return {
          title: '요청하신 정보를 찾을 수 없어요',
          description: '페이지를 새로고침 해주세요',
        };
      } else if (error.status >= 400) {
        return {
          title: '요청을 처리할 수 없어요',
          description: '입력 정보를 확인하고 다시 시도해주세요',
        };
      }
    }

    return {
      title: '상품을 불러오는데 실패했어요',
      description: '네트워크 연결을 확인하고 다시 시도해주세요',
    };
  })();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <Assets.Icon name="icon-exclamation-circle" />
      <Spacing size={24} />
      <Text fontSize={24} fontWeight="bold">
        {title}
      </Text>
      <Spacing size={8} />
      <Text fontSize={14} color={colors.grey600}>
        {description}
      </Text>
      <Spacing size={24} />
      <Button theme="primary" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </div>
  );
};
