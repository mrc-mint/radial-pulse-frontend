import { describe, expect, it } from 'vitest';
import { getPageItems, getPageRange } from './pagination';

describe('getPageItems', () => {
  it('lists every page when they fit', () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the end near the start', () => {
    expect(getPageItems(1, 13)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 13]);
    expect(getPageItems(4, 13)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 13]);
  });

  it('collapses both sides in the middle', () => {
    expect(getPageItems(7, 13)).toEqual([1, 'ellipsis-start', 6, 7, 8, 'ellipsis-end', 13]);
  });

  it('collapses the start near the end', () => {
    expect(getPageItems(13, 13)).toEqual([1, 'ellipsis-start', 9, 10, 11, 12, 13]);
    expect(getPageItems(10, 13)).toEqual([1, 'ellipsis-start', 9, 10, 11, 12, 13]);
  });

  it('handles no pages', () => expect(getPageItems(1, 0)).toEqual([]));
});

describe('getPageRange', () => {
  it('computes the visible range', () => {
    expect(getPageRange(1, 10, 128)).toEqual({ start: 1, end: 10 });
    expect(getPageRange(13, 10, 128)).toEqual({ start: 121, end: 128 });
  });

  it('is empty for an empty list', () =>
    expect(getPageRange(1, 10, 0)).toEqual({ start: 0, end: 0 }));
});
