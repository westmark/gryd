import {
  GridDimension,
  GridMediaQueryLayout,
  GridRowLayout,
  makeGridAreaStyle,
  toGridDimension,
} from '@gryd/react';
import update from 'immutability-helper';
import { Fragment, useCallback, useMemo } from 'react';
import { GridEditorCellDimensions } from './GridEditorCellDimensions';
import {
  GridEditorCellResizer,
  OnGutterMoveCallback,
} from './GridEditorCellResizer';
import { GridEditorCellMarker } from './GridEditorCellMarker';
import { calculateNewLayout } from './gridEditorUtils';
import { CellRenderDefinition, OnDimensionChange } from './types';
import { GridEditorAddButton, OnAddCallback } from './GridEditorAddButton';

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
  const cells: Array<CellRenderDefinition<ID>> = [];
  for (let r = 0; r < mediaQueryLayout.rows.length - 1; r++) {
    for (let c = 0; c < mediaQueryLayout.columns.length - 1; c++) {
      cells.push([
        {
          ...mediaQueryLayout.rows[r],
          index: r,
        },
        {
          ...mediaQueryLayout.columns[c],
          index: c,
        },
        r > 0 && c === 0,
        c > 0 && r === 0,
        c === mediaQueryLayout.columns.length - 2,
        r === mediaQueryLayout.rows.length - 2,
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

            const newRows = mediaQueryLayout.rows.map<GridRowLayout<ID>>(
              (row, i) => ({
                ...row,
                height: newSizes[i],
              })
            );

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

  const handleAdd = useCallback<OnAddCallback<ID>>(
    (direction, afterRowId, afterColumnId) => {
      //N
    },
    []
  );

  const rowDimensions = useMemo(
    () =>
      mediaQueryLayout.rows
        .map((r) => r.height)
        .filter((r) => Boolean(r?.unit)) as Array<GridDimension>,
    [mediaQueryLayout.rows]
  );

  const columnDimensions = useMemo(
    () =>
      mediaQueryLayout.columns
        .map((c) => c.width)
        .filter((c) => c?.unit) as Array<GridDimension>,
    [mediaQueryLayout.columns]
  );

  return (
    <>
      {cells.map(([row, column]) => (
        <GridEditorCellMarker
          key={`marker-${row.id}-${column.id}`}
          row={row}
          column={column}
        />
      ))}
      {cells.map(([row, column, showRowGutter, showColumnGutter]) =>
        showRowGutter || showColumnGutter ? (
          <GridEditorCellResizer
            key={`gutter-${row.id}-${column.id}`}
            direction={showRowGutter ? 'row' : 'column'}
            column={column}
            row={row}
            gridBoundingBox={gridBoundingBox}
            onMove={handleGutterMove}
          />
        ) : null
      )}
      {cells.map(([row, column]) => (
        <Fragment key={`gutter-add-${row.id}-${column.id}`}>
          {row.index === 0 ? (
            <GridEditorAddButton
              key={`gutter-add-${row.id}-${column.id}-row`}
              direction={'column'}
              column={column}
              columnIndex={column.index}
              row={row}
              rowIndex={row.index}
              gridBoundingBox={gridBoundingBox}
              onAdd={handleAdd}
            />
          ) : null}
          {column.index === 0 ? (
            <GridEditorAddButton
              key={`gutter-add-${row.id}-${column.id}-column`}
              direction={'row'}
              column={column}
              columnIndex={column.index}
              row={row}
              rowIndex={row.index}
              gridBoundingBox={gridBoundingBox}
              onAdd={handleAdd}
            />
          ) : null}
        </Fragment>
      ))}

      {cells.map(
        ([row, column, , , showRowDimensions, showColumnDimensions]) => (
          <Fragment key={`dimensions-${row.id}-${column.id}`}>
            {showRowDimensions && row.height && row.id && column.id ? (
              <div
                key={`dimensions-row-${row.id}-${column.id}`}
                data-key={`dimensions-row-${row.id}-${column.id}`}
                className="grid-editor-cell-dimensions-container row"
                style={makeGridAreaStyle([
                  row.id,
                  column.id,
                  'span 1',
                  'span 1',
                ])}
              >
                <GridEditorCellDimensions
                  key="row"
                  direction="row"
                  id={row.id}
                  dimension={row.height}
                  gridBoundingBox={gridBoundingBox}
                  allDimensions={rowDimensions}
                  onDimensionChange={handleCellDimensionChange}
                />
              </div>
            ) : null}
            {showColumnDimensions && column.width && column.id && row.id ? (
              <div
                key={`dimensions-column-${row.id}-${column.id}`}
                data-key={`dimensions-column-${row.id}-${column.id}`}
                className="grid-editor-cell-dimensions-container column"
                style={makeGridAreaStyle([
                  row.id,
                  column.id,
                  'span 1',
                  'span 1',
                ])}
              >
                <GridEditorCellDimensions
                  key="column"
                  direction="column"
                  id={column.id}
                  dimension={column.width}
                  gridBoundingBox={gridBoundingBox}
                  allDimensions={columnDimensions}
                  onDimensionChange={handleCellDimensionChange}
                />
              </div>
            ) : null}
          </Fragment>
        )
      )}
    </>
  );
};
