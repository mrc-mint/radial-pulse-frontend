// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  Drawer,
  DropdownMenu,
  FindingCard,
  Input,
  MetricCard,
  Modal,
  Pagination,
  ScoreCard,
  Select,
  Table,
  Tabs,
} from './index';
import { cleanup, click, getByRole, keyDown, render } from './test-utils';

afterEach(cleanup);

describe('Button', () => {
  it('defaults to type=button and blocks interaction while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save changes
      </Button>,
    );
    const button = getByRole('button', 'Save changes');
    expect(button.getAttribute('type')).toBe('button');
    // React Aria's pending state: still focusable, but presses are ignored.
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('data-pending')).toBe(true);
    click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Input', () => {
  it('links the label and marks errors for assistive tech', () => {
    const { container } = render(
      <Input label="Support email" hint="Shown to clinics" error="Enter a valid email" />,
    );
    const input = container.querySelector('input')!;
    const label = container.querySelector('label')!;
    expect(label.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const describedBy = input.getAttribute('aria-describedby')!;
    expect(document.getElementById(describedBy)?.textContent).toBe('Enter a valid email');
  });
});

describe('Select', () => {
  it('reports the chosen value', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select
        label="Status"
        value={null}
        placeholder="All"
        onChange={onChange}
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
      />,
    );
    const select = container.querySelector('select')!;
    select.value = 'b';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('is keyboard operable: opens on ArrowDown, skips disabled options, closes on Escape', async () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Status"
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B', disabled: true },
          { value: 'c', label: 'Option C' },
        ]}
      />,
    );
    const trigger = document.querySelector<HTMLElement>('button[aria-haspopup="listbox"]')!;
    const labelledBy = trigger.getAttribute('aria-labelledby')!.split(' ');
    expect(labelledBy.map((id) => document.getElementById(id)?.textContent)).toContain('Status');
    expect(trigger.textContent).toContain('Option A');
    act(() => trigger.focus());
    keyDown(trigger, 'ArrowDown');
    const listbox = getByRole('listbox');
    // Focus lands on the selected option; the disabled one is skipped.
    expect(document.activeElement?.textContent).toBe('Option A');
    keyDown(document.activeElement, 'ArrowDown');
    expect(document.activeElement?.textContent).toBe('Option C');
    keyDown(document.activeElement, 'Enter');
    expect(onChange).toHaveBeenCalledWith('c');
    expect(listbox.isConnected).toBe(false);

    keyDown(trigger, 'ArrowDown');
    keyDown(document.activeElement, 'Escape');
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Drawer', () => {
  it('closes on outside press and on its close button, with focus in the body', () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Edit Practitioner Profile" onClose={onClose}>
        <Input label="Full name" />
      </Drawer>,
    );
    expect(document.activeElement?.tagName).toBe('INPUT');
    click(getByRole('button', 'Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ScoreCard', () => {
  it('shows "Not Available" and never a zero for a missing engine', () => {
    const { container } = render(
      <ScoreCard label="Search Readiness" score={null} emptyLabel="Not Available" />,
    );
    expect(container.textContent).toContain('Not Available');
    expect(container.textContent).not.toMatch(/\b0\b/);
  });

  it('shows the caller-supplied status label for a pending component', () => {
    const { container } = render(<ScoreCard label="Website" score={null} emptyLabel="Pending" />);
    expect(container.textContent).toContain('Pending');
  });

  it('renders the backend score with an accessible scale', () => {
    const { container } = render(
      <ScoreCard
        label="Overall score"
        score={78}
        comparison={{
          label: 'Competitor benchmark',
          score: 71,
        }}
      />,
    );
    expect(container.textContent).toContain('78 out of 100');
    expect(container.textContent).toContain('Competitor benchmark71');
  });
});

describe('MetricCard', () => {
  it('renders a missing value as Not Available and hides the change', () => {
    const { container } = render(
      <MetricCard
        label="Reel views"
        value={null}
        change={{ label: '12%', direction: 'up', tone: 'success' }}
      />,
    );
    expect(container.textContent).toContain('Not Available');
    expect(container.textContent).not.toContain('12%');
  });

  it('announces the trend direction', () => {
    const { container } = render(
      <MetricCard
        label="Followers"
        value={12480}
        change={{ label: '8%', direction: 'down', tone: 'danger' }}
      />,
    );
    expect(container.textContent).toContain('Down 8%');
  });
});

describe('Tabs', () => {
  const items = [
    { value: 'all', label: 'All Clinics', count: 128 },
    { value: 'active', label: 'Active', count: 76 },
    { value: 'paused', label: 'Paused', disabled: true },
    { value: 'prospect', label: 'Prospects', count: 38 },
  ];

  it('filter-only: a radio group with one tab stop; arrows select and skip disabled', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Tabs label="Clinic status" items={items} value="active" onChange={onChange} />,
    );
    const group = getByRole('radiogroup');
    expect(group.getAttribute('aria-label')).toBe('Clinic status');
    // No tab or panel roles, so nothing points at a panel that does not exist.
    expect(document.querySelector('[role="tab"], [role="tabpanel"], [aria-controls]')).toBeNull();
    const radios = () =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    expect(radios().map((r) => r.checked)).toEqual([false, true, false, false]);
    expect(radios()[2]?.disabled).toBe(true);
    expect(radios().filter((r) => !r.disabled && r.tabIndex === 0)).toHaveLength(1);

    act(() => radios()[1]!.focus());
    keyDown(radios()[1], 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('prospect');

    rerender(<Tabs label="Clinic status" items={items} value="prospect" onChange={onChange} />);
    expect(radios().map((r) => r.checked)).toEqual([false, false, false, true]);
    expect(radios()[3]?.closest('label')?.textContent).toBe('Prospects38');
  });

  it('with panel content: WAI-ARIA tabs, arrows select, disabled tab skipped', () => {
    const onChange = vi.fn();
    render(
      <Tabs label="Clinic sections" items={items} value="active" onChange={onChange}>
        <p>Active content</p>
      </Tabs>,
    );
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    // Roving focus: only the selected tab is tabbable; the disabled one never is.
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', null, '-1']);
    expect(tabs[2]?.getAttribute('aria-disabled')).toBe('true');
    const list = getByRole('tablist');
    keyDown(list, 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('prospect');
    keyDown(list, 'Home');
    expect(onChange).toHaveBeenLastCalledWith('all');
  });

  it('wires the panel to the selected tab', () => {
    render(
      <Tabs label="Clinic sections" items={items} value="all" onChange={() => {}}>
        <p>Overview content</p>
      </Tabs>,
    );
    const panel = getByRole('tabpanel');
    const tab = document.getElementById(panel.getAttribute('aria-labelledby')!);
    expect(tab?.textContent).toContain('All Clinics');
    expect(tab?.getAttribute('aria-controls')).toBe(panel.id);
    // Every aria-controls points at an element that exists.
    for (const el of document.querySelectorAll('[aria-controls]')) {
      expect(document.getElementById(el.getAttribute('aria-controls')!)).not.toBeNull();
    }
  });
});

describe('Modal', () => {
  it('is a labelled modal dialog that closes on Escape and restores focus', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open title="Remove clinic" description="This cannot be undone." onClose={onClose}>
        <Input label="Reason" />
      </Modal>,
    );
    const dialog = getByRole('dialog');
    // Modal: React Aria hides everything outside the dialog from assistive tech.
    expect(
      opener.closest('[aria-hidden="true"]') ?? opener.getAttribute('aria-hidden'),
    ).toBeTruthy();
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Remove clinic',
    );
    // Initial focus lands in the body, not on the close button.
    expect(document.activeElement?.tagName).toBe('INPUT');

    keyDown(dialog, 'Escape');
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <Modal open={false} title="Remove clinic" onClose={onClose}>
        <Input label="Reason" />
      </Modal>,
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    // React Aria restores focus on the next animation frame.
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(document.activeElement).toBe(opener);
  });
});

