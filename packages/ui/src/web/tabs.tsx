import type { ReactNode } from 'react';
import { Radio, RadioGroup, Tab, TabList, TabPanel, Tabs as AriaTabs } from 'react-aria-components';
import type { TabsBaseProps } from '../shared';
import { cn } from './lib/utils';

export interface TabsProps<V extends string = string> extends TabsBaseProps<V> {
  /** Content of the selected tab. Omit when the tabs only filter a list below. */
  children?: ReactNode;
  className?: string;
}

const LIST = 'flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none]';

/** One look for both patterns; `data-selected` is set by Tab and Radio alike. */
const TAB = cn(
  'group relative inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-sm border-0 bg-transparent px-3',
  'text-label font-medium text-secondary-foreground outline-none [font-family:inherit]',
  "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-t-[2px] after:content-['']",
  'hover:not-data-[disabled]:text-foreground',
  'data-[selected]:font-semibold data-[selected]:text-link data-[selected]:after:bg-primary',
  'select-none data-[focus-visible]:shadow-[inset_var(--rp-shadow-focus)]',
  'data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled',
);

const COUNT = cn(
  'inline-flex h-5 items-center rounded-full bg-muted px-1.5 text-caption font-medium text-secondary-foreground',
  'group-data-[selected]:bg-brand-subtle group-data-[selected]:text-brand',
);

/**
 * Two accessible patterns, chosen by whether there is panel content:
 *
 * - With `children`: WAI-ARIA tabs (React Aria Tabs). Automatic activation:
 *   arrow keys move and select, Home/End jump; the panel is labelled by the
 *   selected tab.
 * - Without `children` (the tabs only filter content rendered elsewhere): a
 *   radio group (React Aria RadioGroup), so nothing points at a panel that
 *   does not exist. One tab stop; arrow keys move and select, disabled
 *   options are skipped, and the choice is announced as checked.
 *
 * Both look the same.
 */
export function Tabs<V extends string = string>({
  label,
  items,
  value,
  onChange,
  children,
  className,
}: TabsProps<V>) {
  const content = (item: TabsProps<V>['items'][number]) => (
    <>
      {item.label}
      {item.count !== undefined && <span className={COUNT}>{item.count.toLocaleString()}</span>}
    </>
  );

  if (children === undefined) {
    return (
      <RadioGroup
        aria-label={label}
        orientation="horizontal"
        value={value}
        onChange={(next) => onChange(next as V)}
        className={cn(LIST, className)}
      >
        {items.map((item) => (
          <Radio key={item.value} value={item.value} isDisabled={item.disabled} className={TAB}>
            {content(item)}
          </Radio>
        ))}
      </RadioGroup>
    );
  }

  return (
    <AriaTabs
      selectedKey={value}
      onSelectionChange={(key) => onChange(String(key) as V)}
      disabledKeys={items.filter((i) => i.disabled).map((i) => i.value)}
      keyboardActivation="automatic"
      className={className}
    >
      <TabList aria-label={label} className={LIST}>
        {items.map((item) => (
          <Tab key={item.value} id={item.value} className={TAB}>
            {content(item)}
          </Tab>
        ))}
      </TabList>
      <TabPanel
        id={value}
        className="pt-5 outline-none data-[focus-visible]:rounded-sm data-[focus-visible]:shadow-focus"
      >
        {children}
      </TabPanel>
    </AriaTabs>
  );
}
