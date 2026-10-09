import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge that knows the theme's custom type scale (tailwind.css), so
 * `text-label` (a size) and `text-primary-foreground` (a colour) don't cancel
 * each other out.
 */
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['caption', 'label', 'body-sm', 'body', 'h2'] }],
    },
  },
});

/** shadcn's class helper: joins conditional classes and resolves Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}
