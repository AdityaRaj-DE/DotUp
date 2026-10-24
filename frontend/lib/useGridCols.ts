'use client';

import { useState, useEffect } from 'react';

/**
 * Returns current number of grid columns matching the matrix responsive layout:
 * - >= 1201px: 4 columns
 * - 861px - 1200px: 3 columns
 * - 541px - 860px: 2 columns
 * - <= 540px: 1 column
 */
export function useGridCols(): number {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    function updateCols() {
      const width = window.innerWidth;
      if (width > 1200) {
        setCols(4);
      } else if (width > 860) {
        setCols(3);
      } else if (width > 540) {
        setCols(2);
      } else {
        setCols(1);
      }
    }

    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  return cols;
}

/**
 * Helper to determine whether an item at `index` (0-based) belongs to the last row of items.
 */
export function isLastRow(index: number, totalCount: number, cols: number): boolean {
  if (totalCount === 0 || cols <= 0) return true;
  const totalRows = Math.ceil(totalCount / cols);
  const row = Math.floor(index / cols);
  return row === totalRows - 1;
}

