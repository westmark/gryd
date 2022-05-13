import {
  classNames,
  getGridDimensionString,
  GridColumnLayout,
  GridDimension,
  GridDimensionUnit,
  GridRowLayout,
  makeGridAreaStyle,
  toGridDimension,
} from '@gryd/react';
import { Check, Cross, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMouseHover } from './gridEditorUtils';

interface GridEditorCellDimensionsPropsBase {
  id: string;
  direction: 'row' | 'column';
  onDimensionChange: (
    direction: 'row' | 'column',
    dimension: GridDimension
  ) => void;
}

type GridEditorCellDimensionsProps<ID extends string = string> =
  | (GridEditorCellDimensionsPropsBase & {
      row?: GridRowLayout<ID>;
      column?: GridColumnLayout<ID>;
      width?: never;
      height?: never;
    })
  | (GridEditorCellDimensionsPropsBase & {
      row?: never;
      column?: never;
      width?: GridDimension | string;
      height?: GridDimension | string;
    });

export const GridEditorCellDimensions = <ID extends string = string>({
  id,
  row,
  column,
  width,
  height,
  direction,
  onDimensionChange,
}: GridEditorCellDimensionsProps<ID>) => {
  const { isMouseOver, setHalt, ...listeners } = useMouseHover({
    leaveTimeout: 1000,
  });

  const [dirty, setDirty] = useState(false);

  const resetValues = useCallback(() => {
    let dim: GridDimension | null;
    if (direction === 'row') {
      dim = toGridDimension(row?.height ?? width);
    } else {
      dim = toGridDimension(column?.width ?? height);
    }
    if (dim) {
      setValue(dim.value);
      setUnit(dim.unit);
    }
    setValueError(false);
  }, [direction, height, row, width, column]);

  const dimension = useMemo(() => {
    if (direction === 'row') {
      return toGridDimension(row?.height ?? width);
    } else {
      return toGridDimension(column?.width ?? height);
    }
  }, [column?.width, direction, height, row?.height, width]);

  const [unit, setUnit] = useState<GridDimensionUnit>(dimension?.unit ?? 'px');
  const [value, setValue] = useState<GridDimension['value'] | null>(
    dimension?.value ?? 0
  );
  const [strValue, setStrValue] = useState<string>(value?.toString() ?? '');
  const [valueError, setValueError] = useState(false);

  useEffect(() => {
    resetValues();
  }, [resetValues]);

  useEffect(() => {
    if (!isMouseOver) {
      resetValues();
    }
  }, [isMouseOver, resetValues]);

  const handleUnitChange = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const unit = event.currentTarget.getAttribute('data-unit');
      setUnit(unit as GridDimensionUnit);
      setHalt(true);
      setDirty(true);
    },
    [setHalt]
  );

  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setStrValue(event.target.value);
      if (typeof value === 'number' && !Number.isNaN(value)) {
        setValue(value);
        setHalt(true);
        setDirty(true);
        setValueError(false);
      } else {
        setValue(null);
      }
    },
    [setHalt]
  );

  const handleCommit = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (
        value !== null &&
        event.currentTarget.getAttribute('data-action') === 'commit'
      ) {
        onDimensionChange(direction, { value, unit });
      } else {
        resetValues();
      }
      setDirty(false);
      setHalt(false);
    },
    [direction, onDimensionChange, resetValues, setHalt, unit, value]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (value !== null && !valueError && event.key === 'Enter') {
        onDimensionChange(direction, { value, unit });
        setDirty(false);
        setHalt(false);
      }
      if (value === null) {
        setValueError(true);
      }
    },
    [direction, onDimensionChange, setHalt, unit, value, valueError]
  );

  const handleInputFocus = useCallback(() => setHalt(true), [setHalt]);
  const handleInputBlur = useCallback(() => {
    if (value === null) {
      setValueError(true);
    } else {
      setHalt(true);
    }
  }, [setHalt, value]);

  return (
    <div
      className={classNames(
        'grid-editor-cell-dimensions',
        'grid-editor-floating-button',
        direction,
        isMouseOver && 'expanded'
      )}
      style={
        row?.id && column?.id
          ? makeGridAreaStyle([row.id, column.id, 'span 1', 'span 1'])
          : undefined
      }
      {...listeners}
    >
      {isMouseOver ? (
        <>
          <input
            type="text"
            value={strValue}
            onChange={handleValueChange}
            className={classNames(
              'grid-editor-cell-dimensions__value-input',
              valueError && 'error'
            )}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
          />
          <div className="grid-editor-cell-dimensions__unit-picker">
            <div
              className={classNames(
                'grid-editor-cell-dimensions__unit-picker-button',
                unit === 'px' && 'selected'
              )}
              role="button"
              onClick={handleUnitChange}
              data-unit="px"
            >
              px
            </div>
            <div
              className={classNames(
                'grid-editor-cell-dimensions__unit-picker-button',
                unit === '%' && 'selected'
              )}
              role="button"
              onClick={handleUnitChange}
              data-unit="%"
            >
              %
            </div>
            <div
              className={classNames(
                'grid-editor-cell-dimensions__unit-picker-button',
                unit === 'fr' && 'selected'
              )}
              role="button"
              onClick={handleUnitChange}
              data-unit="fr"
            >
              fr
            </div>
          </div>
          {dirty ? (
            <>
              <button
                className="grid-editor-cell-dimensions__commit-button"
                data-action="cancel"
                onClick={handleCommit}
              >
                <X size="14" color="#EB6232" />
              </button>
              <button
                className="grid-editor-cell-dimensions__commit-button"
                data-action="commit"
                onClick={handleCommit}
              >
                <Check size="14" color="#48A22A" />
              </button>
            </>
          ) : null}
        </>
      ) : direction === 'row' ? (
        getGridDimensionString(width ?? row?.height)
      ) : (
        getGridDimensionString(height ?? column?.width)
      )}
    </div>
  );
};
