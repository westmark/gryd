import {
  GridColumnLayout,
  GridRowLayout,
  makeGridAreaStyle,
} from '@gryd/react';
import { BoxSelect, Plus } from 'lucide-react';
import { CSSProperties, FunctionComponent, useCallback, useMemo } from 'react';

export type OnAddCallback<ID extends string = string> = (
  gutterDirection: 'row' | 'column',
  afterRowId: ID | null,
  afterColumnId: ID | null
) => void;

interface GridEditorAddButtonProps<ID extends string = string> {
  direction: 'row' | 'column';
  row: GridRowLayout<ID>;
  rowIndex: number;
  column: GridColumnLayout<ID>;
  columnIndex: number;
  gridBoundingBox?: DOMRect;
  onAdd: OnAddCallback<ID>;
}

export const GridEditorAddButton = <ID extends string = string>({
  direction,
  row,
  rowIndex,
  column,
  columnIndex,
  gridBoundingBox,
  onAdd,
}: GridEditorAddButtonProps<ID>) => {
  const zeroIndexButtonStyle = useMemo<CSSProperties | undefined>(() => {
    if (direction === 'row' && gridBoundingBox) {
      return {
        left: gridBoundingBox.width,
        marginLeft: '1rem',
        transform: 'translateY(-50%)',
      };
    } else if (direction === 'column' && gridBoundingBox) {
      return {
        top: gridBoundingBox.height,
        transform: 'translateX(-50%)',
      };
    }
    return {};
  }, [direction, gridBoundingBox]);

  const addButtonStyle = useMemo<CSSProperties | undefined>(() => {
    if (direction === 'row' && gridBoundingBox) {
      return {
        ...zeroIndexButtonStyle,
        top: '100%',
      };
    } else if (direction === 'column' && gridBoundingBox) {
      return {
        ...zeroIndexButtonStyle,
        left: '100%',
      };
    }
    return {};
  }, [direction, gridBoundingBox, zeroIndexButtonStyle]);

  const handleAdd = useCallback(() => {
    onAdd(
      direction,
      direction === 'row' && row.id ? row.id : null,
      direction === 'column' && column.id ? column.id : null
    );
  }, [column.id, direction, onAdd, row.id]);

  return (
    <div
      className="grid-editor-cell-gutter-wrapper"
      style={makeGridAreaStyle([
        row.id ?? 0,
        column.id ?? 0,
        'span 1',
        'span 1',
      ])}
      data-key={`gutter-${row.id}-${column.id}`}
    >
      {direction === 'row' && rowIndex === 0 ? (
        <div
          className={`grid-editor-cell-gutter-add grid-editor-cell-gutter-add__${direction}`}
          style={zeroIndexButtonStyle}
          role="button"
          aria-label="Add"
          onClick={handleAdd}
        >
          <Plus size={16} />
          <BoxSelect size={20} />
        </div>
      ) : null}
      <div
        className={`grid-editor-cell-gutter-add grid-editor-cell-gutter-add__${direction}`}
        style={addButtonStyle}
        role="button"
        aria-label="Add"
        onClick={handleAdd}
      >
        <Plus size={16} />
        <BoxSelect size={20} />
      </div>
    </div>
  );
};
