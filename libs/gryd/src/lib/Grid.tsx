/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { GridArea } from './GridArea';
import './styles.css';
import { GridCell, GridLayout } from './types';
import {
  classNames,
  getGridDimensionString,
  getMatchedMediaQuery,
} from './utils';

interface GridProps<ID extends string = string, C = any> {
  layout: GridLayout<ID>;
  cells?: Array<GridCell<ID, C>>;
  className?: string;
}

const GridInner = <ID extends string = string, C = any>(
  { layout, cells, className, children }: PropsWithChildren<GridProps<ID, C>>,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const [mediaQueryLayout, setMediaQueryLayout] = useState(
    useMemo(
      () => getMatchedMediaQuery(layout.mediaQueries),
      [layout.mediaQueries]
    )
  );

  useEffect(() => {
    setMediaQueryLayout(getMatchedMediaQuery(layout.mediaQueries));
  }, [layout.mediaQueries]);

  const gridStyle = useMemo<CSSProperties>(
    () => ({
      gridTemplateColumns: mediaQueryLayout?.columns
        .map((column) =>
          column.id
            ? `[${column.id}] ${getGridDimensionString(column.width) ?? ''}`
            : getGridDimensionString(column.width)
        )
        .join(' '),
      gridTemplateRows: mediaQueryLayout?.rows
        .map((row) =>
          row.id
            ? `[${row.id}] ${getGridDimensionString(row.height) ?? ''}`
            : getGridDimensionString(row.height)
        )
        .join(' '),
    }),
    [mediaQueryLayout?.columns, mediaQueryLayout?.rows]
  );

  if (!mediaQueryLayout) {
    return null;
  }

  return (
    <div
      className={classNames('gryd-grid-container', className)}
      style={gridStyle}
      ref={ref}
    >
      {children}
      {cells?.map((cell) => (
        <GridArea key={cell.id} area={cell.area}>
          {typeof cell.content === 'function'
            ? cell.content(cell.context)
            : cell.content}
        </GridArea>
      ))}
    </div>
  );
};

export const Grid = forwardRef(GridInner);
