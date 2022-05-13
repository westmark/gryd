import {
  classNames,
  GridColumnLayout,
  GridDimension,
  GridRowLayout,
  makeGridAreaStyle,
} from '@gryd/react';
import { Pencil } from 'lucide-react';
import { useCallback } from 'react';
import { GridEditorCellDimensions } from './GridEditorCellDimensions';
import { useGridEditorContext } from './GridEditorContext';

export type OnDimensionChange<ID extends string = string> = (
  id: { row: ID; column?: never } | { row?: never; column: ID },
  dimension: GridDimension
) => void;

export interface GridEditorCellControlProps<ID extends string = string> {
  row: GridRowLayout<ID>;
  column: GridColumnLayout<ID>;
  onDimensionChange: OnDimensionChange<ID>;
}

export const GridEditorCellControl = <ID extends string = string>({
  row,
  column,
  onDimensionChange,
}: GridEditorCellControlProps<ID>) => {
  const id = `${row.id}-${column.id}`;
  const { requestEditCellId, editCellId } = useGridEditorContext();

  const onEnableClick = useCallback(() => {
    requestEditCellId(editCellId !== id ? id : undefined);
  }, [editCellId, id, requestEditCellId]);

  const enabled = editCellId === id;

  const handleDimensionChange = useCallback(
    (direction: 'row' | 'column', dimension: GridDimension) => {
      if (row.id && column.id) {
        onDimensionChange(
          direction === 'row' ? { row: row.id } : { column: column.id },
          dimension
        );
      }
    },
    [column.id, onDimensionChange, row.id]
  );

  if (!row?.id || !column?.id) {
    return null;
  }
  return (
    <div
      className={classNames('grid-editor-cell-control', enabled && 'enabled')}
      style={makeGridAreaStyle([row.id, column.id, 'span 1', 'span 1'])}
    >
      <div
        role="button"
        className="grid-editor-floating-button grid-editor-cell-control-toggle-button"
        onClick={onEnableClick}
      >
        <Pencil size="16" />
      </div>
      {enabled ? (
        <>
          <GridEditorCellDimensions
            id={`${row.id}-${column.id}-row`}
            direction="row"
            width={row.height}
            onDimensionChange={handleDimensionChange}
          />
          <GridEditorCellDimensions
            id={`${row.id}-${column.id}-column`}
            direction="column"
            height={column.width}
            onDimensionChange={handleDimensionChange}
          />
        </>
      ) : null}
    </div>
  );
};
