import { GridColumnLayout, GridDimension, GridRowLayout } from '@gryd/react';

export type OnDimensionChange<ID extends string = string> = (
  id: { row: ID; column?: never } | { row?: never; column: ID },
  dimension: GridDimension
) => void;

export type CellRenderDefinition<ID extends string = string> = [
  rows: GridRowLayout<ID> & { index: number },
  columns: GridColumnLayout<ID> & { index: number },
  showRowGutter: boolean,
  showColumnGutter: boolean,
  showRowDimensions: boolean,
  showColumnDimensions: boolean
];
