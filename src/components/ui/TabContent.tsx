interface TabContentProps<T extends string | number> {
  tab: T;
  content: Record<T, React.ReactNode>;
}

export function TabContent<T extends string | number>({ tab, content }: TabContentProps<T>) {
  return content[tab];
}
