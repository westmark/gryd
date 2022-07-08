import {
  GridColumnLayout,
  GridRowLayout,
  makeGridAreaStyle,
} from '@gryd/react';

interface GridEditorCellMarkerProps<ID extends string = string> {
  row: GridRowLayout<ID>;
  column: GridColumnLayout<ID>;
}

export const GridEditorCellMarker = ({
  row,
  column,
}: GridEditorCellMarkerProps) => {
  if (!row?.id || !column?.id) {
    return null;
  }
  return (
    <div
      className="grid-editor-cell-marker"
      data-key={`marker-${row.id}-${column.id}`}
      style={makeGridAreaStyle([row.id, column.id, 'span 1', 'span 1'])}
    ></div>
  );
};
