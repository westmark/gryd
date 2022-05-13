import {
  classNames,
  GridColumnLayout,
  GridRowLayout,
  makeGridAreaStyle,
} from '@gryd/react';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

export type OnGutterMoveCallback<ID extends string = string> = (
  gutterDirection: 'row' | 'column',
  rowId: ID,
  columnId: ID,
  pixels: number
) => void;

interface GridEditorCellGutterProps<ID extends string = string> {
  direction: 'row' | 'column';
  row: GridRowLayout<ID>;
  column: GridColumnLayout<ID>;
  gridBoundingBox?: DOMRect;
  onMove: OnGutterMoveCallback<ID>;
}

export const GridEditorCellGutter = <ID extends string = string>({
  row,
  column,
  direction,
  gridBoundingBox,
  onMove,
}: GridEditorCellGutterProps<ID>) => {
  const style = useMemo<CSSProperties | undefined>(() => {
    if (direction === 'row' && gridBoundingBox) {
      return {
        width: gridBoundingBox.height,
      };
    } else if (direction === 'column' && gridBoundingBox) {
      return {
        height: gridBoundingBox.width,
      };
    }
    return {};
  }, [direction, gridBoundingBox]);

  const lastPosition = useRef<number | undefined>(undefined);

  const moveData = useRef({
    rowId: row.id,
    columnId: column.id,
    direction,
    onMove,
  });

  moveData.current = {
    rowId: row.id,
    columnId: column.id,
    direction,
    onMove,
  };

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const newPosition =
      moveData.current.direction === 'row' ? event.clientY : event.clientX;
    const diff = newPosition - (lastPosition.current ?? newPosition);
    lastPosition.current = newPosition;
    if (diff !== 0 && moveData.current.rowId && moveData.current.columnId) {
      moveData.current.onMove(
        moveData.current.direction,
        moveData.current.rowId,
        moveData.current.columnId,
        diff
      );
    }
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      lastPosition.current =
        direction === 'row' ? event.clientY : event.clientX;
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [direction, handlePointerMove, handlePointerUp]
  );

  // Ensure listerners are removed when component is unmounted
  useEffect(
    () => () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  if (!row?.id || !column?.id) {
    return null;
  }

  return (
    <div
      className="grid-editor-cell-gutter-wrapper"
      style={makeGridAreaStyle([row.id, column.id, 'span 1', 'span 1'])}
    >
      <div
        className={classNames('grid-editor-cell-gutter', direction)}
        style={style}
        onPointerDown={handlePointerDown}
      ></div>
    </div>
  );
};
