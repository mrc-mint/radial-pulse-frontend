import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { TabsBaseProps } from '../shared';
import { cx } from './internal';
import './tabs.css';

export interface TabsProps<V extends string = string> extends TabsBaseProps<V> {
  /** Content of the selected tab. Omit when the tabs only filter a list below. */
  children?: ReactNode;
  className?: string;
}

/**
 * WAI-ARIA tabs with automatic activation: arrow keys move and select,
 * Home/End jump. Only the selected tab is in the tab order.
 */
export function Tabs<V extends string = string>({
  label,
  items,
  value,
  onChange,
  children,
  className,
}: TabsProps<V>) {
  const baseId = `rp-tabs-${useId()}`;
  const refs = useRef(new Map<V, HTMLButtonElement>());
  const enabled = items.filter((i) => !i.disabled);
  const tabId = (v: V) => `${baseId}-tab-${v}`;
  const panelId = `${baseId}-panel`;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = enabled.findIndex((i) => i.value === value);
    const last = enabled.length - 1;
    const next = {
      ArrowRight: index >= last ? 0 : index + 1,
      ArrowLeft: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = enabled[next];
    if (!target) return;
    onChange(target.value);
    refs.current.get(target.value)?.focus();
  }

  return (
    <div className={cx('rp-tabs', className)}>
      <div role="tablist" aria-label={label} className="rp-tabs__list" onKeyDown={onKeyDown}>
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(el) => {
                if (el) refs.current.set(item.value, el);
                else refs.current.delete(item.value);
              }}
              type="button"
              role="tab"
              id={tabId(item.value)}
              aria-selected={selected}
              aria-controls={children !== undefined && selected ? panelId : undefined}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className="rp-tabs__tab"
              onClick={() => onChange(item.value)}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="rp-tabs__count">{item.count.toLocaleString()}</span>
              )}
            </button>
          );
        })}
      </div>
      {children !== undefined && (
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(value)}
          tabIndex={0}
          className="rp-tabs__panel"
        >
          {children}
        </div>
      )}
    </div>
  );
}