describe('DropdownMenu', () => {
  it('opens, supports arrow keys and returns focus on Escape', async () => {
    const onEdit = vi.fn();
    render(
      <DropdownMenu
        label="Actions for Smile Dental Care"
        items={[
          { id: 'edit', label: 'Edit clinic', onSelect: onEdit },
          { id: 'assign', label: 'Change Digital Success Manager', onSelect: () => {} },
        ]}
      />,
    );
    const trigger = getByRole('button', 'Actions for Smile Dental Care');
    // Keyboard open (ArrowDown) focuses the first item.
    act(() => trigger.focus());
    keyDown(trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(document.activeElement).toBe(items[0]);

    keyDown(document.activeElement, 'ArrowDown');
    expect(document.activeElement).toBe(items[1]);
    keyDown(document.activeElement, 'ArrowDown');
    expect(document.activeElement).toBe(items[0]);

    keyDown(document.activeElement, 'Escape');
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(document.activeElement).toBe(trigger);

    click(trigger);
    click(getByRole('menuitem', 'Edit clinic'));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe('Table', () => {
  const columns = [{ id: 'name', header: 'Clinic name', cell: (r: { name: string }) => r.name }];

  it('shows the empty state when there are no rows', () => {
    const { container } = render(
      <Table
        caption="Clinics"
        columns={columns}
        rows={[]}
        getRowKey={(r) => r.name}
        empty={<p>No clinics match these filters</p>}
      />,
    );
    expect(container.textContent).toContain('No clinics match these filters');
  });

  it('marks the table busy while loading', () => {
    const { container } = render(
      <Table caption="Clinics" columns={columns} rows={[]} getRowKey={(r) => r.name} loading />,
    );
    expect(container.querySelector('table')?.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
  });
});

describe('Pagination', () => {
  it('summarises the range and marks the current page', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalItems={128}
        itemLabel="clinics"
        onPageChange={onPageChange}
      />,
    );
    expect(container.textContent).toContain('Showing 1–10 of 128 clinics');
    expect(getByRole('button', 'Page 1').getAttribute('aria-current')).toBe('page');
    expect((getByRole('button', 'Previous page') as HTMLButtonElement).disabled).toBe(true);
    click(getByRole('button', 'Page 13'));
    expect(onPageChange).toHaveBeenCalledWith(13);
  });
});

describe('FindingCard', () => {
  it('renders evidence with a safe external link and the observation time', () => {
    const { container } = render(
      <FindingCard
        title="Opening hours differ between website and Google Business Profile"
        priority={{ label: 'High', tone: 'high' }}
        sectionLabel="Google Business Profile"
        evidence={[
          {
            sourceUrl: 'https://www.smiledentalcare.in/contact',
            excerpt: 'Open Monday to Saturday, 9:00 to 19:00',
            provider: 'Website crawl',
            observedAt: '2024-09-12T05:00:00Z',
          },
        ]}
      />,
    );
    const link = container.querySelector('a')!;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toContain('smiledentalcare.in');
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe('2024-09-12T05:00:00Z');
    expect(container.textContent).toContain('Priority: High');
  });
});
