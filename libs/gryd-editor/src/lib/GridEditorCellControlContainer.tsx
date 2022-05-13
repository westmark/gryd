import update from 'immutability-helper';
import {
  GridColumnLayout,
  GridDimension,
  GridMediaQueryLayout,
  GridRowLayout,
  toGridDimension,
} from '@gryd/react';
import { FunctionComponent, useCallback } from 'react';
import {
  GridEditorCellControl,
  OnDimensionChange,
} from './GridEditorCellControl';
import { GridEditorCellMarker } from './GridEditorCellMarker';
import {
  GridEditorCellGutter,
  OnGutterMoveCallback,
} from './GridEditorCellGutter';
import { calculateNewLayout } from './gridEditorUtils';

interface GridEditorCellControlContainerProps<ID extends string = string> {
  mediaQueryLayout: GridMediaQueryLayout<ID>;
  gridBoundingBox?: DOMRect;
  onMediaQueryChange: (mediaQueryLayout: GridMediaQueryLayout<ID>) => void;
}

export const GridEditorCellControlContainer = <ID extends string = string>({
  mediaQueryLayout,
  gridBoundingBox,
  onMediaQueryChange,
}: GridEditorCellControlContainerProps<ID>) => {
  const cells: Array<
    [GridRowLayout<ID>, GridColumnLayout<ID>, boolean, boolean]
  > = [];
  for (let r = 0; r < mediaQueryLayout.rows.length - 1; r++) {
    for (let c = 0; c < mediaQueryLayout.columns.length - 1; c++) {
      cells.push([
        mediaQueryLayout.rows[r],
        mediaQueryLayout.columns[c],
        r > 0 && c === 0,
        c > 0 && r === 0,
      ]);
    }
  }

  const handleCellDimensionChange = useCallback<OnDimensionChange<ID>>(
    (id, dimension) => {
      if (id.column) {
        const columnIndex = mediaQueryLayout.rows.findIndex(
          (c) => c.id === id.column
        );
        if (columnIndex >= 0) {
          const newMediaQueryLayout = update(mediaQueryLayout, {
            columns: {
              [columnIndex]: {
                width: { $set: dimension },
              },
            },
          });
          onMediaQueryChange(newMediaQueryLayout);
        }
      } else if (id.row) {
        const rowIndex = mediaQueryLayout.rows.findIndex(
          (r) => r.id === id.row
        );

        if (rowIndex >= 0) {
          const newMediaQueryLayout = update(mediaQueryLayout, {
            rows: {
              [rowIndex]: {
                height: { $set: dimension },
              },
            },
          });
          onMediaQueryChange(newMediaQueryLayout);
        }
      }
    },
    [mediaQueryLayout, onMediaQueryChange]
  );

  const handleGutterMove = useCallback<OnGutterMoveCallback<ID>>(
    (gutterDirection, rowId, columnId, pixels) => {
      const row = mediaQueryLayout.rows.find((r) => r.id === rowId);
      const column = mediaQueryLayout.columns.find((c) => c.id === columnId);
      if (row && column) {
        if (gutterDirection === 'row') {
          const sizes = mediaQueryLayout.rows
            .map((r) => toGridDimension(r.height))
            .filter((r) => r?.unit) as Array<GridDimension>;
          const index = mediaQueryLayout.rows.findIndex((r) => r.id === rowId);
          if (index >= 0) {
            const newSizes = calculateNewLayout(
              sizes,
              gridBoundingBox?.height ?? 0,
              index - 1,
              pixels
            );

            const newRows = mediaQueryLayout.rows.map((row, i) => ({
              ...row,
              width: newSizes[i],
            }));

            const newMediaQueryLayout = update(mediaQueryLayout, {
              rows: { $set: newRows },
            });

            onMediaQueryChange(newMediaQueryLayout);
          }
        } else {
          const sizes = mediaQueryLayout.columns
            .map((c) => toGridDimension(c.width))
            .filter((c) => c?.unit) as Array<GridDimension>;

          const index = mediaQueryLayout.columns.findIndex(
            (c) => c.id === columnId
          );

          if (index >= 0) {
            const newSizes = calculateNewLayout(
              sizes,
              gridBoundingBox?.width ?? 0,
              index - 1,
              pixels
            );

            const newColumns = mediaQueryLayout.columns.map((column, i) => ({
              ...column,
              width: newSizes[i],
            }));

            const newMediaQueryLayout = update(mediaQueryLayout, {
              columns: { $set: newColumns },
            });

            onMediaQueryChange(newMediaQueryLayout);
          }
        }
      }
    },
    [
      gridBoundingBox?.height,
      gridBoundingBox?.width,
      mediaQueryLayout,
      onMediaQueryChange,
    ]
  );

  return (
    <>
      {cells.map(([row, column]) => (
        <GridEditorCellControl
          key={`control-${row.id}-${column.id}`}
          row={row}
          column={column}
          onDimensionChange={handleCellDimensionChange}
        />
      ))}
      {cells.map(([row, column]) => (
        <GridEditorCellMarker
          key={`marker-${row.id}-${column.id}`}
          row={row}
          column={column}
        />
      ))}
      {cells.map(([row, column, showRowGutter, showColumnGutter]) =>
        showRowGutter || showColumnGutter ? (
          <GridEditorCellGutter
            key={`gutter-${row.id}-${column.id}`}
            direction={showRowGutter ? 'row' : 'column'}
            column={column}
            row={row}
            gridBoundingBox={gridBoundingBox}
            onMove={handleGutterMove}
          />
        ) : null
      )}
    </>
  );
};
