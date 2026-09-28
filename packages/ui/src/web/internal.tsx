import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  ExternalLink,
  Inbox,
  Minus,
  Search,
  TriangleAlert,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

/** Joins truthy class names. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Glyphs the primitives themselves need, from Lucide (the web icon library,
 * ADR 0007) with the primitives' default size. Decorative by default.
 */
function glyph(Icon: LucideIcon) {
  function Glyph(props: LucideProps) {
    return <Icon size={16} aria-hidden="true" focusable="false" {...props} />;
  }
  Glyph.displayName = `${Icon.displayName ?? 'Icon'}Glyph`;
  return Glyph;
}

export const ChevronDownIcon = glyph(ChevronDown);
export const ChevronLeftIcon = glyph(ChevronLeft);
export const ChevronRightIcon = glyph(ChevronRight);
export const SearchIcon = glyph(Search);
export const CloseIcon = glyph(X);
export const MoreIcon = glyph(Ellipsis);
export const ArrowUpIcon = glyph(ArrowUp);
export const ArrowDownIcon = glyph(ArrowDown);
export const MinusIcon = glyph(Minus);
export const AlertIcon = glyph(TriangleAlert);
export const InboxIcon = glyph(Inbox);
export const ExternalLinkIcon = glyph(ExternalLink);
