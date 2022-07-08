/* eslint-disable @typescript-eslint/no-explicit-any */
export type GridAreaDefinition<ID extends string = string> = [
  ID | number,
  ID | number,
  ID | number,
  ID | number
];

export type GridDimensionUnit = 'px' | '%' | 'fr';

export type GridDimension = {
  unit: GridDimensionUnit;
  value: number;
};

export type GridRowLayout<ID extends string = string> = {
  id?: ID;
  height?: GridDimension | null;
};

export type GridColumnLayout<ID extends string = string> = {
  id?: ID;
  width?: GridDimension | null;
};

export type GridMediaQueryLayout<ID extends string = string> = {
  minWidth: number;
  rows: Array<GridRowLayout<ID>>;
  columns: Array<GridColumnLayout<ID>>;
};

type Renderer<C = any> = (
  context?: C
) => React.ReactNode | React.ReactNode[] | JSX.Element;

export type GridCell<ID extends string = string, C = any> = {
  id: string | number;
  area: GridAreaDefinition<ID>;
  context?: C;
  content: React.ReactNode | React.ReactNode[] | Renderer<C>;
};

export type GridLayout<ID extends string = string> = {
  mediaQueries: Array<GridMediaQueryLayout<ID>>;
};
